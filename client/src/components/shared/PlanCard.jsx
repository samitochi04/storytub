import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button, Badge } from "@/components/ui";

export default function PlanCard({
  plan,
  interval,
  isCurrentPlan,
  onSelect,
  loading,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = lang === "fr" ? plan.name_fr : plan.name_en;
  const description = lang === "fr" ? plan.description_fr : plan.description_en;

  const price =
    interval === "yearly" && plan.price_yearly_cents != null
      ? plan.price_yearly_cents
      : plan.price_monthly_cents;

  const monthly =
    interval === "yearly" && plan.price_yearly_cents != null
      ? Math.round(plan.price_yearly_cents / 12)
      : plan.price_monthly_cents;

  const features = plan.features || {};
  const isFree = plan.id === "free";
  const isPopular = plan.id === "starter";

  return (
    <div
      className={`relative flex flex-col rounded-[var(--radius-lg)] border bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${
        isPopular
          ? "border-[var(--color-brand-blue)] ring-1 ring-[var(--color-brand-blue)]/20"
          : "border-[var(--color-border-default)]"
      }`}
    >
      {isPopular && (
        <Badge
          variant="brand"
          className="absolute -top-[10px] left-1/2 -translate-x-1/2"
        >
          {t("pricing.popular")}
        </Badge>
      )}

      <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
        {name}
      </h3>

      {description && (
        <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}

      <div className="mt-[var(--space-4)]">
        <span className="text-[28px] font-bold text-[var(--color-text-primary)]">
          {isFree ? t("pricing.free") : `$${(monthly / 100).toFixed(0)}`}
        </span>
        {!isFree && (
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            /{t("pricing.month")}
          </span>
        )}
      </div>

      {!isFree && interval === "yearly" && (
        <p className="mt-[var(--space-1)] text-[11px] text-[var(--color-text-tertiary)]">
          ${(price / 100).toFixed(0)}/{t("pricing.year")}
        </p>
      )}

      <p className="mt-[var(--space-3)] text-[12px] font-bold text-[var(--color-brand-blue)]">
        {plan.credits_monthly?.toLocaleString()} {t("pricing.creditsPerMonth")}
      </p>

      <ul className="mt-[var(--space-4)] flex flex-1 flex-col gap-[var(--space-2)]">
        {Object.entries(features).map(([key, value]) => (
          <li
            key={key}
            className="flex items-start gap-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]"
          >
            <Check
              size={14}
              strokeWidth={1.5}
              className="mt-[1px] shrink-0 text-[var(--color-success)]"
            />
            <span>
              {lang === "fr" && typeof value === "object"
                ? value.fr
                : typeof value === "object"
                  ? value.en
                  : value}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-[var(--space-6)]">
        {isCurrentPlan ? (
          <Button variant="secondary" size="md" disabled className="w-full">
            {t("pricing.currentPlan")}
          </Button>
        ) : (
          <Button
            variant={isPopular ? "primary" : "secondary"}
            size="md"
            className="w-full"
            onClick={onSelect}
            disabled={loading}
          >
            {isFree ? t("pricing.getStarted") : t("pricing.subscribe")}
          </Button>
        )}
      </div>
    </div>
  );
}
