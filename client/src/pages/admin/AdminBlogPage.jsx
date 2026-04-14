import SEOHead from "@/components/layout/SEOHead";

export default function AdminBlogPage() {
  return (
    <>
      <SEOHead title="Admin Blog" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Blog Management
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Blog editor coming in Step 9.
        </p>
      </div>
    </>
  );
}
