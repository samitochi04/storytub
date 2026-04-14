import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="Dashboard" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.dashboardTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.dashboardPlaceholder")}
        </p>
      </div>
    </>
  );
}
