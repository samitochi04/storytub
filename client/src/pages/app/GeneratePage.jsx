import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Select } from "@/components/ui";
import TemplateSelector from "@/components/dashboard/TemplateSelector";
import VideoStatus from "@/components/shared/VideoStatus";
import { generateVideo, listVoices } from "@/services/video.service";
import useAuthStore from "@/stores/authStore";
import {
  PROMPT_MAX_LENGTH,
  VIDEO_MIN_DURATION,
  VIDEO_MAX_DURATION,
  VIDEO_DEFAULT_DURATION,
  SUPPORTED_LANGUAGES,
  calculateCredits,
} from "@/config/constants";

export default function GeneratePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const [topic, setTopic] = useState(location.state?.prompt || "");
  const [language, setLanguage] = useState("en");
  const [templateId, setTemplateId] = useState("story_mode");
  const [voiceId, setVoiceId] = useState("");
  const [duration, setDuration] = useState(VIDEO_DEFAULT_DURATION);
  const [voices, setVoices] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);

  const credits = calculateCredits(duration);
  const balance = profile?.credits_balance ?? 0;
  const canAfford = balance >= credits;

  useEffect(() => {
    let cancelled = false;
    setVoicesLoading(true);
    listVoices()
      .then((data) => {
        if (cancelled) return;
        const list = data.voices || data || [];
        setVoices(list);
        if (list.length > 0 && !voiceId)
          setVoiceId(list[0].id || list[0].kokoro_voice_id);
      })
      .catch(() => {
        if (!cancelled) setVoices([]);
      })
      .finally(() => {
        if (!cancelled) setVoicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim() || !templateId || !voiceId) return;
    setSubmitting(true);
    setError(null);

    try {
      const data = await generateVideo({
        topic: topic.trim(),
        language,
        templateId,
        voiceId,
        targetDuration: duration,
      });
      setVideoId(data.video_id);
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const voiceOptions = voices.map((v) => ({
    value: v.id || v.kokoro_voice_id,
    label: v.name || v.kokoro_voice_id,
  }));

  const langOptions = SUPPORTED_LANGUAGES.map((l) => ({
    value: l.value,
    label: l.label,
  }));

  return (
    <>
      <SEOHead title="Generate" noindex />
      <div className="mx-auto max-w-[600px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          {t("generate.title")}
        </h1>
        <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
          {t("generate.subtitle")}
        </p>

        {videoId ? (
          <div className="mt-[var(--space-6)]">
            <VideoStatus
              videoId={videoId}
              initialStatus="pending"
              onComplete={() => navigate(`/videos/${videoId}`)}
            />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-[var(--space-6)] flex flex-col gap-[var(--space-6)]"
          >
            {/* Topic */}
            <div className="flex flex-col gap-[var(--space-1)]">
              <label className="text-[12px] font-normal text-[var(--color-text-secondary)]">
                {t("generate.topicLabel")}
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("generate.topicPlaceholder")}
                maxLength={PROMPT_MAX_LENGTH}
                rows={3}
                className="w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[14px] py-[var(--space-3)] text-[13px] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] placeholder:text-[var(--color-text-tertiary)] transition-all duration-150 focus:border-[var(--color-border-focus)] focus:outline-none"
              />
              <span className="self-end text-[11px] text-[var(--color-text-tertiary)]">
                {topic.length}/{PROMPT_MAX_LENGTH}
              </span>
            </div>

            {/* Template */}
            <div className="flex flex-col gap-[var(--space-2)]">
              <label className="text-[12px] font-normal text-[var(--color-text-secondary)]">
                {t("generate.templateLabel")}
              </label>
              <TemplateSelector value={templateId} onChange={setTemplateId} />
            </div>

            {/* Language + Voice row */}
            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              <Select
                label={t("generate.languageLabel")}
                options={langOptions}
                value={language}
                onChange={setLanguage}
              />
              <Select
                label={t("generate.voiceLabel")}
                options={voiceOptions}
                value={voiceId}
                onChange={setVoiceId}
                placeholder={
                  voicesLoading
                    ? t("common.loading")
                    : t("generate.voicePlaceholder")
                }
                disabled={voicesLoading}
              />
            </div>

            {/* Duration slider */}
            <div className="flex flex-col gap-[var(--space-2)]">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-normal text-[var(--color-text-secondary)]">
                  {t("generate.durationLabel")}
                </label>
                <span className="text-[12px] font-bold text-[var(--color-text-primary)]">
                  {duration}s
                </span>
              </div>
              <input
                type="range"
                min={VIDEO_MIN_DURATION}
                max={VIDEO_MAX_DURATION}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[var(--color-brand-blue)]"
              />
              <div className="flex justify-between text-[11px] text-[var(--color-text-tertiary)]">
                <span>{VIDEO_MIN_DURATION}s</span>
                <span>{VIDEO_MAX_DURATION}s</span>
              </div>
            </div>

            {/* Credit cost preview */}
            <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[14px] py-[var(--space-3)] shadow-[var(--shadow-sm)]">
              <div>
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  {t("generate.estimatedCost")}
                </p>
                <p className="text-[16px] font-bold text-[var(--color-text-primary)]">
                  {credits.toLocaleString()} {t("generate.credits")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  {t("generate.yourBalance")}
                </p>
                <p
                  className={`text-[16px] font-bold ${canAfford ? "text-[var(--color-text-primary)]" : "text-[var(--color-error)]"}`}
                >
                  {balance.toLocaleString()}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-[var(--color-error)]">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={
                submitting ||
                !topic.trim() ||
                !templateId ||
                !voiceId ||
                !canAfford
              }
              className="w-full"
            >
              <Sparkles size={16} strokeWidth={1.5} />
              {submitting
                ? t("generate.submitting")
                : !canAfford
                  ? t("generate.notEnoughCredits")
                  : t("generate.submit")}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
