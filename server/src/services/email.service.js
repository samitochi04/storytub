import nodemailer from "nodemailer";
import env from "../config/env.js";
import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";
import { emailQueue } from "../jobs/queues.js";
import { Errors } from "../lib/errors.js";

const DEFAULT_TEMPLATES = {
  welcome: {
    name: "Welcome Email",
    subject_en: "Welcome to StoryTub - Your 5,000 free credits are ready!",
    subject_fr:
      "Bienvenue sur StoryTub - Vos 5 000 crédits gratuits sont prêts !",
    body_en:
      "<h1>Welcome, {{display_name}}!</h1><p>Start creating viral videos with your 5,000 free credits.</p>",
    body_fr:
      "<h1>Bienvenue, {{display_name}} !</h1><p>Commencez à créer des vidéos virales avec vos 5 000 crédits gratuits.</p>",
    email_type: "transactional",
  },
  video_ready: {
    name: "Video Ready",
    subject_en: 'Your video "{{video_title}}" is ready!',
    subject_fr: 'Votre vidéo "{{video_title}}" est prête !',
    body_en:
      '<p>Hi {{display_name}}, your video is ready.</p><p><a href="{{video_url}}">Download your video</a></p>',
    body_fr:
      '<p>Bonjour {{display_name}}, votre vidéo est prête.</p><p><a href="{{video_url}}">Télécharger votre vidéo</a></p>',
    email_type: "notification",
  },
  subscription_started: {
    name: "Subscription Started",
    subject_en: "Your {{plan_name}} subscription is active",
    subject_fr: "Votre abonnement {{plan_name}} est actif",
    body_en:
      "<p>Hi {{display_name}}, your {{plan_name}} subscription is now active.</p><p>Your next renewal date is {{next_billing_date}}.</p>",
    body_fr:
      "<p>Bonjour {{display_name}}, votre abonnement {{plan_name}} est maintenant actif.</p><p>Votre prochaine date de renouvellement est le {{next_billing_date}}.</p>",
    email_type: "transactional",
  },
  subscription_renewed: {
    name: "Subscription Renewed",
    subject_en: "Your {{plan_name}} subscription has renewed",
    subject_fr: "Votre abonnement {{plan_name}} a été renouvelé",
    body_en:
      "<p>Hi {{display_name}}, your {{plan_name}} subscription has renewed successfully.</p><p>{{credits_added}} credits were added to your account.</p>",
    body_fr:
      "<p>Bonjour {{display_name}}, votre abonnement {{plan_name}} a bien été renouvelé.</p><p>{{credits_added}} crédits ont été ajoutés à votre compte.</p>",
    email_type: "transactional",
  },
  subscription_payment_failed: {
    name: "Subscription Payment Failed",
    subject_en: "We couldn't process your subscription payment",
    subject_fr: "Nous n'avons pas pu traiter le paiement de votre abonnement",
    body_en:
      "<p>Hi {{display_name}}, the payment for your {{plan_name}} subscription failed.</p><p>Please update your billing method to avoid interruption.</p>",
    body_fr:
      "<p>Bonjour {{display_name}}, le paiement de votre abonnement {{plan_name}} a échoué.</p><p>Veuillez mettre à jour votre moyen de paiement pour éviter une interruption.</p>",
    email_type: "transactional",
  },
  subscription_canceled: {
    name: "Subscription Canceled",
    subject_en: "Your subscription has been canceled",
    subject_fr: "Votre abonnement a été annulé",
    body_en:
      "<p>Hi {{display_name}}, your {{plan_name}} plan has been canceled.</p><p>Your access remains active until {{end_date}}.</p>",
    body_fr:
      "<p>Bonjour {{display_name}}, votre plan {{plan_name}} a été annulé.</p><p>Votre accès reste actif jusqu'au {{end_date}}.</p>",
    email_type: "transactional",
  },
  bundle_purchased: {
    name: "Credits Added",
    subject_en: "Your {{bundle_name}} credits are now available",
    subject_fr: "Vos crédits {{bundle_name}} sont maintenant disponibles",
    body_en:
      "<p>Hi {{display_name}}, your {{bundle_name}} purchase was successful.</p><p>{{credits_added}} credits were added to your account.</p>",
    body_fr:
      "<p>Bonjour {{display_name}}, votre achat {{bundle_name}} a été confirmé.</p><p>{{credits_added}} crédits ont été ajoutés à votre compte.</p>",
    email_type: "transactional",
  },
};

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    logger.warn("SMTP not configured - using Nodemailer JSON transport");
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  return transporter;
}

function renderTemplateString(template, variables = {}) {
  if (!template) return "";

  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    const value = variables[key];
    return value == null ? "" : String(value);
  });
}

function deriveDisplayName(email, displayName) {
  if (displayName) return displayName;
  if (!email) return "there";
  return email.split("@")[0];
}

async function getProfileContext(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, language, credits_balance, subscription_plan, is_banned",
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    logger.warn({ error, userId }, "Email profile context lookup failed");
    return null;
  }

  return data;
}

async function getTemplate(templateId) {
  if (!templateId) return null;

  const { data, error } = await supabase
    .from("email_templates")
    .select(
      "id, name, subject_en, subject_fr, body_en, body_fr, email_type, is_active",
    )
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    logger.warn(
      { error, templateId },
      "Email template lookup failed, falling back to defaults",
    );
  }

  if (data?.is_active) return data;
  return DEFAULT_TEMPLATES[templateId] ?? null;
}

async function updateEmailLogMetadata(emailLogId, metadata) {
  const { error } = await supabase
    .from("email_logs")
    .update({ metadata })
    .eq("id", emailLogId);

  if (error) {
    logger.error({ error, emailLogId }, "Failed to update email log metadata");
    throw error;
  }
}

async function createEmailLog({
  userId = null,
  emailAddress,
  emailType,
  subject,
  templateId = null,
  campaignId = null,
  metadata = {},
}) {
  const { data, error } = await supabase
    .from("email_logs")
    .insert({
      user_id: userId,
      email_address: emailAddress,
      email_type: emailType,
      subject,
      template_id: templateId,
      campaign_id: campaignId,
      metadata,
    })
    .select("id")
    .single();

  if (error || !data) {
    logger.error(
      { error, emailAddress, templateId },
      "Failed to create email log",
    );
    throw error || Errors.badRequest("Failed to queue email");
  }

  return data.id;
}

export async function enqueueEmailLog(emailLogId) {
  const { data, error } = await supabase
    .from("email_logs")
    .select("metadata")
    .eq("id", emailLogId)
    .single();

  if (error || !data) {
    logger.error(
      { error, emailLogId },
      "Failed to load email log before enqueue",
    );
    throw error || Errors.badRequest("Email log not found");
  }

  const nextMetadata = {
    ...(data.metadata || {}),
    queued_to_worker: true,
    queued_at: new Date().toISOString(),
  };

  await updateEmailLogMetadata(emailLogId, nextMetadata);

  await emailQueue.add(
    "send-email",
    { emailLogId },
    { jobId: `email:${emailLogId}` },
  );

  return emailLogId;
}

export async function queueTemplateEmail({
  userId = null,
  emailAddress = null,
  templateId,
  variables = {},
  emailType = null,
  campaignId = null,
  subjectOverrides = null,
  bodyOverrides = null,
  metadata = {},
}) {
  const profile = await getProfileContext(userId);
  const recipientEmail = emailAddress || profile?.email;

  if (!recipientEmail) {
    throw Errors.badRequest("Recipient email address is required");
  }

  const template = await getTemplate(templateId);
  if (!template) {
    throw Errors.notFound(`Email template '${templateId}' not found`);
  }

  const language = metadata.language || profile?.language || "en";
  const mergedVariables = {
    display_name: deriveDisplayName(recipientEmail, profile?.display_name),
    email: recipientEmail,
    credits_remaining: profile?.credits_balance,
    subscription_plan: profile?.subscription_plan,
    ...variables,
  };

  const subjectTemplate =
    subjectOverrides?.[language] ||
    template[`subject_${language}`] ||
    template.subject_en ||
    "StoryTub";
  const subject = renderTemplateString(subjectTemplate, mergedVariables).trim();

  const emailLogId = await createEmailLog({
    userId,
    emailAddress: recipientEmail,
    emailType: emailType || template.email_type || "transactional",
    subject,
    templateId,
    campaignId,
    metadata: {
      ...metadata,
      language,
      variables: mergedVariables,
      subject_overrides: subjectOverrides,
      body_overrides: bodyOverrides,
      queued_to_worker: false,
    },
  });

  await enqueueEmailLog(emailLogId);
  return emailLogId;
}

async function refreshCampaignStats(campaignId) {
  if (!campaignId) return;

  const [
    { count: sentCount, error: sentError },
    { data: campaign, error: campaignError },
  ] = await Promise.all([
    supabase
      .from("email_logs")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "sent"),
    supabase
      .from("email_campaigns")
      .select("id, total_recipients, sent_at")
      .eq("id", campaignId)
      .single(),
  ]);

  if (sentError || campaignError || !campaign) {
    logger.warn(
      { sentError, campaignError, campaignId },
      "Failed to refresh campaign stats",
    );
    return;
  }

  const nextStatus =
    sentCount >= campaign.total_recipients ? "sent" : "sending";
  const payload = {
    sent_count: sentCount || 0,
    status: nextStatus,
  };

  if (nextStatus === "sent" && !campaign.sent_at) {
    payload.sent_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("email_campaigns")
    .update(payload)
    .eq("id", campaignId);

  if (error) {
    logger.warn({ error, campaignId }, "Failed to persist campaign stats");
  }
}

export async function processEmailLog(emailLogId) {
  const { data: log, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("id", emailLogId)
    .single();

  if (error || !log) {
    logger.error({ error, emailLogId }, "Email log not found for processing");
    throw error || Errors.notFound("Email log not found");
  }

  if (log.status === "sent") return;

  const template = await getTemplate(log.template_id);
  const profile = await getProfileContext(log.user_id);
  const metadata = log.metadata || {};
  const variables = {
    display_name: deriveDisplayName(log.email_address, profile?.display_name),
    email: log.email_address,
    ...(metadata.variables || {}),
  };
  const language = metadata.language || profile?.language || "en";

  const subjectTemplate =
    metadata.subject_overrides?.[language] ||
    template?.[`subject_${language}`] ||
    log.subject;
  const bodyTemplate =
    metadata.body_overrides?.[language] ||
    template?.[`body_${language}`] ||
    `<p>${log.subject}</p>`;

  const subject = renderTemplateString(subjectTemplate, variables).trim();
  const html = renderTemplateString(bodyTemplate, variables);
  const transporterInstance = getTransporter();

  try {
    const info = await transporterInstance.sendMail({
      from: `${env.emailFromName} <${env.emailFromAddress}>`,
      to: log.email_address,
      subject,
      html,
    });

    const { error: updateError } = await supabase
      .from("email_logs")
      .update({
        subject,
        status: "sent",
        sent_at: new Date().toISOString(),
        error_message: null,
        metadata: {
          ...metadata,
          subject_overrides: metadata.subject_overrides,
          body_overrides: metadata.body_overrides,
          queued_to_worker: true,
          provider_message_id: info.messageId ?? null,
        },
      })
      .eq("id", emailLogId);

    if (updateError) {
      logger.error(
        { error: updateError, emailLogId },
        "Failed to mark email log as sent",
      );
      throw updateError;
    }

    await refreshCampaignStats(log.campaign_id);
  } catch (sendError) {
    const { error: failError } = await supabase
      .from("email_logs")
      .update({
        status: "failed",
        error_message: sendError.message?.slice(0, 500) || "Email send failed",
      })
      .eq("id", emailLogId);

    if (failError) {
      logger.error(
        { error: failError, emailLogId },
        "Failed to mark email log as failed",
      );
    }

    throw sendError;
  }
}

export async function syncQueuedEmailLogs(limit = 50) {
  const { data, error } = await supabase
    .from("email_logs")
    .select("id, metadata")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    logger.error({ error }, "Failed to load queued email logs");
    throw error;
  }

  for (const emailLog of data || []) {
    if (emailLog.metadata?.queued_to_worker) continue;

    try {
      await enqueueEmailLog(emailLog.id);
    } catch (queueError) {
      logger.error(
        { err: queueError, emailLogId: emailLog.id },
        "Failed to enqueue queued email log",
      );
    }
  }

  return data?.length || 0;
}

function applyAudienceFilters(query, targetAudience = {}) {
  let nextQuery = query.eq("is_banned", false);

  if (targetAudience.plan) {
    nextQuery = Array.isArray(targetAudience.plan)
      ? nextQuery.in("subscription_plan", targetAudience.plan)
      : nextQuery.eq("subscription_plan", targetAudience.plan);
  }

  if (targetAudience.language) {
    nextQuery = Array.isArray(targetAudience.language)
      ? nextQuery.in("language", targetAudience.language)
      : nextQuery.eq("language", targetAudience.language);
  }

  if (targetAudience.subscription_status) {
    nextQuery = Array.isArray(targetAudience.subscription_status)
      ? nextQuery.in("subscription_status", targetAudience.subscription_status)
      : nextQuery.eq("subscription_status", targetAudience.subscription_status);
  }

  if (
    Array.isArray(targetAudience.user_ids) &&
    targetAudience.user_ids.length > 0
  ) {
    nextQuery = nextQuery.in("id", targetAudience.user_ids);
  }

  return nextQuery;
}

export async function listCampaigns() {
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error }, "Failed to list email campaigns");
    throw error;
  }

  return data || [];
}

export async function createCampaign({
  templateId,
  name,
  subjectEn,
  subjectFr,
  targetAudience,
  scheduledAt,
  createdBy,
}) {
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      template_id: templateId,
      name,
      subject_en: subjectEn,
      subject_fr: subjectFr,
      target_audience: targetAudience || {},
      scheduled_at: scheduledAt || null,
      created_by: createdBy,
      status: scheduledAt ? "scheduled" : "draft",
    })
    .select("*")
    .single();

  if (error || !data) {
    logger.error(
      { error, name, templateId },
      "Failed to create email campaign",
    );
    throw error || Errors.badRequest("Failed to create email campaign");
  }

  return data;
}

export async function queueCampaignSend(campaignId) {
  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    logger.error(
      { error: campaignError, campaignId },
      "Campaign lookup failed",
    );
    throw Errors.notFound("Email campaign not found");
  }

  const query = applyAudienceFilters(
    supabase
      .from("profiles")
      .select(
        "id, email, display_name, language, subscription_plan, credits_balance, is_banned",
      ),
    campaign.target_audience || {},
  );

  const { data: recipients, error: recipientsError } = await query;
  if (recipientsError) {
    logger.error(
      { error: recipientsError, campaignId },
      "Failed to load campaign recipients",
    );
    throw recipientsError;
  }

  const totalRecipients = recipients?.length || 0;
  const campaignStatus = totalRecipients === 0 ? "sent" : "sending";
  const campaignUpdate = {
    total_recipients: totalRecipients,
    sent_count: 0,
    status: campaignStatus,
  };

  if (campaignStatus === "sent") {
    campaignUpdate.sent_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("email_campaigns")
    .update(campaignUpdate)
    .eq("id", campaignId);

  if (updateError) {
    logger.error(
      { error: updateError, campaignId },
      "Failed to update campaign before send",
    );
    throw updateError;
  }

  for (const recipient of recipients || []) {
    await queueTemplateEmail({
      userId: recipient.id,
      templateId: campaign.template_id,
      emailType: "marketing",
      campaignId,
      subjectOverrides: {
        en: campaign.subject_en,
        fr: campaign.subject_fr,
      },
      metadata: { campaign_name: campaign.name },
    });
  }

  return totalRecipients;
}
