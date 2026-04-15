import supabase from "../config/supabase.js";
import redis from "../config/redis.js";
import logger from "../lib/logger.js";
import { getVideoQueue, getEmailQueue } from "../jobs/queues.js";
import { queueCampaignSend } from "./email.service.js";

function startOfDay(date) {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toIsoDate(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function windowForDate(date) {
  const start = startOfDay(date);
  const end = addDays(start, 1);
  return { start, end };
}

function sumField(rows, field) {
  return (rows || []).reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
}

async function countRows(
  table,
  column,
  startField,
  start,
  end,
  extraFilters = [],
) {
  let query = supabase
    .from(table)
    .select(column || "id", { count: "exact", head: true })
    .gte(startField, start.toISOString())
    .lt(startField, end.toISOString());

  for (const filter of extraFilters) {
    if (filter.type === "eq") query = query.eq(filter.field, filter.value);
    if (filter.type === "neq") query = query.neq(filter.field, filter.value);
    if (filter.type === "not-null") query = query.not(filter.field, "is", null);
  }

  const { count, error } = await query;
  if (error) {
    logger.error({ error, table, startField }, "Analytics count query failed");
    throw error;
  }

  return count || 0;
}

async function selectRows(table, fields, extra = (query) => query) {
  const { data, error } = await extra(supabase.from(table).select(fields));
  if (error) {
    logger.error({ error, table, fields }, "Analytics select query failed");
    throw error;
  }
  return data || [];
}

export async function rollupAnalytics(date = addDays(new Date(), -1)) {
  const { start, end } = windowForDate(date);
  const dateKey = toIsoDate(start);

  const [
    newUsers,
    activeUsers,
    videosGenerated,
    videosCompleted,
    videosFailed,
    supportTicketsOpened,
    supportTicketsResolved,
    emailsSent,
    subscriptionCreated,
    subscriptionCanceled,
    subscriptionUpgraded,
    subscriptionDowngraded,
    bundlePurchases,
    creditUsageRows,
    paymentRows,
  ] = await Promise.all([
    countRows("profiles", "id", "created_at", start, end),
    countRows("profiles", "id", "last_login_at", start, end),
    countRows("videos", "id", "created_at", start, end),
    countRows("videos", "id", "completed_at", start, end),
    countRows("videos", "id", "created_at", start, end, [
      { type: "eq", field: "status", value: "failed" },
    ]),
    countRows("support_tickets", "id", "created_at", start, end),
    countRows("support_tickets", "id", "resolved_at", start, end),
    countRows("email_logs", "id", "sent_at", start, end, [
      { type: "eq", field: "status", value: "sent" },
    ]),
    countRows("billing_events", "id", "created_at", start, end, [
      { type: "eq", field: "event_type", value: "subscription_created" },
    ]),
    countRows("billing_events", "id", "created_at", start, end, [
      { type: "eq", field: "event_type", value: "subscription_canceled" },
    ]),
    countRows("billing_events", "id", "created_at", start, end, [
      { type: "eq", field: "event_type", value: "subscription_upgraded" },
    ]),
    countRows("billing_events", "id", "created_at", start, end, [
      { type: "eq", field: "event_type", value: "subscription_downgraded" },
    ]),
    countRows("billing_events", "id", "created_at", start, end, [
      { type: "eq", field: "event_type", value: "bundle_purchased" },
    ]),
    selectRows("credit_transactions", "amount", (query) =>
      query
        .eq("type", "video_generation")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString()),
    ),
    selectRows("payments", "net_amount_cents", (query) =>
      query
        .eq("status", "succeeded")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString()),
    ),
  ]);

  const totalCreditsUsed = Math.abs(sumField(creditUsageRows, "amount"));
  const totalRevenueCents = sumField(paymentRows, "net_amount_cents");

  const payload = {
    date: dateKey,
    new_users: newUsers,
    active_users: activeUsers,
    videos_generated: videosGenerated,
    videos_completed: videosCompleted,
    videos_failed: videosFailed,
    total_credits_used: totalCreditsUsed,
    total_revenue_cents: totalRevenueCents,
    new_subscriptions: subscriptionCreated,
    churned_subscriptions: subscriptionCanceled,
    upgraded_subscriptions: subscriptionUpgraded,
    downgraded_subscriptions: subscriptionDowngraded,
    bundle_purchases: bundlePurchases,
    blog_views: 0,
    support_tickets_opened: supportTicketsOpened,
    support_tickets_resolved: supportTicketsResolved,
    emails_sent: emailsSent,
  };

  const { data, error } = await supabase
    .from("analytics_daily")
    .upsert(payload, { onConflict: "date" })
    .select("*")
    .single();

  if (error) {
    logger.error({ error, payload }, "Analytics rollup upsert failed");
    throw error;
  }

  return data;
}

export async function getDashboardAnalytics(days = 30) {
  const start = addDays(startOfDay(new Date()), -(days - 1));
  const { data, error } = await supabase
    .from("analytics_daily")
    .select("*")
    .gte("date", toIsoDate(start))
    .order("date", { ascending: true });

  if (error) {
    logger.error({ error, days }, "Failed to load dashboard analytics");
    throw error;
  }

  const rows = data || [];
  const totals = rows.reduce(
    (acc, row) => ({
      new_users: acc.new_users + (row.new_users || 0),
      active_users: acc.active_users + (row.active_users || 0),
      videos_generated: acc.videos_generated + (row.videos_generated || 0),
      videos_completed: acc.videos_completed + (row.videos_completed || 0),
      videos_failed: acc.videos_failed + (row.videos_failed || 0),
      total_credits_used:
        acc.total_credits_used + (row.total_credits_used || 0),
      total_revenue_cents:
        acc.total_revenue_cents + (row.total_revenue_cents || 0),
      new_subscriptions: acc.new_subscriptions + (row.new_subscriptions || 0),
      churned_subscriptions:
        acc.churned_subscriptions + (row.churned_subscriptions || 0),
      upgraded_subscriptions:
        acc.upgraded_subscriptions + (row.upgraded_subscriptions || 0),
      downgraded_subscriptions:
        acc.downgraded_subscriptions + (row.downgraded_subscriptions || 0),
      bundle_purchases: acc.bundle_purchases + (row.bundle_purchases || 0),
      emails_sent: acc.emails_sent + (row.emails_sent || 0),
      support_tickets_opened:
        acc.support_tickets_opened + (row.support_tickets_opened || 0),
      support_tickets_resolved:
        acc.support_tickets_resolved + (row.support_tickets_resolved || 0),
    }),
    {
      new_users: 0,
      active_users: 0,
      videos_generated: 0,
      videos_completed: 0,
      videos_failed: 0,
      total_credits_used: 0,
      total_revenue_cents: 0,
      new_subscriptions: 0,
      churned_subscriptions: 0,
      upgraded_subscriptions: 0,
      downgraded_subscriptions: 0,
      bundle_purchases: 0,
      emails_sent: 0,
      support_tickets_opened: 0,
      support_tickets_resolved: 0,
    },
  );

  const latest = rows.at(-1) || null;

  return { latest, totals, series: rows };
}

export async function getRevenueBreakdown(days = 30) {
  const start = addDays(startOfDay(new Date()), -days);
  const payments = await selectRows(
    "payments",
    "payment_type, plan_id, bundle_id, net_amount_cents, created_at, currency",
    (query) =>
      query
        .eq("status", "succeeded")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: false }),
  );

  const summary = {
    subscription_revenue_cents: 0,
    bundle_revenue_cents: 0,
    total_revenue_cents: 0,
    by_plan: {},
    by_bundle: {},
    recent_payments: payments.slice(0, 20),
  };

  for (const payment of payments) {
    const amount = Number(payment.net_amount_cents) || 0;
    summary.total_revenue_cents += amount;

    if (payment.payment_type === "subscription") {
      summary.subscription_revenue_cents += amount;
      const key = payment.plan_id || "unknown";
      summary.by_plan[key] = (summary.by_plan[key] || 0) + amount;
    }

    if (payment.payment_type === "bundle") {
      summary.bundle_revenue_cents += amount;
      const key = payment.bundle_id || "unknown";
      summary.by_bundle[key] = (summary.by_bundle[key] || 0) + amount;
    }
  }

  return summary;
}

export async function getBillingOverview() {
  const [subscriptions, recentPayments] = await Promise.all([
    selectRows(
      "subscriptions",
      "id, user_id, plan_id, status, current_period_end, cancel_at_period_end, created_at",
      (query) => query.order("created_at", { ascending: false }),
    ),
    selectRows(
      "payments",
      "id, user_id, amount_cents, net_amount_cents, status, payment_type, plan_id, bundle_id, created_at",
      (query) => query.order("created_at", { ascending: false }).limit(20),
    ),
  ]);

  const counts = subscriptions.reduce(
    (acc, sub) => {
      acc.total += 1;
      acc.by_status[sub.status] = (acc.by_status[sub.status] || 0) + 1;
      acc.by_plan[sub.plan_id] = (acc.by_plan[sub.plan_id] || 0) + 1;
      if (sub.status === "active" || sub.status === "trialing") {
        acc.active += 1;
      }
      return acc;
    },
    { total: 0, active: 0, by_status: {}, by_plan: {} },
  );

  return {
    subscriptions: counts,
    recent_payments: recentPayments,
  };
}

export async function getMonitoringOverview() {
  const [
    failedVideosLast24h,
    failedEmailsLast24h,
    pendingVideos,
    queuedEmails,
  ] = await Promise.all([
    countRows(
      "videos",
      "id",
      "created_at",
      addDays(new Date(), -1),
      new Date(),
      [{ type: "eq", field: "status", value: "failed" }],
    ),
    countRows(
      "email_logs",
      "id",
      "created_at",
      addDays(new Date(), -1),
      new Date(),
      [{ type: "eq", field: "status", value: "failed" }],
    ),
    selectRows("videos", "id, created_at", (query) =>
      query
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(10),
    ),
    countRows(
      "email_logs",
      "id",
      "created_at",
      addDays(new Date(), -30),
      new Date(),
      [{ type: "eq", field: "status", value: "queued" }],
    ),
  ]);

  let redisStatus = "down";
  let queueCounts = { video: null, email: null };

  try {
    if (redis) {
      const pong = await redis.ping();
      redisStatus = pong === "PONG" ? "ok" : "degraded";
    }
    const vq = getVideoQueue();
    const eq = getEmailQueue();
    if (vq) {
      queueCounts.video = await vq.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
      );
    }
    if (eq) {
      queueCounts.email = await eq.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
      );
    }
  } catch (error) {
    logger.warn({ error }, "Monitoring queue check failed");
  }

  return {
    server_time: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime_seconds: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
    },
    redis: redisStatus,
    queues: queueCounts,
    failures_last_24h: {
      videos: failedVideosLast24h,
      emails: failedEmailsLast24h,
    },
    pending_videos: pendingVideos.length,
    queued_emails: queuedEmails,
    oldest_pending_video: pendingVideos[0] || null,
  };
}

export async function cleanupExpiredVideos() {
  const now = new Date().toISOString();
  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, user_id, guest_session_id")
    .not("expires_at", "is", null)
    .lt("expires_at", now)
    .limit(200);

  if (error) {
    logger.error({ error }, "Failed to load expired videos for cleanup");
    throw error;
  }

  if (!videos?.length) return 0;

  const paths = videos.map(
    (video) => `${video.user_id || "guest"}/${video.id}.mp4`,
  );
  try {
    await supabase.storage.from("videos").remove(paths);
  } catch (storageError) {
    logger.warn(
      { storageError, paths },
      "Failed to remove one or more video storage objects",
    );
  }

  const { error: deleteError } = await supabase
    .from("videos")
    .delete()
    .in(
      "id",
      videos.map((video) => video.id),
    );

  if (deleteError) {
    logger.error({ error: deleteError }, "Failed to delete expired video rows");
    throw deleteError;
  }

  return videos.length;
}

export async function cleanupGuestSessions(daysOld = 30) {
  const cutoff = addDays(new Date(), -daysOld).toISOString();
  const { data: sessions, error } = await supabase
    .from("guest_sessions")
    .select("id")
    .lt("updated_at", cutoff)
    .limit(500);

  if (error) {
    logger.error({ error }, "Failed to load guest sessions for cleanup");
    throw error;
  }

  if (!sessions?.length) return 0;

  const { error: deleteError } = await supabase
    .from("guest_sessions")
    .delete()
    .in(
      "id",
      sessions.map((session) => session.id),
    );

  if (deleteError) {
    logger.error({ error: deleteError }, "Failed to delete guest sessions");
    throw deleteError;
  }

  return sessions.length;
}

export async function runScheduledCampaigns() {
  const now = new Date().toISOString();
  const { data: campaigns, error } = await supabase
    .from("email_campaigns")
    .select("id")
    .eq("status", "scheduled")
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", now)
    .limit(50);

  if (error) {
    logger.error({ error }, "Failed to load scheduled campaigns");
    throw error;
  }

  let sent = 0;
  for (const campaign of campaigns || []) {
    await queueCampaignSend(campaign.id);
    sent += 1;
  }

  return sent;
}
