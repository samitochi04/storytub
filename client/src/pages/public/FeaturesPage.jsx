import { useTranslation } from "react-i18next";
import {
  Zap,
  Globe,
  Mic,
  Captions,
  Film,
  Clock,
  Palette,
  BarChart3,
  Shield,
} from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";

const FEATURES = [
  { icon: Zap, key: "features.aiScripts" },
  { icon: Mic, key: "features.voiceover" },
  { icon: Captions, key: "features.captions" },
  { icon: Globe, key: "features.multilingual" },
  { icon: Film, key: "features.templates" },
  { icon: Clock, key: "features.fast" },
  { icon: Palette, key: "features.branding" },
  { icon: BarChart3, key: "features.analytics" },
  { icon: Shield, key: "features.safe" },
];

export default function FeaturesPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t("features.metaTitle")}
        description={t("features.metaDescription")}
      />
      <div className="mx-auto max-w-[1000px] px-[var(--space-4)] py-[var(--space-16)]">
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">
            {t("features.title")}
          </h1>
          <p className="mt-[var(--space-3)] text-[14px] text-[var(--color-text-secondary)]">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-[var(--space-10)] grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-5)] shadow-[var(--shadow-sm)]"
            >
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-blue)]/10">
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="text-[var(--color-brand-blue)]"
                />
              </div>
              <h3 className="mt-[var(--space-3)] text-[14px] font-bold text-[var(--color-text-primary)]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-[var(--space-1)] text-[12px] leading-[1.5] text-[var(--color-text-secondary)]">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
