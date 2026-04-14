import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Contact"
        description="Get in touch with the StoryTub team."
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("pages.contactTitle")}
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          {t("pages.contactPlaceholder")}
        </p>
      </div>
    </>
  );
}
