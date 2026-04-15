import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Globe,
  Mic,
  Captions,
  Film,
  Clock,
  Star,
} from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button } from "@/components/ui";
import VideoStatus from "@/components/shared/VideoStatus";
import { generateGuestPreview } from "@/services/guest.service";

const FEATURES = [
  { icon: Zap, key: "home.feature1" },
  { icon: Globe, key: "home.feature2" },
  { icon: Mic, key: "home.feature3" },
  { icon: Captions, key: "home.feature4" },
  { icon: Film, key: "home.feature5" },
  { icon: Clock, key: "home.feature6" },
];

const TESTIMONIALS = [
  { name: "Alex R.", role: "Content Creator", key: "home.testimonial1" },
  { name: "Marie D.", role: "Social Media Manager", key: "home.testimonial2" },
  { name: "James L.", role: "Entrepreneur", key: "home.testimonial3" },
];

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

      {/* Hero */}
      <section className="mx-auto max-w-[1000px] px-[var(--space-4)] pt-[var(--space-16)] pb-[var(--space-12)]">
        <div className="mx-auto max-w-[600px] text-center">
          <h1 className="text-[36px] font-bold leading-[1.1] text-[var(--color-text-primary)] sm:text-[44px]">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-[var(--space-4)] text-[15px] leading-[1.6] text-[var(--color-text-secondary)]">
            {t("home.heroDescription")}
          </p>
        </div>

        {/* Guest CTA */}
        <div className="mx-auto mt-[var(--space-8)] max-w-[480px]">
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

        <p className="mt-[var(--space-4)] text-center text-[11px] text-[var(--color-text-tertiary)]">
          {t("home.noCard")}
        </p>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-[1000px] px-[var(--space-4)] py-[var(--space-12)]">
        <h2 className="text-center text-[22px] font-bold text-[var(--color-text-primary)]">
          {t("home.featuresTitle")}
        </h2>
        <div className="mt-[var(--space-8)] grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className="text-[var(--color-brand-blue)]"
              />
              <h3 className="mt-[var(--space-3)] text-[14px] font-bold text-[var(--color-text-primary)]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-[1000px] px-[var(--space-4)] py-[var(--space-12)]">
        <h2 className="text-center text-[22px] font-bold text-[var(--color-text-primary)]">
          {t("home.testimonialsTitle")}
        </h2>
        <div className="mt-[var(--space-8)] grid gap-[var(--space-4)] sm:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, key }) => (
            <div
              key={key}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-4)] shadow-[var(--shadow-sm)]"
            >
              <div className="flex gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    strokeWidth={0}
                    fill="var(--color-warning)"
                  />
                ))}
              </div>
              <p className="mt-[var(--space-3)] text-[12px] leading-[1.5] text-[var(--color-text-secondary)]">
                "{t(key)}"
              </p>
              <div className="mt-[var(--space-3)]">
                <p className="text-[12px] font-bold text-[var(--color-text-primary)]">
                  {name}
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  {role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1000px] px-[var(--space-4)] py-[var(--space-16)] text-center">
        <h2 className="text-[22px] font-bold text-[var(--color-text-primary)]">
          {t("home.ctaTitle")}
        </h2>
        <p className="mt-[var(--space-2)] text-[14px] text-[var(--color-text-secondary)]">
          {t("home.ctaDescription")}
        </p>
        <Link to="/signup">
          <Button size="lg" className="mt-[var(--space-4)]">
            {t("home.ctaButton")}
          </Button>
        </Link>
      </section>
    </>
  );
}
