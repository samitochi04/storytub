import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="StoryTub terms of service and usage conditions."
      />
      <div className="mx-auto max-w-[800px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.termsTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.termsPlaceholder")}
        </p>
      </div>
    </>
  );
}
