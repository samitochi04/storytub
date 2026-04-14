import { useParams } from "react-router-dom";
import SEOHead from "@/components/layout/SEOHead";

export default function BlogPostPage() {
  const { slug } = useParams();

  return (
    <>
      <SEOHead
        title="Blog Post"
        description="Read this article on StoryTub Blog."
      />
      <div className="mx-auto max-w-[800px] px-[var(--space-4)] py-[var(--space-16)]">
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-[var(--space-4)]">
          Slug: {slug}
        </p>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Blog Post
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Blog post content coming in Step 8.
        </p>
      </div>
    </>
  );
}
