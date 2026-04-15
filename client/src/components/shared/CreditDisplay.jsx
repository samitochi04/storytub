import { useTranslation } from "react-i18next";
import { Coins } from "lucide-react";
import useCredits from "@/hooks/useCredits";

export default function CreditDisplay() {
  const { t } = useTranslation();
  const { balance } = useCredits();

  if (balance === null) return null;

  return (
    <div
      title={t("credits.balance")}
      className="flex flex-col items-center gap-[2px]"
    >
      <Coins
        size={16}
        strokeWidth={1.5}
        className="text-[var(--color-warning)]"
      />
      <span className="text-[10px] font-bold text-[var(--color-text-primary)]">
        {balance >= 1000 ? `${(balance / 1000).toFixed(1)}k` : balance}
      </span>
    </div>
  );
}
