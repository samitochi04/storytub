import SEOHead from "@/components/layout/SEOHead";

export default function AdminVideosPage() {
  return (
    <>
      <SEOHead title="Admin Videos" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Video Management
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Video manager coming in Step 9.
        </p>
      </div>
    </>
  );
}
