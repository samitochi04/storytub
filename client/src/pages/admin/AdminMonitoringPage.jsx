import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Loader2,
  AlertCircle,
  Server,
  Database,
  Film,
  Mail,
  RefreshCw,
  Clock,
  ScrollText,
} from "lucide-react";
import { getMonitoringOverview, getAuditLogs } from "@/services/admin.service";

function InfoCard({ icon: Icon, title, items, color }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-[var(--space-2)]">
        <Icon size={18} style={{ color }} />
        <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
          {title}
        </h2>
      </div>
      <div className="mt-[var(--space-4)]">
        {items.map(({ label, value, status }) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-[var(--color-border-default)] py-[var(--space-2)] last:border-0"
          >
            <span className="text-[13px] text-[var(--color-text-secondary)]">
              {label}
            </span>
            <span
              className={`text-[13px] font-medium ${
                status === "ok"
                  ? "text-[var(--color-success)]"
                  : status === "error"
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-text-primary)]"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminMonitoringPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("system");
  const [monitoring, setMonitoring] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadMonitoring() {
    setLoading(true);
    setError(null);
    getMonitoringOverview()
      .then(setMonitoring)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function loadAuditLogs() {
    setLoading(true);
    setError(null);
    getAuditLogs()
      .then(setAuditLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (tab === "system") loadMonitoring();
    else loadAuditLogs();
  }, [tab]);

  function formatUptime(seconds) {
    if (!seconds) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  function formatBytes(bytes) {
    if (!bytes) return "N/A";
    const mb = (bytes / 1024 / 1024).toFixed(1);
    return `${mb} MB`;
  }

  return (
    <>
      <SEOHead title="Admin Monitoring" noindex />
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.monitoringTitle")}
          </h1>
          <button
            onClick={() =>
              tab === "system" ? loadMonitoring() : loadAuditLogs()
            }
            className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] px-[var(--space-3)] py-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]"
          >
            <RefreshCw size={14} />
            {t("adminPages.refresh")}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-[var(--space-6)] flex border-b border-[var(--color-border-default)]">
          <button
            onClick={() => setTab("system")}
            className={`px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium transition-colors ${
              tab === "system"
                ? "border-b-2 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Server size={14} className="mr-[var(--space-2)] inline" />
            {t("adminPages.systemHealth")}
          </button>
          <button
            onClick={() => setTab("audit")}
            className={`px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium transition-colors ${
              tab === "audit"
                ? "border-b-2 border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <ScrollText size={14} className="mr-[var(--space-2)] inline" />
            {t("adminPages.auditLogs")}
          </button>
        </div>

        {error && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-[var(--space-16)]">
            <Loader2
              size={24}
              className="animate-spin text-[var(--color-text-secondary)]"
            />
          </div>
        )}

        {/* System Health Tab */}
        {tab === "system" && !loading && monitoring && (
          <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            <InfoCard
              icon={Server}
              title={t("adminPages.server")}
              color="#2B35FF"
              items={[
                {
                  label: "PID",
                  value: monitoring.process?.pid ?? "N/A",
                },
                {
                  label: t("adminPages.uptime"),
                  value: formatUptime(monitoring.process?.uptime),
                },
                {
                  label: t("adminPages.memory"),
                  value: formatBytes(monitoring.process?.memory?.rss),
                },
                {
                  label: t("adminPages.serverTime"),
                  value: monitoring.server_time
                    ? new Date(monitoring.server_time).toLocaleString()
                    : "N/A",
                },
              ]}
            />

            <InfoCard
              icon={Database}
              title="Redis"
              color="#ef4444"
              items={[
                {
                  label: t("adminPages.status"),
                  value: monitoring.redis?.status || "N/A",
                  status: monitoring.redis?.status === "ready" ? "ok" : "error",
                },
                {
                  label: t("adminPages.connectedClients"),
                  value: monitoring.redis?.connected_clients ?? "N/A",
                },
                {
                  label: t("adminPages.usedMemory"),
                  value: monitoring.redis?.used_memory_human || "N/A",
                },
              ]}
            />

            <InfoCard
              icon={Film}
              title={t("adminPages.videoQueue")}
              color="#22c55e"
              items={[
                {
                  label: t("adminPages.waiting"),
                  value: monitoring.queues?.video?.waiting ?? 0,
                },
                {
                  label: t("adminPages.active"),
                  value: monitoring.queues?.video?.active ?? 0,
                },
                {
                  label: t("adminPages.completed"),
                  value: monitoring.queues?.video?.completed ?? 0,
                },
                {
                  label: t("adminPages.failed"),
                  value: monitoring.queues?.video?.failed ?? 0,
                  status:
                    (monitoring.queues?.video?.failed ?? 0) > 0
                      ? "error"
                      : undefined,
                },
              ]}
            />

            <InfoCard
              icon={Mail}
              title={t("adminPages.emailQueue")}
              color="#f59e0b"
              items={[
                {
                  label: t("adminPages.waiting"),
                  value: monitoring.queues?.email?.waiting ?? 0,
                },
                {
                  label: t("adminPages.active"),
                  value: monitoring.queues?.email?.active ?? 0,
                },
                {
                  label: t("adminPages.completed"),
                  value: monitoring.queues?.email?.completed ?? 0,
                },
                {
                  label: t("adminPages.failed"),
                  value: monitoring.queues?.email?.failed ?? 0,
                  status:
                    (monitoring.queues?.email?.failed ?? 0) > 0
                      ? "error"
                      : undefined,
                },
              ]}
            />

            {/* Additional stats */}
            <div className="lg:col-span-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-[var(--space-2)]">
                <Clock size={18} className="text-purple-500" />
                <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
                  {t("adminPages.quickStats")}
                </h2>
              </div>
              <div className="mt-[var(--space-4)] grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-4">
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[var(--color-text-primary)]">
                    {monitoring.failures_last_24h ?? 0}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    {t("adminPages.failures24h")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[var(--color-text-primary)]">
                    {monitoring.pending_videos ?? 0}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    {t("adminPages.pendingVideos")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[var(--color-text-primary)]">
                    {monitoring.queued_emails ?? 0}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    {t("adminPages.queuedEmails")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[var(--color-text-primary)]">
                    {monitoring.oldest_pending_video
                      ? new Date(
                          monitoring.oldest_pending_video,
                        ).toLocaleTimeString()
                      : "None"}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    {t("adminPages.oldestPending")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {tab === "audit" && !loading && (
          <div className="mt-[var(--space-4)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.date")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.staffMember")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.action")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.resource")}
                  </th>
                  <th className="px-[var(--space-4)] py-[var(--space-3)]">
                    {t("adminPages.ip")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                    >
                      {t("adminPages.noResults")}
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                    >
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                        {log.staff_accounts?.display_name ||
                          log.staff_id?.slice(0, 8)}
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)]">
                        <span className="rounded-[var(--radius-xs)] bg-[var(--color-bg-hover)] px-[var(--space-2)] py-[2px] text-[11px] font-medium text-[var(--color-text-primary)]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                        {log.resource_type}
                        {log.resource_id
                          ? ` #${log.resource_id.slice(0, 8)}`
                          : ""}
                      </td>
                      <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-tertiary)]">
                        {log.ip_address || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
