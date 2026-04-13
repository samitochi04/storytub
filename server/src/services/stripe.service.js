import env from "../config/env.js";
import stripe from "../config/stripe.js";
import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";
import { Errors } from "../lib/errors.js";
import { addCredits } from "./credit.service.js";

const PLAN_PRICE_IDS = {
  starter: {
    monthly: env.stripePrices.starterMonthly,
    yearly: env.stripePrices.starterYearly,
  },
  premium: {
    monthly: env.stripePrices.premiumMonthly,
    yearly: env.stripePrices.premiumYearly,
  },
};

const BUNDLE_PRICE_IDS = {
  starter_pack: env.stripePrices.bundleStarter,
  creator_pack: env.stripePrices.bundleCreator,
  pro_pack: env.stripePrices.bundlePro,
  studio_pack: env.stripePrices.bundleStudio,
};

const PLAN_LEVELS = {
  free: 0,
  starter: 1,
  premium: 2,
};

function toIso(unixSeconds) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

function normalizeSubscriptionStatus(stripeStatus, pauseCollection) {
  if (pauseCollection || stripeStatus === "paused") return "paused";
  if (stripeStatus === "active") return "active";
  if (stripeStatus === "trialing") return "trialing";
  if (stripeStatus === "past_due" || stripeStatus === "unpaid")
    return "past_due";
  if (stripeStatus === "canceled") return "canceled";
  return "incomplete";
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, stripe_customer_id, stripe_subscription_id, subscription_plan, subscription_status",
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    logger.error({ error, userId }, "Profile lookup failed");
    throw Errors.notFound("User profile not found");
  }

  return data;
}

async function getSubscriptionPlan(planId) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      "id, credits_monthly, is_active, stripe_price_id_monthly, stripe_price_id_yearly",
    )
    .eq("id", planId)
    .single();

  if (error || !data || !data.is_active) {
    throw Errors.badRequest("Invalid subscription plan");
  }

  return data;
}

async function getCreditBundle(bundleId) {
  const { data, error } = await supabase
    .from("credit_bundles")
    .select("id, credits, is_active, stripe_price_id")
    .eq("id", bundleId)
    .single();

  if (error || !data || !data.is_active) {
    throw Errors.badRequest("Invalid credit bundle");
  }

  return data;
}

function resolvePlanPriceId(plan, interval) {
  const priceId =
    (interval === "yearly"
      ? plan.stripe_price_id_yearly
      : plan.stripe_price_id_monthly) || PLAN_PRICE_IDS[plan.id]?.[interval];

  if (!priceId) {
    throw Errors.badRequest(
      `Stripe price not configured for ${plan.id} (${interval})`,
    );
  }

  return priceId;
}

function resolveBundlePriceId(bundle) {
  const priceId = bundle.stripe_price_id || BUNDLE_PRICE_IDS[bundle.id];

  if (!priceId) {
    throw Errors.badRequest(
      `Stripe price not configured for bundle ${bundle.id}`,
    );
  }

  return priceId;
}

async function ensureStripeCustomer(userId) {
  const profile = await getProfile(userId);

  if (profile.stripe_customer_id) {
    return { customerId: profile.stripe_customer_id, profile };
  }

  const customer = await stripe.customers.create({
    email: profile.email,
    metadata: { user_id: userId },
  });

  const { error } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  if (error) {
    logger.error(
      { error, userId, customerId: customer.id },
      "Failed to persist Stripe customer ID",
    );
    throw error;
  }

  return {
    customerId: customer.id,
    profile: { ...profile, stripe_customer_id: customer.id },
  };
}

async function findUserByCustomerId(customerId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, subscription_plan")
    .eq("stripe_customer_id", customerId)
    .single();

  if (error || !data) {
    logger.warn({ error, customerId }, "No profile found for Stripe customer");
    return null;
  }

  return data;
}

async function createPaymentRecord(values) {
  const { data, error } = await supabase
    .from("payments")
    .insert(values)
    .select("id")
    .single();

  if (error) {
    const isDuplicate = error.code === "23505";
    if (!isDuplicate) {
      logger.error({ error, values }, "Failed to create payment record");
      throw error;
    }

    if (values.stripe_payment_intent_id) {
      const { data: existing } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_payment_intent_id", values.stripe_payment_intent_id)
        .single();

      return existing?.id ?? null;
    }

    return null;
  }

  return data.id;
}

async function hasProcessedEvent(stripeEventId) {
  const { data, error } = await supabase
    .from("billing_events")
    .select("id")
    .eq("stripe_event_id", stripeEventId)
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error({ error, stripeEventId }, "Billing event lookup failed");
    throw error;
  }

  return Boolean(data);
}

async function recordBillingEvent(values) {
  const { error } = await supabase.from("billing_events").insert(values);

  if (error) {
    const isDuplicate = error.code === "23505";
    if (!isDuplicate) {
      logger.error({ error, values }, "Failed to record billing event");
      throw error;
    }
  }
}

async function syncProfileSubscription(userId, values) {
  const { error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", userId);

  if (error) {
    logger.error(
      { error, userId, values },
      "Failed to update profile subscription state",
    );
    throw error;
  }
}

async function upsertSubscriptionState({
  userId,
  planId,
  stripeSubscriptionId,
  stripeCustomerId,
  status,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  canceledAt,
  trialStart,
  trialEnd,
}) {
  const lookup = stripeSubscriptionId
    ? await supabase
        .from("subscriptions")
        .select("id, plan_id")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .maybeSingle()
    : await supabase
        .from("subscriptions")
        .select("id, plan_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  if (lookup.error) {
    logger.error(
      { error: lookup.error, userId, stripeSubscriptionId },
      "Subscription lookup failed",
    );
    throw lookup.error;
  }

  const payload = {
    user_id: userId,
    plan_id: planId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    status,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: cancelAtPeriodEnd ?? false,
    canceled_at: canceledAt,
    trial_start: trialStart,
    trial_end: trialEnd,
  };

  if (lookup.data?.id) {
    const { error } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", lookup.data.id);

    if (error) {
      logger.error(
        { error, userId, stripeSubscriptionId },
        "Subscription update failed",
      );
      throw error;
    }

    return { id: lookup.data.id, previousPlan: lookup.data.plan_id };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    logger.error(
      { error, userId, stripeSubscriptionId },
      "Subscription insert failed",
    );
    throw error;
  }

  return { id: data.id, previousPlan: null };
}

async function getPlanIdFromPriceId(priceId) {
  if (!priceId) return null;

  for (const [planId, intervals] of Object.entries(PLAN_PRICE_IDS)) {
    if (Object.values(intervals).includes(priceId)) {
      return planId;
    }
  }

  const { data } = await supabase
    .from("subscription_plans")
    .select("id")
    .or(
      `stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`,
    )
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

function classifyPlanChange(previousPlan, nextPlan) {
  if (!previousPlan || previousPlan === nextPlan) return null;
  if ((PLAN_LEVELS[nextPlan] ?? 0) > (PLAN_LEVELS[previousPlan] ?? 0)) {
    return "subscription_upgraded";
  }
  return "subscription_downgraded";
}

async function grantSubscriptionCredits(
  userId,
  planId,
  referenceId,
  description,
) {
  const plan = await getSubscriptionPlan(planId);
  if (plan.credits_monthly > 0) {
    await addCredits(
      userId,
      plan.credits_monthly,
      "subscription",
      referenceId,
      description,
    );
  }
  return plan;
}

export async function createCheckoutSession({
  userId,
  purchaseType,
  planId,
  bundleId,
  interval = "monthly",
}) {
  const { customerId } = await ensureStripeCustomer(userId);
  const baseUrl = env.frontendUrl.replace(/\/$/, "");

  if (purchaseType === "subscription") {
    if (!planId || !["starter", "premium"].includes(planId)) {
      throw Errors.badRequest("plan_id must be 'starter' or 'premium'");
    }

    if (!["monthly", "yearly"].includes(interval)) {
      throw Errors.badRequest("interval must be 'monthly' or 'yearly'");
    }

    const plan = await getSubscriptionPlan(planId);
    const priceId = resolvePlanPriceId(plan, interval);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: {
        user_id: userId,
        purchase_type: purchaseType,
        plan_id: planId,
        interval,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          purchase_type: purchaseType,
          plan_id: planId,
          interval,
        },
      },
    });

    return session;
  }

  if (purchaseType !== "bundle") {
    throw Errors.badRequest("purchase_type must be 'subscription' or 'bundle'");
  }

  if (!bundleId) {
    throw Errors.badRequest("bundle_id is required for bundle checkout");
  }

  const bundle = await getCreditBundle(bundleId);
  const priceId = resolveBundlePriceId(bundle);

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing/cancel`,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: {
      user_id: userId,
      purchase_type: purchaseType,
      bundle_id: bundleId,
    },
  });
}

export async function createPortalSession(userId) {
  const profile = await getProfile(userId);

  if (!profile.stripe_customer_id) {
    throw Errors.badRequest("No Stripe customer found for this account");
  }

  return stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${env.frontendUrl.replace(/\/$/, "")}/billing`,
  });
}

export function verifyStripeWebhook(rawBody, signature) {
  if (!signature) {
    throw Errors.unauthorized("Missing Stripe signature");
  }

  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.stripeWebhookSecret,
  );
}

async function handleCheckoutCompleted(event, session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    logger.warn(
      { eventId: event.id, sessionId: session.id },
      "Checkout session missing user_id metadata",
    );
    return;
  }

  if (session.metadata?.purchase_type === "bundle") {
    const bundleId = session.metadata.bundle_id;
    const bundle = await getCreditBundle(bundleId);

    await addCredits(
      userId,
      bundle.credits,
      "bundle",
      session.payment_intent || session.id,
      `Bundle purchase: ${bundleId}`,
    );

    const paymentId = await createPaymentRecord({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent || null,
      stripe_invoice_id: null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency || "usd",
      status: "succeeded",
      payment_type: "bundle",
      plan_id: null,
      bundle_id: bundleId,
      coupon_id: null,
      discount_amount_cents: session.total_details?.amount_discount ?? 0,
      receipt_url: null,
      invoice_pdf_url: null,
      description: `Bundle purchase: ${bundleId}`,
      metadata: session.metadata,
    });

    await recordBillingEvent({
      user_id: userId,
      event_type: "bundle_purchased",
      stripe_event_id: event.id,
      subscription_id: null,
      payment_id: paymentId,
      previous_plan: null,
      new_plan: null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency || "usd",
      metadata: session.metadata,
    });

    return;
  }

  const planId = session.metadata?.plan_id;
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!planId || !stripeSubscriptionId) {
    logger.warn(
      { eventId: event.id, sessionId: session.id },
      "Subscription checkout missing plan or subscription ID",
    );
    return;
  }

  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const status = normalizeSubscriptionStatus(
    subscription.status,
    subscription.pause_collection,
  );
  const subscriptionState = await upsertSubscriptionState({
    userId,
    planId,
    stripeSubscriptionId,
    stripeCustomerId: String(session.customer),
    status,
    currentPeriodStart: toIso(subscription.current_period_start),
    currentPeriodEnd: toIso(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: toIso(subscription.canceled_at),
    trialStart: toIso(subscription.trial_start),
    trialEnd: toIso(subscription.trial_end),
  });

  await syncProfileSubscription(userId, {
    stripe_customer_id: String(session.customer),
    stripe_subscription_id: stripeSubscriptionId,
    subscription_plan: planId,
    subscription_status: status,
  });

  await grantSubscriptionCredits(
    userId,
    planId,
    stripeSubscriptionId,
    `Subscription start: ${planId}`,
  );

  const paymentId = await createPaymentRecord({
    user_id: userId,
    stripe_payment_intent_id: session.payment_intent || null,
    stripe_invoice_id:
      typeof session.invoice === "string" ? session.invoice : null,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency || "usd",
    status: "succeeded",
    payment_type: "subscription",
    plan_id: planId,
    bundle_id: null,
    coupon_id: null,
    discount_amount_cents: session.total_details?.amount_discount ?? 0,
    receipt_url: null,
    invoice_pdf_url: null,
    description: `Subscription start: ${planId}`,
    metadata: session.metadata,
  });

  await recordBillingEvent({
    user_id: userId,
    event_type: "subscription_created",
    stripe_event_id: event.id,
    subscription_id: subscriptionState.id,
    payment_id: paymentId,
    previous_plan: subscriptionState.previousPlan,
    new_plan: planId,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency || "usd",
    metadata: session.metadata,
  });
}

async function handleInvoicePaymentSucceeded(event, invoice) {
  if (invoice.billing_reason !== "subscription_cycle") {
    return;
  }

  const user = await findUserByCustomerId(String(invoice.customer));
  if (!user) return;

  const priceId = invoice.lines?.data?.[0]?.price?.id;
  const planId = await getPlanIdFromPriceId(priceId);
  if (!planId) {
    logger.warn(
      { eventId: event.id, priceId },
      "Could not map renewal invoice price to plan",
    );
    return;
  }

  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;
  const subscription = stripeSubscriptionId
    ? await stripe.subscriptions.retrieve(stripeSubscriptionId)
    : null;
  const status = normalizeSubscriptionStatus(
    subscription?.status || "active",
    subscription?.pause_collection,
  );
  const subscriptionState = await upsertSubscriptionState({
    userId: user.id,
    planId,
    stripeSubscriptionId,
    stripeCustomerId: String(invoice.customer),
    status,
    currentPeriodStart: toIso(subscription?.current_period_start),
    currentPeriodEnd: toIso(subscription?.current_period_end),
    cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    canceledAt: toIso(subscription?.canceled_at),
    trialStart: toIso(subscription?.trial_start),
    trialEnd: toIso(subscription?.trial_end),
  });

  await syncProfileSubscription(user.id, {
    stripe_customer_id: String(invoice.customer),
    stripe_subscription_id: stripeSubscriptionId,
    subscription_plan: planId,
    subscription_status: status,
  });

  await grantSubscriptionCredits(
    user.id,
    planId,
    invoice.id,
    `Subscription renewal: ${planId}`,
  );

  const paymentId = await createPaymentRecord({
    user_id: user.id,
    stripe_payment_intent_id:
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : null,
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_paid ?? invoice.amount_due ?? 0,
    currency: invoice.currency || "usd",
    status: "succeeded",
    payment_type: "subscription",
    plan_id: planId,
    bundle_id: null,
    coupon_id: null,
    discount_amount_cents: invoice.total_discount_amounts?.[0]?.amount ?? 0,
    receipt_url: invoice.hosted_invoice_url || null,
    invoice_pdf_url: invoice.invoice_pdf || null,
    description: `Subscription renewal: ${planId}`,
    metadata: {
      stripe_event_id: event.id,
      billing_reason: invoice.billing_reason,
    },
  });

  await recordBillingEvent({
    user_id: user.id,
    event_type: "subscription_renewed",
    stripe_event_id: event.id,
    subscription_id: subscriptionState.id,
    payment_id: paymentId,
    previous_plan: planId,
    new_plan: planId,
    amount_cents: invoice.amount_paid ?? invoice.amount_due ?? 0,
    currency: invoice.currency || "usd",
    metadata: { stripe_invoice_id: invoice.id },
  });
}

async function handleInvoicePaymentFailed(event, invoice) {
  const user = await findUserByCustomerId(String(invoice.customer));
  if (!user) return;

  const priceId = invoice.lines?.data?.[0]?.price?.id;
  const planId = await getPlanIdFromPriceId(priceId);
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (stripeSubscriptionId) {
    await upsertSubscriptionState({
      userId: user.id,
      planId: planId || user.subscription_plan || "free",
      stripeSubscriptionId,
      stripeCustomerId: String(invoice.customer),
      status: "past_due",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialStart: null,
      trialEnd: null,
    });
  }

  await syncProfileSubscription(user.id, {
    stripe_customer_id: String(invoice.customer),
    stripe_subscription_id: stripeSubscriptionId || null,
    subscription_plan: planId || user.subscription_plan || "free",
    subscription_status: "past_due",
  });

  const paymentId = await createPaymentRecord({
    user_id: user.id,
    stripe_payment_intent_id:
      typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : null,
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_due ?? 0,
    currency: invoice.currency || "usd",
    status: "failed",
    payment_type: "subscription",
    plan_id: planId,
    bundle_id: null,
    coupon_id: null,
    discount_amount_cents: invoice.total_discount_amounts?.[0]?.amount ?? 0,
    receipt_url: null,
    invoice_pdf_url: invoice.invoice_pdf || null,
    description: `Subscription payment failed${planId ? `: ${planId}` : ""}`,
    metadata: {
      stripe_event_id: event.id,
      billing_reason: invoice.billing_reason,
    },
  });

  await recordBillingEvent({
    user_id: user.id,
    event_type: "payment_failed",
    stripe_event_id: event.id,
    subscription_id: null,
    payment_id: paymentId,
    previous_plan: planId || null,
    new_plan: planId || null,
    amount_cents: invoice.amount_due ?? 0,
    currency: invoice.currency || "usd",
    metadata: { stripe_invoice_id: invoice.id },
  });
}

async function handleSubscriptionUpdated(event, subscription) {
  const user = await findUserByCustomerId(String(subscription.customer));
  if (!user) return;

  const priceId = subscription.items?.data?.[0]?.price?.id;
  const planId =
    (await getPlanIdFromPriceId(priceId)) || user.subscription_plan || "free";
  const status = normalizeSubscriptionStatus(
    subscription.status,
    subscription.pause_collection,
  );
  const subscriptionState = await upsertSubscriptionState({
    userId: user.id,
    planId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: String(subscription.customer),
    status,
    currentPeriodStart: toIso(subscription.current_period_start),
    currentPeriodEnd: toIso(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: toIso(subscription.canceled_at),
    trialStart: toIso(subscription.trial_start),
    trialEnd: toIso(subscription.trial_end),
  });

  await syncProfileSubscription(user.id, {
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    subscription_plan: planId,
    subscription_status: status,
  });

  const eventType =
    status === "paused"
      ? "subscription_paused"
      : classifyPlanChange(
          subscriptionState.previousPlan || user.subscription_plan,
          planId,
        );

  if (!eventType) {
    return;
  }

  await recordBillingEvent({
    user_id: user.id,
    event_type: eventType,
    stripe_event_id: event.id,
    subscription_id: subscriptionState.id,
    payment_id: null,
    previous_plan: subscriptionState.previousPlan || user.subscription_plan,
    new_plan: planId,
    amount_cents: null,
    currency: "usd",
    metadata: { stripe_subscription_id: subscription.id, status },
  });
}

async function handleSubscriptionDeleted(event, subscription) {
  const user = await findUserByCustomerId(String(subscription.customer));
  if (!user) return;

  const subscriptionState = await upsertSubscriptionState({
    userId: user.id,
    planId: user.subscription_plan || "free",
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: String(subscription.customer),
    status: "canceled",
    currentPeriodStart: toIso(subscription.current_period_start),
    currentPeriodEnd: toIso(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: toIso(subscription.canceled_at) || new Date().toISOString(),
    trialStart: toIso(subscription.trial_start),
    trialEnd: toIso(subscription.trial_end),
  });

  await syncProfileSubscription(user.id, {
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    subscription_plan: "free",
    subscription_status: "canceled",
  });

  await recordBillingEvent({
    user_id: user.id,
    event_type: "subscription_canceled",
    stripe_event_id: event.id,
    subscription_id: subscriptionState.id,
    payment_id: null,
    previous_plan: subscriptionState.previousPlan || user.subscription_plan,
    new_plan: "free",
    amount_cents: null,
    currency: "usd",
    metadata: { stripe_subscription_id: subscription.id },
  });
}

export async function handleStripeWebhook(event) {
  if (await hasProcessedEvent(event.id)) {
    logger.info(
      { eventId: event.id, type: event.type },
      "Skipping already-processed Stripe event",
    );
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event, event.data.object);
      return;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event, event.data.object);
      return;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event, event.data.object);
      return;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event, event.data.object);
      return;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event, event.data.object);
      return;

    default:
      logger.info(
        { eventId: event.id, type: event.type },
        "Ignoring unhandled Stripe event",
      );
  }
}
