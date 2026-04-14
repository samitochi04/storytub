import SEOHead from "@/components/layout/SEOHead";

export default function ContactPage() {
  return (
    <>
      <SEOHead
        title="Contact"
        description="Get in touch with the StoryTub team."
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Contact
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Contact page content coming in Step 8.
        </p>
      </div>
    </>
  );
}
