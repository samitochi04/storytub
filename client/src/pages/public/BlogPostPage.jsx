import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Blog Post"
        description="Read this article on StoryTub Blog."
      />
      <div className="mx-auto max-w-[800px] px-[var(--space-4)] py-[var(--space-16)]">
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-[var(--space-4)]">
          {t("common.slug")}: {slug}
        </p>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.blogPostTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.blogPostPlaceholder")}
        </p>
      </div>
    </>
  );
}
