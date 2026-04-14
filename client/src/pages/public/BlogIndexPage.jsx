import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function BlogIndexPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Blog"
        description="Read the latest articles on AI video creation, content strategy, and more."
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.blogTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.blogPlaceholder")}
        </p>
      </div>
    </>
  );
}
