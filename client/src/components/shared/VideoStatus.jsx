import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/config/supabase";
import { ProgressBar } from "@/components/ui";

const STATUS_CONFIG = {
  pending: { progress: 10, icon: Loader2, variant: "brand" },
  generating: { progress: 40, icon: Loader2, variant: "brand" },
  rendering: { progress: 75, icon: Loader2, variant: "brand" },
  completed: { progress: 100, icon: CheckCircle, variant: "success" },
  failed: { progress: 100, icon: XCircle, variant: "error" },
};

/**
 * VideoStatus - shows real-time progress for a video being generated.
 * Subscribes to Supabase Realtime channel for instant status updates.
 *
 * @param {string} videoId - UUID of the video record
 * @param {string} initialStatus - initial status from the API response
 * @param {function} onComplete - callback when status reaches "completed"
 * @param {function} onError - callback when status reaches "failed"
 */
export default function VideoStatus({
  videoId,
  initialStatus = "pending",
  onComplete,
  onError,
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    const channel = supabase
      .channel(`video-status-${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${videoId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setStatus(newStatus);

          if (newStatus === "completed") {
            onComplete?.(payload.new);
          } else if (newStatus === "failed") {
            setErrorMessage(payload.new.error_message);
            onError?.(payload.new);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, onComplete, onError]);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const isAnimating = status !== "completed" && status !== "failed";

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]">
      <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
        <Icon
          size={18}
          strokeWidth={1.5}
          className={`${
            status === "completed"
              ? "text-[var(--color-success)]"
              : status === "failed"
                ? "text-[var(--color-error)]"
                : "text-[var(--color-brand-blue)] animate-spin"
          } ${isAnimating ? "" : ""}`}
        />
        <span className="text-[13px] font-normal text-[var(--color-text-primary)]">
          {t(`videoStatus.${status}`)}
        </span>
      </div>

      <ProgressBar
        value={config.progress}
        max={100}
        size="sm"
        className="mb-[var(--space-2)]"
      />

      <p className="text-[11px] text-[var(--color-text-tertiary)]">
        {errorMessage || t(`videoStatus.${status}Description`)}
      </p>
    </div>
  );
}
