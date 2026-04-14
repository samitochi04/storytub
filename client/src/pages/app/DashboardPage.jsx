import SEOHead from "@/components/layout/SEOHead";

export default function DashboardPage() {
  return (
    <>
      <SEOHead title="Dashboard" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Dashboard content coming in Step 5.
        </p>
      </div>
    </>
  );
}
