import SEOHead from "@/components/layout/SEOHead";

export default function AdminStaffPage() {
  return (
    <>
      <SEOHead title="Admin Staff" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Staff Management
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Staff manager coming in Step 9.
        </p>
      </div>
    </>
  );
}
