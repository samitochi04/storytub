import SEOHead from "@/components/layout/SEOHead";

export default function AdminDashboardPage() {
  return (
    <>
      <SEOHead title="Admin Dashboard" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Admin Dashboard
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          KPIs and charts coming in Step 9.
        </p>
      </div>
    </>
  );
}
