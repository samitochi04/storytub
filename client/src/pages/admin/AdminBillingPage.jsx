import SEOHead from "@/components/layout/SEOHead";

export default function AdminBillingPage() {
  return (
    <>
      <SEOHead title="Admin Billing" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Billing Overview
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Revenue and payments coming in Step 9.
        </p>
      </div>
    </>
  );
}
