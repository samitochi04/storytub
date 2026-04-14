import SEOHead from "@/components/layout/SEOHead";

export default function AdminEmailPage() {
  return (
    <>
      <SEOHead title="Admin Emails" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Email Campaigns
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Email management coming in Step 9.
        </p>
      </div>
    </>
  );
}
