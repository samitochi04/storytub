import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getVideos, retryVideo } from "@/services/admin.service";

const STATUS_COLORS = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  generating:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  rendering:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  completed: "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30",
  failed: "bg-red-100 text-[var(--color-error)] dark:bg-red-950/30",
};

export default function AdminVideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getVideos({ page, limit, status, search })
      .then(({ videos: v, total: t }) => {
        setVideos(v);
        setTotal(t);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRetry(videoId) {
    setRetrying(videoId);
    try {
      await retryVideo(videoId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRetrying(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SEOHead title="Admin Videos" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("adminPages.videosTitle")}
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
              placeholder={t("adminPages.searchVideos")}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] py-[var(--space-2)] pl-[var(--space-8)] pr-[var(--space-3)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
          >
            <option value="">{t("adminPages.allStatuses")}</option>
            <option value="pending">Pending</option>
            <option value="generating">Generating</option>
            <option value="rendering">Rendering</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
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
                  {t("adminPages.title")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.user")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.status")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.credits")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.duration")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.created")}
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
              ) : videos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                  >
                    {t("adminPages.noResults")}
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="max-w-[200px] truncate px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                      {video.title || video.topic}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {video.profiles?.email || "Guest"}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <span
                        className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${STATUS_COLORS[video.status] || ""}`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-primary)]">
                      {video.credits_charged}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {video.duration_seconds
                        ? `${video.duration_seconds}s`
                        : "N/A"}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {new Date(video.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      {video.status === "failed" && video.retry_count < 3 && (
                        <button
                          onClick={() => handleRetry(video.id)}
                          disabled={retrying === video.id}
                          title={t("adminPages.retry")}
                          className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-warning)] transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                        >
                          {retrying === video.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                        </button>
                      )}
                      {video.status === "failed" && video.error_message && (
                        <span
                          className="ml-[var(--space-2)] text-[11px] text-[var(--color-error)]"
                          title={video.error_message}
                        >
                          {video.error_message.slice(0, 30)}
                          {video.error_message.length > 30 ? "..." : ""}
                        </span>
                      )}
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
    </>
  );
}
