import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";
import { getBillingOverview } from "@/services/admin.service";

function StatCard({ label, value }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
      <p className="text-[12px] text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-[var(--space-1)] text-[20px] font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

export default function AdminBillingPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBillingOverview()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <SEOHead title="Admin Billing" noindex />
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
        <SEOHead title="Admin Billing" noindex />
        <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-error)] bg-red-50 p-[var(--space-4)] dark:bg-red-950/20">
          <AlertCircle size={18} className="text-[var(--color-error)]" />
          <p className="text-[13px] text-[var(--color-error)]">{error}</p>
        </div>
      </>
    );
  }

  const { subscriptions, recent_payments } = data || {};

  return (
    <>
      <SEOHead title="Admin Billing" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.billingTitle")}
        </h1>

        {/* Overview Cards */}
        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("adminPages.totalSubscriptions")}
            value={subscriptions?.total ?? 0}
          />
          <StatCard
            label={t("adminPages.activeSubscriptions")}
            value={subscriptions?.active ?? 0}
          />
          <StatCard
            label={t("adminPages.byStatus")}
            value={
              subscriptions?.by_status
                ? Object.entries(subscriptions.by_status)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")
                : "N/A"
            }
          />
          <StatCard
            label={t("adminPages.byPlan")}
            value={
              subscriptions?.by_plan
                ? Object.entries(subscriptions.by_plan)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")
                : "N/A"
            }
          />
        </div>

        {/* Subscriptions by Plan */}
        {subscriptions?.by_plan && (
          <div className="mt-[var(--space-8)]">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
              {t("adminPages.planDistribution")}
            </h2>
            <div className="mt-[var(--space-4)] grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
              {Object.entries(subscriptions.by_plan).map(([plan, count]) => (
                <div
                  key={plan}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] text-center"
                >
                  <p className="text-[20px] font-bold text-[var(--color-brand-blue)]">
                    {count}
                  </p>
                  <p className="mt-[var(--space-1)] text-[12px] capitalize text-[var(--color-text-secondary)]">
                    {plan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Payments */}
        <div className="mt-[var(--space-8)]">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.recentPayments")}
          </h2>
          <div className="mt-[var(--space-4)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.user")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.amount")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.type")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.status")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(recent_payments || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                    >
                      {t("adminPages.noResults")}
                    </td>
                  </tr>
                ) : (
                  recent_payments.map((payment, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                    >
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                        {payment.user_id?.slice(0, 8)}...
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-[var(--space-1)]">
                          <CreditCard
                            size={14}
                            className="text-[var(--color-text-tertiary)]"
                          />
                          ${((payment.amount_cents || 0) / 100).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)] capitalize text-[var(--color-text-secondary)]">
                        {payment.payment_type || payment.type}
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)]">
                        <span
                          className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${
                            payment.status === "succeeded"
                              ? "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
