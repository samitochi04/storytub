import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Loader2,
  AlertCircle,
  Users,
  Film,
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getDashboardAnalytics,
  getRevenueBreakdown,
} from "@/services/admin.service";

function MetricRow({ label, value, prev }) {
  const diff =
    prev !== undefined && prev !== 0 ? ((value - prev) / prev) * 100 : null;
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border-default)] py-[var(--space-3)] last:border-0">
      <span className="text-[13px] text-[var(--color-text-secondary)]">
        {label}
      </span>
      <div className="flex items-center gap-[var(--space-2)]">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
          {value}
        </span>
        {diff !== null && (
          <span
            className={`flex items-center text-[11px] ${diff >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
          >
            {diff >= 0 ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {Math.abs(diff).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function SeriesTable({ series, t }) {
  if (!series?.length) return null;
  return (
    <div className="mt-[var(--space-6)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-[var(--color-border-default)] text-[11px] font-medium text-[var(--color-text-secondary)]">
            <th className="px-[var(--space-3)] py-[var(--space-2)]">
              {t("adminPages.date")}
            </th>
            <th className="px-[var(--space-3)] py-[var(--space-2)]">
              {t("adminPages.newUsers")}
            </th>
            <th className="px-[var(--space-3)] py-[var(--space-2)]">
              {t("adminPages.activeUsers")}
            </th>
            <th className="px-[var(--space-3)] py-[var(--space-2)]">
              {t("adminPages.videosCreated")}
            </th>
            <th className="px-[var(--space-3)] py-[var(--space-2)]">
              {t("adminPages.revenue")}
            </th>
            <th className="px-[var(--space-3)] py-[var(--space-2)]">
              {t("adminPages.creditsUsed")}
            </th>
          </tr>
        </thead>
        <tbody>
          {series.slice(0, 30).map((row) => (
            <tr
              key={row.date}
              className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
            >
              <td className="px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text-primary)]">
                {row.date}
              </td>
              <td className="px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text-primary)]">
                {row.new_users}
              </td>
              <td className="px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text-primary)]">
                {row.active_users}
              </td>
              <td className="px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text-primary)]">
                {row.videos_generated}
              </td>
              <td className="px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text-primary)]">
                ${((row.total_revenue_cents || 0) / 100).toFixed(2)}
              </td>
              <td className="px-[var(--space-3)] py-[var(--space-2)] text-[var(--color-text-primary)]">
                {row.total_credits_used}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getDashboardAnalytics(days), getRevenueBreakdown(days)])
      .then(([d, r]) => {
        setData(d);
        setRevenue(r);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <>
        <SEOHead title="Admin Analytics" noindex />
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
        <SEOHead title="Admin Analytics" noindex />
        <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-error)] bg-red-50 p-[var(--space-4)] dark:bg-red-950/20">
          <AlertCircle size={18} className="text-[var(--color-error)]" />
          <p className="text-[13px] text-[var(--color-error)]">{error}</p>
        </div>
      </>
    );
  }

  const { latest, totals, series } = data || {};
  const prev = series?.[1];

  return (
    <>
      <SEOHead title="Admin Analytics" noindex />
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.analyticsTitle")}
          </h1>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
          >
            <option value={7}>7 {t("adminPages.days")}</option>
            <option value={30}>30 {t("adminPages.days")}</option>
            <option value={90}>90 {t("adminPages.days")}</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-[var(--space-2)]">
              <Users size={18} className="text-[var(--color-brand-blue)]" />
              <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                {t("adminPages.userMetrics")}
              </h2>
            </div>
            <div className="mt-[var(--space-4)]">
              <MetricRow
                label={t("adminPages.totalNewUsers")}
                value={totals?.new_users ?? 0}
                prev={prev?.new_users}
              />
              <MetricRow
                label={t("adminPages.todayActive")}
                value={latest?.active_users ?? 0}
                prev={prev?.active_users}
              />
              <MetricRow
                label={t("adminPages.newSubscriptions")}
                value={totals?.new_subscriptions ?? 0}
              />
              <MetricRow
                label={t("adminPages.churned")}
                value={totals?.churned_subscriptions ?? 0}
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-[var(--space-2)]">
              <Film size={18} className="text-[var(--color-success)]" />
              <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                {t("adminPages.videoMetrics")}
              </h2>
            </div>
            <div className="mt-[var(--space-4)]">
              <MetricRow
                label={t("adminPages.totalGenerated")}
                value={totals?.videos_generated ?? 0}
              />
              <MetricRow
                label={t("adminPages.totalCompleted")}
                value={totals?.videos_completed ?? 0}
              />
              <MetricRow
                label={t("adminPages.totalFailed")}
                value={totals?.videos_failed ?? 0}
              />
              <MetricRow
                label={t("adminPages.creditsUsed")}
                value={totals?.total_credits_used ?? 0}
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-[var(--space-2)]">
              <DollarSign size={18} className="text-[var(--color-warning)]" />
              <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                {t("adminPages.revenueBreakdown")}
              </h2>
            </div>
            <div className="mt-[var(--space-4)]">
              <MetricRow
                label={t("adminPages.totalRevenue")}
                value={`$${((revenue?.total_revenue_cents ?? 0) / 100).toFixed(2)}`}
              />
              <MetricRow
                label={t("adminPages.subscriptionRevenue")}
                value={`$${((revenue?.subscription_revenue_cents ?? 0) / 100).toFixed(2)}`}
              />
              <MetricRow
                label={t("adminPages.bundleRevenue")}
                value={`$${((revenue?.bundle_revenue_cents ?? 0) / 100).toFixed(2)}`}
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-[var(--space-2)]">
              <CreditCard size={18} className="text-purple-500" />
              <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                {t("adminPages.revenueByPlan")}
              </h2>
            </div>
            <div className="mt-[var(--space-4)]">
              {(revenue?.by_plan || []).map((p) => (
                <MetricRow
                  key={p.plan_id || "unknown"}
                  label={p.plan_id || "Unknown"}
                  value={`$${((p.total_cents || 0) / 100).toFixed(2)} (${p.count})`}
                />
              ))}
              {(!revenue?.by_plan || revenue.by_plan.length === 0) && (
                <p className="text-[13px] text-[var(--color-text-tertiary)]">
                  {t("adminPages.noData")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Series Table */}
        <h2 className="mt-[var(--space-8)] text-[16px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.dailyBreakdown")}
        </h2>
        <SeriesTable series={series} t={t} />
      </div>
    </>
  );
}
