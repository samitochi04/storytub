import SEOHead from "@/components/layout/SEOHead";

export default function HomePage() {
  return (
    <>
      <SEOHead
        title={null}
        description="Create viral short videos automatically with AI. Generate scripts, voiceovers, and captions in French and English."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "StoryTub",
          url: "https://storytub.com",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description: "AI-powered viral video generator",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Create viral videos with AI
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Homepage content coming in Step 8.
        </p>
      </div>
    </>
  );
}
