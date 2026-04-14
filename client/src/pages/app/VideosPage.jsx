import SEOHead from "@/components/layout/SEOHead";

export default function VideosPage() {
  return (
    <>
      <SEOHead title="Videos" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          My Videos
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Video library coming in Step 6.
        </p>
      </div>
    </>
  );
}
