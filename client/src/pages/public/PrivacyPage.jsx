import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="StoryTub privacy policy and data handling practices."
      />
      <div className="mx-auto max-w-[800px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.privacyTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.privacyPlaceholder")}
        </p>
      </div>
    </>
  );
}
