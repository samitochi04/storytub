import SEOHead from "@/components/layout/SEOHead";

export default function AdminUsersPage() {
  return (
    <>
      <SEOHead title="Admin Users" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          User Management
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          User manager coming in Step 9.
        </p>
      </div>
    </>
  );
}
