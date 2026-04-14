import SEOHead from "@/components/layout/SEOHead";

export default function SettingsPage() {
  return (
    <>
      <SEOHead title="Settings" noindex />
      <div className="mx-auto max-w-[600px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Account settings coming in Step 5.
        </p>
      </div>
    </>
  );
}
