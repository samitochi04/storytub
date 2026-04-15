import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Search,
  Ban,
  ShieldCheck,
  Coins,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  getUsers,
  banUser,
  unbanUser,
  adjustCredits,
} from "@/services/admin.service";

function StatusBadge({ banned }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${
        banned
          ? "bg-red-100 text-[var(--color-error)] dark:bg-red-950/30"
          : "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30"
      }`}
    >
      {banned ? "Banned" : "Active"}
    </span>
  );
}

function CreditModal({ user, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (!num || isNaN(num)) return;
    setSaving(true);
    try {
      await onConfirm(user.id, num, description);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.adjustCredits")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mt-[var(--space-2)] text-[13px] text-[var(--color-text-secondary)]">
          {user.email} ({user.credits_balance} credits)
        </p>
        <label className="mt-[var(--space-4)] block text-[12px] font-medium text-[var(--color-text-secondary)]">
          {t("adminPages.amount")}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="+10 or -5"
          className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
          required
        />
        <label className="mt-[var(--space-3)] block text-[12px] font-medium text-[var(--color-text-secondary)]">
          {t("adminPages.reason")}
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
        />
        <button
          type="submit"
          disabled={saving || !amount}
          className="mt-[var(--space-4)] w-full rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)] disabled:opacity-50"
        >
          {saving ? t("adminPages.saving") : t("adminPages.confirm")}
        </button>
      </form>
    </div>
  );
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [banned, setBanned] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditModal, setCreditModal] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getUsers({ page, limit, search, plan, banned })
      .then(({ users: u, total: t }) => {
        setUsers(u);
        setTotal(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, plan, banned]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBanToggle(user) {
    try {
      if (user.is_banned) {
        await unbanUser(user.id);
      } else {
        await banUser(user.id, "Banned by admin");
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreditAdjust(userId, amount, description) {
    await adjustCredits(userId, amount, description);
    load();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SEOHead title="Admin Users" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.usersTitle")}
        </h1>

        {/* Filters */}
        <div className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-3)]">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("adminPages.searchUsers")}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] py-[var(--space-2)] pl-[var(--space-8)] pr-[var(--space-3)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setPage(1);
            }}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
          >
            <option value="">{t("adminPages.allPlans")}</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={banned}
            onChange={(e) => {
              setBanned(e.target.value);
              setPage(1);
            }}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
          >
            <option value="">{t("adminPages.allStatuses")}</option>
            <option value="false">{t("adminPages.active")}</option>
            <option value="true">{t("adminPages.banned")}</option>
          </select>
        </div>

        {error && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="mt-[var(--space-4)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.email")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.plan")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.credits")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.status")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.joined")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-[var(--space-8)] text-center">
                    <Loader2
                      size={20}
                      className="mx-auto animate-spin text-[var(--color-text-secondary)]"
                    />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                  >
                    {t("adminPages.noResults")}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="text-[var(--color-text-primary)]">
                        {user.email}
                      </div>
                      {user.display_name && (
                        <div className="text-[11px] text-[var(--color-text-tertiary)]">
                          {user.display_name}
                        </div>
                      )}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] capitalize text-[var(--color-text-primary)]">
                      {user.subscription_plan || "free"}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                      {user.credits_balance}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <StatusBadge banned={user.is_banned} />
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-2)]">
                        <button
                          onClick={() => handleBanToggle(user)}
                          title={
                            user.is_banned
                              ? t("adminPages.unban")
                              : t("adminPages.ban")
                          }
                          className={`rounded-[var(--radius-xs)] p-[var(--space-1)] transition-colors ${
                            user.is_banned
                              ? "text-[var(--color-success)] hover:bg-green-50 dark:hover:bg-green-950/20"
                              : "text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-950/20"
                          }`}
                        >
                          {user.is_banned ? (
                            <ShieldCheck size={16} />
                          ) : (
                            <Ban size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setCreditModal(user)}
                          title={t("adminPages.adjustCredits")}
                          className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        >
                          <Coins size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {creditModal && (
        <CreditModal
          user={creditModal}
          onClose={() => setCreditModal(null)}
          onConfirm={handleCreditAdjust}
        />
      )}
    </>
  );
}
