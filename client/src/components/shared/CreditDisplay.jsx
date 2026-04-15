import { useTranslation } from "react-i18next";
import { Coins } from "lucide-react";
import useCredits from "@/hooks/useCredits";

export default function CreditDisplay({ expanded = false }) {
  const { t } = useTranslation();
  const { balance } = useCredits();

  if (balance === null) return null;

  const displayBalance =
    balance >= 1000 ? `${(balance / 1000).toFixed(1)}k` : balance;

  return (
    <div
      title={t("credits.balance")}
      className={`flex items-center gap-[var(--space-1)] h-[32px] rounded-[var(--radius-md)] transition-all duration-150 ${
        expanded ? "px-[var(--space-3)] w-full" : "justify-center w-[32px]"
      }`}
    >
      <Coins
        size={22}
        strokeWidth={1.5}
        className="text-[var(--color-warning)] shrink-0"
      />
      {expanded ? (
        <span className="text-[12px] font-normal text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden">
          {displayBalance} {t("credits.balance")}
        </span>
      ) : (
        <span className="text-[10px] font-bold text-[var(--color-text-primary)]">
          {displayBalance}
        </span>
      )}
    </div>
  );
}
