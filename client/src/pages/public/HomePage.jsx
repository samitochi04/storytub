import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button } from "@/components/ui";
import VideoStatus from "@/components/shared/VideoStatus";
import { generateGuestPreview } from "@/services/guest.service";

export default function HomePage() {
  const { t } = useTranslation();
  const [topic, setTopic] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setVideoId(null);
    setCompleted(false);

    try {
      const data = await generateGuestPreview({ topic: trimmed });
      setVideoId(data.video_id);
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = useCallback(() => setCompleted(true), []);
  const handleError = useCallback(
    (video) => setError(video.error_message || t("guest.generationFailed")),
    [t],
  );

  return (
    <>
      <SEOHead
        title={null}
        description="Create viral short videos automatically with AI. Generate scripts, voiceovers, and captions in French and English."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "StoryTub",
          url: "https://storytub.com",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          description: "AI-powered viral video generator",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-16)]">
        {/* Hero */}
        <div className="mx-auto max-w-[600px] text-center">
          <h1 className="text-[32px] font-bold leading-[1.15] text-[var(--color-text-primary)]">
            {t("pages.homeTitle")}
          </h1>
          <p className="mt-[var(--space-4)] text-[14px] leading-[1.5] text-[var(--color-text-secondary)]">
            {t("guest.heroDescription")}
          </p>
        </div>

        {/* Guest CTA */}
        <div className="mx-auto mt-[var(--space-12)] max-w-[480px]">
          <form
            onSubmit={handleGenerate}
            className="flex flex-col gap-[var(--space-3)]"
          >
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("guest.topicPlaceholder")}
              maxLength={500}
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[14px] py-[var(--space-3)] text-[13px] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] placeholder:text-[var(--color-text-tertiary)] transition-all duration-150 focus:border-[var(--color-border-focus)] focus:outline-none"
            />
            <Button
              type="submit"
              disabled={loading || !topic.trim()}
              size="lg"
              className="w-full"
            >
              <Sparkles size={16} strokeWidth={1.5} />
              {loading ? t("guest.generating") : t("guest.tryFree")}
            </Button>
          </form>

          {error && (
            <p className="mt-[var(--space-3)] text-center text-[12px] text-[var(--color-error)]">
              {error}
            </p>
          )}

          {videoId && !error && (
            <div className="mt-[var(--space-4)]">
              <VideoStatus
                videoId={videoId}
                initialStatus="pending"
                onComplete={handleComplete}
                onError={handleError}
              />
            </div>
          )}

          {completed && (
            <p className="mt-[var(--space-3)] text-center text-[12px] text-[var(--color-success)]">
              {t("guest.previewReady")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
