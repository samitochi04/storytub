import SEOHead from "@/components/layout/SEOHead";

export default function FeaturesPage() {
  return (
    <>
      <SEOHead
        title="Features"
        description="Explore StoryTub features: AI scripts, voiceovers, captions, and more."
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Features
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Features page content coming in Step 8.
        </p>
      </div>
    </>
  );
}
