import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Film, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui";
import { supabase } from "@/config/supabase";

const STATUS_ICON = {
  pending: Loader2,
  generating: Loader2,
  rendering: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

const STATUS_VARIANT = {
  pending: "default",
  generating: "brand",
  rendering: "brand",
  completed: "success",
  failed: "error",
};

export default function VideoCard({ video }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(video.status);

  const isProcessing = status !== "completed" && status !== "failed";

  useEffect(() => {
    if (!isProcessing) return;

    const channel = supabase
      .channel(`video-card-${video.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${video.id}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [video.id, isProcessing]);

  const StatusIcon = STATUS_ICON[status] || Film;
  const date = new Date(video.created_at).toLocaleDateString();

  return (
    <Link
      to={`/videos/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)] transition-all duration-150 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-hover)]"
    >
      {/* Thumbnail */}
      <div className="relative flex h-[120px] items-center justify-center bg-[var(--color-bg-hover)]">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Film
            size={28}
            strokeWidth={1.5}
            className="text-[var(--color-text-tertiary)]"
          />
        )}
        {video.duration_seconds && (
          <span className="absolute bottom-[var(--space-1)] right-[var(--space-1)] flex items-center gap-1 rounded-[var(--radius-xs)] bg-black/70 px-[var(--space-1)] py-[1px] text-[10px] text-white">
            <Clock size={10} strokeWidth={1.5} />
            {video.duration_seconds}s
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-[var(--space-3)]">
        <p className="text-[12px] font-bold leading-[1.4] text-[var(--color-text-primary)] line-clamp-2">
          {video.title}
        </p>
        <div className="mt-auto flex items-center justify-between pt-[var(--space-2)]">
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            {date}
          </span>
          <Badge variant={STATUS_VARIANT[status] || "default"}>
            <StatusIcon
              size={10}
              strokeWidth={1.5}
              className={isProcessing ? "animate-spin" : ""}
            />
            <span className="ml-1">{t(`videoStatus.${status}`)}</span>
          </Badge>
        </div>
      </div>
    </Link>
  );
}
