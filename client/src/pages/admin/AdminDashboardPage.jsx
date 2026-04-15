import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Users,
  Film,
  DollarSign,
  Coins,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getDashboardAnalytics } from "@/services/admin.service";

function KpiCard({ icon: Icon, label, value, change, color }) {
  const isPositive = change > 0;
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-[12px] font-medium ${isPositive ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-[var(--space-3)] text-[24px] font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
        {label}
      </p>
    </div>
  );
}

function ActivityRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border-default)] py-[var(--space-3)] last:border-0">
      <span className="text-[13px] text-[var(--color-text-secondary)]">
        {label}
      </span>
      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardAnalytics(30)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <SEOHead title="Admin Dashboard" noindex />
        <div className="flex items-center justify-center py-[var(--space-16)]">
          <Loader2
            size={24}
            className="animate-spin text-[var(--color-text-secondary)]"
          />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead title="Admin Dashboard" noindex />
        <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-error)] bg-red-50 p-[var(--space-4)] dark:bg-red-950/20">
          <AlertCircle size={18} className="text-[var(--color-error)]" />
          <p className="text-[13px] text-[var(--color-error)]">{error}</p>
        </div>
      </>
    );
  }

  const { latest, totals } = data || {};
  const prev = data?.series?.[1];

  function pctChange(current, previous) {
    if (!previous || previous === 0) return undefined;
    return Math.round(((current - previous) / previous) * 100);
  }

  return (
    <>
      <SEOHead title="Admin Dashboard" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.dashboardTitle")}
        </h1>

        {/* KPI Cards */}
        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Users}
            label={t("adminPages.totalUsers")}
            value={totals?.new_users?.toLocaleString() ?? 0}
            change={pctChange(latest?.new_users, prev?.new_users)}
            color="#2B35FF"
          />
          <KpiCard
            icon={Film}
            label={t("adminPages.videosGenerated")}
            value={totals?.videos_generated?.toLocaleString() ?? 0}
            change={pctChange(latest?.videos_generated, prev?.videos_generated)}
            color="#22c55e"
          />
          <KpiCard
            icon={DollarSign}
            label={t("adminPages.totalRevenue")}
            value={`$${((totals?.total_revenue_cents ?? 0) / 100).toFixed(2)}`}
            change={pctChange(
              latest?.total_revenue_cents,
              prev?.total_revenue_cents,
            )}
            color="#f59e0b"
          />
          <KpiCard
            icon={Coins}
            label={t("adminPages.creditsUsed")}
            value={totals?.total_credits_used?.toLocaleString() ?? 0}
            change={pctChange(
              latest?.total_credits_used,
              prev?.total_credits_used,
            )}
            color="#8b5cf6"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-[var(--space-8)] grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
              {t("adminPages.todayActivity")}
            </h2>
            <div className="mt-[var(--space-4)]">
              <ActivityRow
                label={t("adminPages.newUsers")}
                value={latest?.new_users ?? 0}
              />
              <ActivityRow
                label={t("adminPages.activeUsers")}
                value={latest?.active_users ?? 0}
              />
              <ActivityRow
                label={t("adminPages.videosCreated")}
                value={latest?.videos_generated ?? 0}
              />
              <ActivityRow
                label={t("adminPages.videosFailed")}
                value={latest?.videos_failed ?? 0}
              />
              <ActivityRow
                label={t("adminPages.revenue")}
                value={`$${((latest?.total_revenue_cents ?? 0) / 100).toFixed(2)}`}
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
              {t("adminPages.subscriptionChanges")}
            </h2>
            <div className="mt-[var(--space-4)]">
              <ActivityRow
                label={t("adminPages.newSubscriptions")}
                value={latest?.new_subscriptions ?? 0}
              />
              <ActivityRow
                label={t("adminPages.churnedSubscriptions")}
                value={latest?.churned_subscriptions ?? 0}
              />
              <ActivityRow
                label={t("adminPages.upgrades")}
                value={latest?.upgraded_subscriptions ?? 0}
              />
              <ActivityRow
                label={t("adminPages.downgrades")}
                value={latest?.downgraded_subscriptions ?? 0}
              />
              <ActivityRow
                label={t("adminPages.bundlePurchases")}
                value={latest?.bundle_purchases ?? 0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
