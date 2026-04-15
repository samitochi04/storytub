import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui";
import useCredits from "@/hooks/useCredits";

const TYPE_COLORS = {
  signup_bonus: "text-[var(--color-success)]",
  subscription: "text-[var(--color-success)]",
  bundle: "text-[var(--color-success)]",
  coupon: "text-[var(--color-success)]",
  admin_adjustment: "text-[var(--color-info)]",
  refund: "text-[var(--color-warning)]",
  video_generation: "text-[var(--color-error)]",
};

export default function TransactionHistory() {
  const { t } = useTranslation();
  const { transactions, loading, fetchTransactions } = useCredits();

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-[var(--space-4)]">
        <Spinner size={20} />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="py-[var(--space-4)] text-center text-[12px] text-[var(--color-text-tertiary)]">
        {t("billing.noTransactions")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] transition-colors hover:bg-[var(--color-bg-hover)]"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-[var(--color-text-primary)]">
              {t(`billing.txType.${tx.type}`, tx.type)}
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              {new Date(tx.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`text-[12px] font-bold ${TYPE_COLORS[tx.type] || "text-[var(--color-text-primary)]"}`}
          >
            {tx.amount > 0 ? "+" : ""}
            {tx.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
