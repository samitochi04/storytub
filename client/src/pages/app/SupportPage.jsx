import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="Support" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.supportTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.supportPlaceholder")}
        </p>
      </div>
    </>
  );
}
