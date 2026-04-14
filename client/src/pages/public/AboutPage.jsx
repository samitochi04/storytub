import SEOHead from "@/components/layout/SEOHead";

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About"
        description="Learn about StoryTub, our mission, and the team behind AI video generation."
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          About
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          About page content coming in Step 8.
        </p>
      </div>
    </>
  );
}
