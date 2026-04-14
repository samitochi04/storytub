import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function AdminVideosPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="Admin Videos" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.videosTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("adminPages.videosPlaceholder")}
        </p>
      </div>
    </>
  );
}
