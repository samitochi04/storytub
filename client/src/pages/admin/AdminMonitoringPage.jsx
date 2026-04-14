import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function AdminMonitoringPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="Admin Monitoring" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.monitoringTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("adminPages.monitoringPlaceholder")}
        </p>
      </div>
    </>
  );
}
