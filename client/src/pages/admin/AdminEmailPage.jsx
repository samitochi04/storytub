import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Mail,
  Send,
} from "lucide-react";
import {
  getEmailCampaigns,
  getEmailLogs,
  saveEmailCampaign,
} from "@/services/admin.service";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  sending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  sent: "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30",
  canceled: "bg-red-100 text-[var(--color-error)] dark:bg-red-950/30",
};

function CampaignModal({ campaign, onClose, onSave, t }) {
  const isEdit = !!campaign;
  const [form, setForm] = useState({
    name: campaign?.name || "",
    subject_en: campaign?.subject_en || "",
    subject_fr: campaign?.subject_fr || "",
    status: campaign?.status || "draft",
    scheduled_at: campaign?.scheduled_at?.slice(0, 16) || "",
  });
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
        ...form,
        scheduled_at: form.scheduled_at || null,
      };
      await onSave(campaign?.id || null, fields);
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
        className="w-full max-w-[480px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {isEdit
              ? t("adminPages.editCampaign")
              : t("adminPages.createCampaign")}
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
              {t("adminPages.campaignName")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.subjectEn")}
            </label>
            <input
              type="text"
              value={form.subject_en}
              onChange={(e) => update("subject_en", e.target.value)}
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.subjectFr")}
            </label>
            <input
              type="text"
              value={form.subject_fr}
              onChange={(e) => update("subject_fr", e.target.value)}
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.status")}
            </label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.scheduledAt")}
            </label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => update("scheduled_at", e.target.value)}
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.name}
          className="mt-[var(--space-6)] w-full rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)] disabled:opacity-50"
        >
          {saving ? t("adminPages.saving") : t("adminPages.save")}
        </button>
      </form>
    </div>
  );
}

export default function AdminEmailPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignPage, setCampaignPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const loadCampaigns = useCallback(() => {
    setLoading(true);
    getEmailCampaigns({ page: campaignPage, limit: 25 })
      .then(({ campaigns: c, total: t }) => {
        setCampaigns(c);
        setCampaignTotal(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [campaignPage]);

  const loadLogs = useCallback(() => {
    setLoading(true);
    getEmailLogs({ page: logPage, limit: 50 })
      .then(({ logs: l, total: t }) => {
        setLogs(l);
        setLogTotal(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [logPage]);

  useEffect(() => {
    if (tab === "campaigns") loadCampaigns();
    else loadLogs();
  }, [tab, loadCampaigns, loadLogs]);

  async function handleSave(id, fields) {
    await saveEmailCampaign(id, fields);
    loadCampaigns();
  }

  const campaignPages = Math.ceil(campaignTotal / 25);
  const logPages = Math.ceil(logTotal / 50);

  return (
    <>
      <SEOHead title="Admin Emails" noindex />
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.emailTitle")}
          </h1>
          {tab === "campaigns" && (
            <button
              onClick={() => setModal("new")}
              className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)]"
            >
              <Plus size={16} />
              {t("adminPages.createCampaign")}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-[var(--space-6)] flex border-b border-[var(--color-border-default)]">
          <button
            onClick={() => setTab("campaigns")}
            className={`px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium transition-colors ${
              tab === "campaigns"
                ? "border-b-2 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Mail size={14} className="mr-[var(--space-2)] inline" />
            {t("adminPages.campaigns")}
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium transition-colors ${
              tab === "logs"
                ? "border-b-2 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Send size={14} className="mr-[var(--space-2)] inline" />
            {t("adminPages.emailLogs")}
          </button>
        </div>

        {error && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Campaigns Tab */}
        {tab === "campaigns" && (
          <>
            <div className="mt-[var(--space-4)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.name")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.subject")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.status")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.sent")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.opened")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-[var(--space-8)] text-center"
                      >
                        <Loader2
                          size={20}
                          className="mx-auto animate-spin text-[var(--color-text-secondary)]"
                        />
                      </td>
                    </tr>
                  ) : campaigns.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                      >
                        {t("adminPages.noResults")}
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                      >
                        <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                          {c.name}
                        </td>
                        <td className="max-w-[200px] truncate px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                          {c.subject_en || c.subject_fr}
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)]">
                          <span
                            className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${STATUS_COLORS[c.status] || ""}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                          {c.sent_count ?? 0} / {c.total_recipients ?? 0}
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                          {c.opened_count ?? 0}
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)]">
                          <button
                            onClick={() => setModal(c)}
                            className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                          >
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {campaignPages > 1 && (
              <div className="mt-[var(--space-4)] flex items-center justify-end gap-[var(--space-2)] text-[13px] text-[var(--color-text-secondary)]">
                <button
                  onClick={() => setCampaignPage((p) => Math.max(1, p - 1))}
                  disabled={campaignPage === 1}
                  className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  {campaignPage} / {campaignPages}
                </span>
                <button
                  onClick={() =>
                    setCampaignPage((p) => Math.min(campaignPages, p + 1))
                  }
                  disabled={campaignPage === campaignPages}
                  className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Logs Tab */}
        {tab === "logs" && (
          <>
            <div className="mt-[var(--space-4)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.email")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.subject")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.type")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.status")}
                    </th>
                    <th className="px-[var(--space-4)] py-[var(--space-3)]">
                      {t("adminPages.sentAt")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-[var(--space-8)] text-center"
                      >
                        <Loader2
                          size={20}
                          className="mx-auto animate-spin text-[var(--color-text-secondary)]"
                        />
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                      >
                        {t("adminPages.noResults")}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                      >
                        <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                          {log.email_address}
                        </td>
                        <td className="max-w-[200px] truncate px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                          {log.subject}
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)] capitalize text-[var(--color-text-secondary)]">
                          {log.email_type}
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)]">
                          <span
                            className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${
                              log.status === "sent"
                                ? "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30"
                                : log.status === "bounced"
                                  ? "bg-red-100 text-[var(--color-error)] dark:bg-red-950/30"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                          {log.sent_at
                            ? new Date(log.sent_at).toLocaleString()
                            : "Pending"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {logPages > 1 && (
              <div className="mt-[var(--space-4)] flex items-center justify-end gap-[var(--space-2)] text-[13px] text-[var(--color-text-secondary)]">
                <button
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  disabled={logPage === 1}
                  className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  {logPage} / {logPages}
                </span>
                <button
                  onClick={() => setLogPage((p) => Math.min(logPages, p + 1))}
                  disabled={logPage === logPages}
                  className="rounded-[var(--radius-xs)] p-[var(--space-1)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <CampaignModal
          campaign={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          t={t}
        />
      )}
    </>
  );
}
