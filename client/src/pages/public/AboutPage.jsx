import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="About"
        description="Learn about StoryTub, our mission, and the team behind AI video generation."
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.aboutTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.aboutPlaceholder")}
        </p>
      </div>
    </>
  );
}
