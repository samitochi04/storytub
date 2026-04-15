import { useTranslation } from "react-i18next";
import { Button, Badge } from "@/components/ui";

export default function BundleCard({ bundle, onSelect, loading }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = lang === "fr" ? bundle.name_fr : bundle.name_en;
  const price = (bundle.price_cents / 100).toFixed(0);
  const centsPerCredit = ((bundle.price_cents / bundle.credits) * 100).toFixed(
    1,
  );

  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <h3 className="text-[14px] font-bold text-[var(--color-text-primary)]">
        {name}
      </h3>
      <p className="mt-[var(--space-1)] text-[20px] font-bold text-[var(--color-text-primary)]">
        ${price}
      </p>
      <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-brand-blue)]">
        {bundle.credits.toLocaleString()} {t("pricing.credits")}
      </p>
      <p className="mt-[var(--space-1)] text-[11px] text-[var(--color-text-tertiary)]">
        {centsPerCredit}c/{t("pricing.creditUnit")}
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-[var(--space-4)] w-full"
        onClick={onSelect}
        disabled={loading}
      >
        {t("pricing.buyBundle")}
      </Button>
    </div>
  );
}
