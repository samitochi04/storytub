import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  Coins,
  Film,
} from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Badge, Spinner, ConfirmDialog } from "@/components/ui";
import VideoStatus from "@/components/shared/VideoStatus";
import VideoPlayer from "@/components/shared/VideoPlayer";
import {
  getVideo,
  getDownloadUrl,
  getSignedVideoUrl,
  deleteVideo,
  retryVideo,
} from "@/services/video.service";

export default function VideoDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVideo(id)
      .then(async (data) => {
        if (cancelled) return;
        // Get a fresh signed URL for playback
        if (data.video_url) {
          const signedUrl = await getSignedVideoUrl(data.video_url);
          if (signedUrl) data.video_url = signedUrl;
        }
        setVideo(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleComplete = useCallback(
    (updated) => setVideo((prev) => ({ ...prev, ...updated })),
    [],
  );

  async function handleDownload() {
    setDownloading(true);
    try {
      const data = await getDownloadUrl(id);
      const res = await fetch(data.url);
      const blob = await res.blob();
      const filename = (video.title || "storytub-video")
        .replace(/[^a-zA-Z0-9_\- ]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 80);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${filename}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      // download error handled silently
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/videos/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVideo(id);
      navigate("/videos");
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      await retryVideo(id);
      setVideo((prev) => ({ ...prev, status: "pending" }));
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-[600px] px-[var(--space-4)] py-[var(--space-8)] text-center">
        <p className="text-[14px] text-[var(--color-error)]">
          {error || t("videoDetail.notFound")}
        </p>
        <Button
          variant="ghost"
          onClick={() => navigate("/videos")}
          className="mt-[var(--space-4)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("videoDetail.backToVideos")}
        </Button>
      </div>
    );
  }

  const isProcessing =
    video.status !== "completed" && video.status !== "failed";
  const isFailed = video.status === "failed";
  const isCompleted = video.status === "completed";
  const date = new Date(video.created_at).toLocaleDateString();

  return (
    <>
      <SEOHead title={video.title || "Video"} noindex />
      <div className="mx-auto max-w-[700px] px-[var(--space-4)] py-[var(--space-8)]">
        {/* Back button */}
        <button
          onClick={() => navigate("/videos")}
          className="mb-[var(--space-4)] flex items-center gap-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("videoDetail.backToVideos")}
        </button>

        {/* Video player / status */}
        {isProcessing && (
          <VideoStatus
            videoId={video.id}
            initialStatus={video.status}
            onComplete={handleComplete}
          />
        )}

        {isCompleted && video.video_url && (
          <VideoPlayer src={video.video_url} poster={video.thumbnail_url} />
        )}

        {isCompleted && !video.video_url && (
          <div className="flex h-[300px] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-hover)]">
            <Film
              size={40}
              strokeWidth={1.5}
              className="text-[var(--color-text-tertiary)]"
            />
          </div>
        )}

        {isFailed && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)]/20 bg-[var(--color-error)]/5 p-[var(--space-4)]">
            <p className="text-[13px] text-[var(--color-error)]">
              {video.error_message || t("videoStatus.failedDescription")}
            </p>
          </div>
        )}

        {/* Title + actions */}
        <div className="mt-[var(--space-4)]">
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
            {video.title}
          </h1>

          <div className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
            {isCompleted && (
              <>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <Download size={14} strokeWidth={1.5} />
                  {t("videoDetail.download")}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleShare}>
                  <Share2 size={14} strokeWidth={1.5} />
                  {copied ? t("videoDetail.copied") : t("videoDetail.share")}
                </Button>
              </>
            )}
            {isFailed && (
              <Button size="sm" onClick={handleRetry} disabled={retrying}>
                <RefreshCw
                  size={14}
                  strokeWidth={1.5}
                  className={retrying ? "animate-spin" : ""}
                />
                {t("videoDetail.retry")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="ml-auto text-[var(--color-error)]"
            >
              <Trash2 size={14} strokeWidth={1.5} />
              {t("videoDetail.delete")}
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-[var(--space-6)] grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
          <MetaItem
            icon={Calendar}
            label={t("videoDetail.created")}
            value={date}
          />
          <MetaItem
            icon={Clock}
            label={t("videoDetail.duration")}
            value={
              video.duration_seconds
                ? `${video.duration_seconds}s`
                : `${video.target_duration}s`
            }
          />
          <MetaItem
            icon={Coins}
            label={t("videoDetail.creditsUsed")}
            value={video.credits_charged?.toLocaleString()}
          />
          <MetaItem
            icon={Film}
            label={t("videoDetail.language")}
            value={video.language?.toUpperCase()}
          />
        </div>

        {/* Topic */}
        {video.topic && (
          <div className="mt-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-3)] shadow-[var(--shadow-sm)]">
            <p className="text-[11px] font-normal text-[var(--color-text-tertiary)]">
              {t("videoDetail.topic")}
            </p>
            <p className="mt-[var(--space-1)] text-[13px] text-[var(--color-text-primary)]">
              {video.topic}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={t("videoDetail.delete")}
        message={t("videoDetail.confirmDelete")}
        confirmLabel={t("videoDetail.delete")}
        cancelLabel={t("videoDetail.cancel")}
        loading={deleting}
      />
    </>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-[var(--space-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-3)] shadow-[var(--shadow-sm)]">
      <Icon
        size={14}
        strokeWidth={1.5}
        className="text-[var(--color-text-tertiary)]"
      />
      <span className="text-[11px] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
        {value || "-"}
      </span>
    </div>
  );
}
