import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { redeemCoupon } from "@/services/coupon.service";
import useCredits from "@/hooks/useCredits";

export default function CouponInput() {
  const { t } = useTranslation();
  const { refresh } = useCredits();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleRedeem(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await redeemCoupon(code.trim());
      setResult(data);
      setCode("");
      refresh();
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleRedeem} className="flex gap-[var(--space-2)]">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("billing.couponPlaceholder")}
          maxLength={64}
          className="flex-1"
        />
        <Button type="submit" size="md" disabled={loading || !code.trim()}>
          <Gift size={14} strokeWidth={1.5} />
          {t("billing.redeem")}
        </Button>
      </form>
      {error && (
        <p className="mt-[var(--space-2)] text-[11px] text-[var(--color-error)]">
          {error}
        </p>
      )}
      {result && (
        <p className="mt-[var(--space-2)] text-[11px] text-[var(--color-success)]">
          {result.credits_bonus > 0 &&
            `+${result.credits_bonus.toLocaleString()} ${t("pricing.credits")}! `}
          {result.discount_percent > 0 &&
            `${result.discount_percent}% ${t("billing.discountApplied")}`}
        </p>
      )}
    </div>
  );
}
