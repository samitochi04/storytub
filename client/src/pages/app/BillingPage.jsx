import SEOHead from "@/components/layout/SEOHead";

export default function BillingPage() {
  return (
    <>
      <SEOHead title="Billing" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Billing
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Billing and credits coming in Step 7.
        </p>
      </div>
    </>
  );
}
