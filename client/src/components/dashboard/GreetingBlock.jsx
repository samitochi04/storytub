import { useTranslation } from "react-i18next";
import useAuthStore from "@/stores/authStore";

export default function GreetingBlock() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);

  const firstName = profile?.display_name?.split(" ")[0] || "";

  return (
    <div className="mb-[var(--space-16)]">
      <h1 className="text-[24px] font-bold leading-[1.15]">
        <span className="text-[var(--color-text-primary)]">
          {t("dashboard.greeting")}{" "}
        </span>
        {firstName && (
          <span className="text-[var(--color-text-brand)]">{firstName}</span>
        )}
      </h1>
      <h2 className="mt-[var(--space-1)] text-[24px] font-bold leading-[1.15] text-[var(--color-text-brand)]">
        {t("dashboard.tagline")}
      </h2>
      <p className="mt-[var(--space-3)] max-w-[400px] text-[12px] font-normal leading-[1.5] text-[var(--color-text-secondary)]">
        {t("dashboard.subtitle")}
      </p>
    </div>
  );
}
