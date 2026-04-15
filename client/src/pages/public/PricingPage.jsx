import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import PlanCard from "@/components/shared/PlanCard";
import BundleCard from "@/components/shared/BundleCard";
import { Spinner } from "@/components/ui";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";
import { createCheckoutSession } from "@/services/stripe.service";

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  const [plans, setPlans] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [interval, setInterval] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("credit_bundles")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ])
      .then(([planRes, bundleRes]) => {
        if (planRes.data) setPlans(planRes.data);
        if (bundleRes.data) setBundles(bundleRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSelectPlan(planId) {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (planId === "free") return;
    setCheckoutLoading(planId);
    try {
      const data = await createCheckoutSession({
        purchaseType: "subscription",
        planId,
        interval,
      });
      if (data.url) window.location.href = data.url;
    } catch {
      // checkout error
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleSelectBundle(bundleId) {
    if (!user) {
      navigate("/signup");
      return;
    }
    setCheckoutLoading(bundleId);
    try {
      const data = await createCheckoutSession({
        purchaseType: "bundle",
        bundleId,
      });
      if (data.url) window.location.href = data.url;
    } catch {
      // checkout error
    } finally {
      setCheckoutLoading(null);
    }
  }

  const faqItems = [
    { q: t("pricing.faq.q1"), a: t("pricing.faq.a1") },
    { q: t("pricing.faq.q2"), a: t("pricing.faq.a2") },
    { q: t("pricing.faq.q3"), a: t("pricing.faq.a3") },
    { q: t("pricing.faq.q4"), a: t("pricing.faq.a4") },
    { q: t("pricing.faq.q5"), a: t("pricing.faq.a5") },
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title={t("pricing.seoTitle")}
        description={t("pricing.seoDescription")}
        structuredData={faqStructuredData}
      />
      <div className="mx-auto max-w-[1000px] px-[var(--space-4)] py-[var(--space-16)]">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
            {t("pricing.title")}
          </h1>
          <p className="mt-[var(--space-2)] text-[14px] text-[var(--color-text-secondary)]">
            {t("pricing.subtitle")}
          </p>
        </div>

        {/* Interval toggle */}
        <div className="mt-[var(--space-6)] flex justify-center">
          <div className="inline-flex rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[2px]">
            <button
              onClick={() => setInterval("monthly")}
              className={`rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[12px] font-normal transition-colors ${
                interval === "monthly"
                  ? "bg-[var(--color-brand-blue)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t("pricing.monthly")}
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)] text-[12px] font-normal transition-colors ${
                interval === "yearly"
                  ? "bg-[var(--color-brand-blue)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t("pricing.yearly")}
            </button>
          </div>
        </div>

        {/* Plans */}
        {loading ? (
          <div className="mt-[var(--space-8)] flex justify-center">
            <Spinner size={28} />
          </div>
        ) : (
          <div className="mt-[var(--space-8)] grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                isCurrentPlan={profile?.subscription_plan === plan.id}
                onSelect={() => handleSelectPlan(plan.id)}
                loading={checkoutLoading === plan.id}
              />
            ))}
          </div>
        )}

        {/* Bundles */}
        {bundles.length > 0 && (
          <section className="mt-[var(--space-16)]">
            <h2 className="text-center text-[20px] font-bold text-[var(--color-text-primary)]">
              {t("pricing.bundlesTitle")}
            </h2>
            <p className="mt-[var(--space-2)] text-center text-[13px] text-[var(--color-text-secondary)]">
              {t("pricing.bundlesSubtitle")}
            </p>
            <div className="mt-[var(--space-6)] grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
              {bundles.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  onSelect={() => handleSelectBundle(bundle.id)}
                  loading={checkoutLoading === bundle.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-[var(--space-16)]">
          <h2 className="text-center text-[20px] font-bold text-[var(--color-text-primary)]">
            {t("pricing.faqTitle")}
          </h2>
          <div className="mx-auto mt-[var(--space-6)] max-w-[650px] flex flex-col gap-[var(--space-2)]">
            {faqItems.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-[var(--space-4)] py-[var(--space-3)] text-left"
      >
        <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
          {question}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 text-[var(--color-text-tertiary)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-[var(--color-border-default)] px-[var(--space-4)] py-[var(--space-3)]">
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
