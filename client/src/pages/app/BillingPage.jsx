import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  ArrowUpRight,
  Coins,
  Crown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Badge, Spinner } from "@/components/ui";
import TransactionHistory from "@/components/shared/TransactionHistory";
import CouponInput from "@/components/shared/CouponInput";
import useAuthStore from "@/stores/authStore";
import useCredits from "@/hooks/useCredits";
import { createPortalSession } from "@/services/stripe.service";
import { PLAN_LIMITS } from "@/config/constants";

export default function BillingPage() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);
  const { balance, refresh } = useCredits();
  const [searchParams, setSearchParams] = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);

  const plan = profile?.subscription_plan || "free";
  const status = profile?.subscription_status;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  // Handle Stripe redirect callbacks
  const checkoutStatus = searchParams.get("checkout");

  useEffect(() => {
    if (checkoutStatus) {
      refresh();
      const timeout = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [checkoutStatus]);

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const data = await createPortalSession();
      if (data.url) window.location.href = data.url;
    } catch {
      // portal error
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      <SEOHead title={t("billing.title")} noindex />
      <div className="mx-auto max-w-[600px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
          {t("billing.title")}
        </h1>

        {/* Checkout callback banner */}
        {checkoutStatus === "success" && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-[var(--space-3)]">
            <CheckCircle
              size={16}
              strokeWidth={1.5}
              className="text-[var(--color-success)]"
            />
            <p className="text-[12px] text-[var(--color-success)]">
              {t("billing.checkoutSuccess")}
            </p>
          </div>
        )}
        {checkoutStatus === "cancel" && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-[var(--space-3)]">
            <XCircle
              size={16}
              strokeWidth={1.5}
              className="text-[var(--color-warning)]"
            />
            <p className="text-[12px] text-[var(--color-warning)]">
              {t("billing.checkoutCanceled")}
            </p>
          </div>
        )}

        {/* Current plan */}
        <div className="mt-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <Crown
              size={16}
              strokeWidth={1.5}
              className="text-[var(--color-brand-blue)]"
            />
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              {t("billing.currentPlan")}
            </h2>
          </div>
          <div className="mt-[var(--space-3)] flex items-center gap-[var(--space-2)]">
            <span className="text-[20px] font-bold capitalize text-[var(--color-text-primary)]">
              {plan}
            </span>
            {status && (
              <Badge
                variant={
                  status === "active"
                    ? "success"
                    : status === "past_due"
                      ? "warning"
                      : "default"
                }
              >
                {status}
              </Badge>
            )}
          </div>
          <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
            {limits.credits.toLocaleString()} {t("billing.creditsPerMonth")}
          </p>

          <div className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-2)]">
            <Button as={Link} to="/pricing" variant="primary" size="sm">
              {plan === "free" ? t("billing.upgrade") : t("billing.changePlan")}
            </Button>
            {plan !== "free" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                <CreditCard size={14} strokeWidth={1.5} />
                {t("billing.manageSubscription")}
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>

        {/* Credits balance */}
        <div className="mt-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <Coins
              size={16}
              strokeWidth={1.5}
              className="text-[var(--color-warning)]"
            />
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              {t("billing.creditsBalance")}
            </h2>
          </div>
          <p className="mt-[var(--space-2)] text-[24px] font-bold text-[var(--color-text-primary)]">
            {balance !== null ? (
              balance.toLocaleString()
            ) : (
              <Spinner size={16} />
            )}
          </p>
          <Button
            as={Link}
            to="/pricing#bundles"
            variant="ghost"
            size="sm"
            className="mt-[var(--space-2)]"
          >
            {t("billing.buyCredits")}
          </Button>
        </div>

        {/* Coupon */}
        <div className="mt-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <h2 className="mb-[var(--space-3)] text-[14px] font-bold text-[var(--color-text-primary)]">
            {t("billing.couponTitle")}
          </h2>
          <CouponInput />
        </div>

        {/* Transaction history */}
        <div className="mt-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
          <h2 className="mb-[var(--space-3)] text-[14px] font-bold text-[var(--color-text-primary)]">
            {t("billing.transactionHistory")}
          </h2>
          <TransactionHistory />
        </div>
      </div>
    </>
  );
}
