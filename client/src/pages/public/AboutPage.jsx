import { useTranslation } from "react-i18next";
import { Target, Heart, Lightbulb } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";

const VALUES = [
  { icon: Target, key: "about.value1" },
  { icon: Heart, key: "about.value2" },
  { icon: Lightbulb, key: "about.value3" },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t("about.metaTitle")}
        description={t("about.metaDescription")}
      />
      <div className="mx-auto max-w-[800px] px-[var(--space-4)] py-[var(--space-16)]">
        {/* Mission */}
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
            {t("about.title")}
          </h1>
          <p className="mt-[var(--space-4)] text-[14px] leading-[1.6] text-[var(--color-text-secondary)]">
            {t("about.mission")}
          </p>
        </div>

        {/* Story */}
        <div className="mt-[var(--space-12)]">
          <h2 className="text-[20px] font-bold text-[var(--color-text-primary)]">
            {t("about.storyTitle")}
          </h2>
          <p className="mt-[var(--space-3)] text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
            {t("about.storyContent")}
          </p>
        </div>

        {/* Values */}
        <div className="mt-[var(--space-12)]">
          <h2 className="text-center text-[20px] font-bold text-[var(--color-text-primary)]">
            {t("about.valuesTitle")}
          </h2>
          <div className="mt-[var(--space-6)] grid gap-[var(--space-4)] sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] text-center shadow-[var(--shadow-sm)]"
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="mx-auto text-[var(--color-brand-blue)]"
                />
                <h3 className="mt-[var(--space-2)] text-[13px] font-bold text-[var(--color-text-primary)]">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
                  {t(`${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
