import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { getCoupons, saveCoupon, deleteCoupon } from "@/services/admin.service";

const EMPTY_FORM = {
  code: "",
  description: "",
  discount_percent: "",
  discount_amount: "",
  credits_bonus: "",
  max_uses: "",
  valid_from: "",
  valid_until: "",
  is_active: true,
  applies_to: "all",
  min_purchase_amount: "",
};

function CouponModal({ coupon, onClose, onSave, t }) {
  const [form, setForm] = useState(coupon ? { ...coupon } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fields = {
        code: form.code,
        description: form.description || null,
        discount_percent: form.discount_percent
          ? Number(form.discount_percent)
          : null,
        discount_amount: form.discount_amount
          ? Number(form.discount_amount)
          : null,
        credits_bonus: form.credits_bonus ? Number(form.credits_bonus) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
        applies_to: form.applies_to,
        min_purchase_amount: form.min_purchase_amount
          ? Number(form.min_purchase_amount)
          : null,
      };
      await onSave(coupon?.id || null, fields);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {coupon ? t("adminPages.editCoupon") : t("adminPages.createCoupon")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="mt-[var(--space-4)] space-y-[var(--space-3)]">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.couponCode")}
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              required
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.description")}
            </label>
            <input
              type="text"
              value={form.description || ""}
              onChange={(e) => update("description", e.target.value)}
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.discountPercent")}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.discount_percent || ""}
                onChange={(e) => update("discount_percent", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.discountAmount")}
              </label>
              <input
                type="number"
                min="0"
                value={form.discount_amount || ""}
                onChange={(e) => update("discount_amount", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.creditsBonus")}
              </label>
              <input
                type="number"
                min="0"
                value={form.credits_bonus || ""}
                onChange={(e) => update("credits_bonus", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.maxUses")}
              </label>
              <input
                type="number"
                min="0"
                value={form.max_uses || ""}
                onChange={(e) => update("max_uses", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.validFrom")}
              </label>
              <input
                type="datetime-local"
                value={form.valid_from?.slice(0, 16) || ""}
                onChange={(e) => update("valid_from", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.validUntil")}
              </label>
              <input
                type="datetime-local"
                value={form.valid_until?.slice(0, 16) || ""}
                onChange={(e) => update("valid_until", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.appliesTo")}
              </label>
              <select
                value={form.applies_to}
                onChange={(e) => update("applies_to", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
              >
                <option value="all">All</option>
                <option value="subscription">Subscription</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {t("adminPages.minPurchase")}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_purchase_amount || ""}
                onChange={(e) => update("min_purchase_amount", e.target.value)}
                className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-[var(--space-2)]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              id="coupon-active"
              className="accent-[var(--color-brand-blue)]"
            />
            <label
              htmlFor="coupon-active"
              className="text-[13px] text-[var(--color-text-secondary)]"
            >
              {t("adminPages.active")}
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.code}
          className="mt-[var(--space-6)] w-full rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)] disabled:opacity-50"
        >
          {saving ? t("adminPages.saving") : t("adminPages.save")}
        </button>
      </form>
    </div>
  );
}

export default function AdminCouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCoupons({ page, limit })
      .then(({ coupons: c, total: t }) => {
        setCoupons(c);
        setTotal(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(id, fields) {
    await saveCoupon(id, fields);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t("adminPages.confirmDelete"))) return;
    try {
      await deleteCoupon(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SEOHead title="Admin Coupons" noindex />
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.couponsTitle")}
          </h1>
          <button
            onClick={() => setModal("new")}
            className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)]"
          >
            <Plus size={16} />
            {t("adminPages.createCoupon")}
          </button>
        </div>

        {error && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="mt-[var(--space-6)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.code")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.discount")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.creditsBonus")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.uses")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.appliesTo")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.status")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-[var(--space-8)] text-center">
                    <Loader2
                      size={20}
                      className="mx-auto animate-spin text-[var(--color-text-secondary)]"
                    />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                  >
                    {t("adminPages.noResults")}
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="px-[var(--space-4)] py-[var(--space-3)] font-mono text-[var(--color-text-primary)]">
                      {coupon.code}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                      {coupon.discount_percent
                        ? `${coupon.discount_percent}%`
                        : coupon.discount_amount
                          ? `$${coupon.discount_amount}`
                          : "N/A"}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                      {coupon.credits_bonus || "N/A"}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {coupon.current_uses}
                      {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] capitalize text-[var(--color-text-secondary)]">
                      {coupon.applies_to}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <span
                        className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${
                          coupon.is_active
                            ? "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {coupon.is_active
                          ? t("adminPages.active")
                          : t("adminPages.inactive")}
                      </span>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-2)]">
                        <button
                          onClick={() => setModal(coupon)}
                          className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-error)] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-[var(--space-4)] flex items-center justify-between text-[13px] text-[var(--color-text-secondary)]">
            <span>
              {t("adminPages.showing")} {(page - 1) * limit + 1}
              {" - "}
              {Math.min(page * limit, total)} {t("adminPages.of")} {total}
            </span>
            <div className="flex items-center gap-[var(--space-2)]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <CouponModal
          coupon={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          t={t}
        />
      )}
    </>
  );
}
