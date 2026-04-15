import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";

const SECTIONS = [
  "terms.acceptance",
  "terms.accounts",
  "terms.credits",
  "terms.content",
  "terms.ip",
  "terms.prohibited",
  "terms.limitation",
  "terms.termination",
  "terms.changes",
  "terms.contact",
];

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t("terms.metaTitle")}
        description={t("terms.metaDescription")}
      />
      <div className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
          {t("terms.title")}
        </h1>
        <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-tertiary)]">
          {t("terms.lastUpdated")}
        </p>

        <div className="mt-[var(--space-8)] flex flex-col gap-[var(--space-6)]">
          {SECTIONS.map((key) => (
            <section key={key}>
              <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
                {t(`${key}.title`)}
              </h2>
              <p className="mt-[var(--space-2)] text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
                {t(`${key}.content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
