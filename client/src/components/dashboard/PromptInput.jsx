import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, ChevronDown, Loader2, Clock } from "lucide-react";
import {
  PROMPT_MAX_LENGTH,
  DEFAULT_VOICES,
  CONTENT_STYLES,
  VIDEO_DEFAULT_DURATION,
  VIDEO_MIN_DURATION,
  VIDEO_MAX_DURATION,
} from "@/config/constants";
import { generateVideo } from "@/services/video.service";
import useAuthStore from "@/stores/authStore";

export default function PromptInput({ initialValue = "" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const [value, setValue] = useState(initialValue);
  const [style, setStyle] = useState("");
  const [duration, setDuration] = useState(VIDEO_DEFAULT_DURATION);
  const [styleOpen, setStyleOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.max(textareaRef.current.scrollHeight, 80) + "px";
    }
  }, [value]);

  useEffect(() => {
    if (!styleOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setStyleOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [styleOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const lang = profile?.language || "en";
      const defaultVoice =
        DEFAULT_VOICES.find((v) => v.language === lang) || DEFAULT_VOICES[0];

      let topic = trimmed;
      if (style) {
        topic = `[Style: ${style}] ${trimmed}`;
      }

      const data = await generateVideo({
        topic,
        language: lang,
        templateId: "story_mode",
        voiceId: defaultVoice.id,
        targetDuration: duration,
      });

      navigate(`/videos/${data.video_id}`);
    } catch (err) {
      setError(err.body?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const charCount = value.length;
  const isOverLimit = charCount > PROMPT_MAX_LENGTH;
  const canSubmit = value.trim().length > 0 && !isOverLimit && !submitting;

  const selectedStyleLabel = style
    ? t(`dashboard.styles.${style}`)
    : t("dashboard.styleDefault");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[14px] py-[var(--space-3)] shadow-[var(--shadow-sm)] transition-all duration-150 focus-within:border-[var(--color-border-focus)]"
    >
      {/* Top row: textarea + scope badge */}
      <div className="flex items-start gap-[var(--space-2)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("dashboard.inputPlaceholder")}
          rows={1}
          disabled={submitting}
          className="min-h-[40px] flex-1 resize-none border-none bg-transparent text-[13px] font-normal text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none disabled:opacity-50"
        />
        <span className="flex shrink-0 items-center gap-[var(--space-1)] rounded-full border border-[var(--color-border-default)] px-[var(--space-2)] py-[2px] text-[11px] text-[var(--color-text-secondary)]">
          <Globe size={12} strokeWidth={1.5} />
          {t("dashboard.scopeAll")}
        </span>
      </div>

      {error && (
        <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-error)]">
          {error}
        </p>
      )}

      {/* Bottom row: style dropdown + duration + counter + send */}
      <div className="mt-[var(--space-6)] flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-3)]">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setStyleOpen(!styleOpen)}
              className="flex items-center gap-[var(--space-1)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] px-[var(--space-2)] py-[4px] text-[11px] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-hover)]"
            >
              {selectedStyleLabel}
              <ChevronDown size={12} strokeWidth={1.5} />
            </button>
            {styleOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-[var(--space-1)] min-w-[160px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-[var(--space-1)] shadow-[var(--shadow-lg)]">
                <button
                  type="button"
                  onClick={() => {
                    setStyle("");
                    setStyleOpen(false);
                  }}
                  className={`w-full px-[var(--space-3)] py-[var(--space-2)] text-left text-[12px] transition-colors hover:bg-[var(--color-bg-hover)] ${!style ? "font-bold text-[var(--color-brand-blue)]" : "text-[var(--color-text-primary)]"}`}
                >
                  {t("dashboard.styleDefault")}
                </button>
                {CONTENT_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStyle(s);
                      setStyleOpen(false);
                    }}
                    className={`w-full px-[var(--space-3)] py-[var(--space-2)] text-left text-[12px] transition-colors hover:bg-[var(--color-bg-hover)] ${style === s ? "font-bold text-[var(--color-brand-blue)]" : "text-[var(--color-text-primary)]"}`}
                  >
                    {t(`dashboard.styles.${s}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration selector */}
          <div className="flex items-center gap-[var(--space-1)]">
            <Clock
              size={12}
              strokeWidth={1.5}
              className="text-[var(--color-text-tertiary)]"
            />
            <input
              type="range"
              min={VIDEO_MIN_DURATION}
              max={VIDEO_MAX_DURATION}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-[60px] h-[3px] accent-[var(--color-brand-blue)] cursor-pointer"
            />
            <span className="text-[11px] text-[var(--color-text-secondary)] min-w-[28px]">
              {duration}s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-[var(--space-3)]">
          <span
            className={`text-[11px] ${isOverLimit ? "text-[var(--color-error)]" : "text-[var(--color-text-tertiary)]"}`}
          >
            {charCount}/{PROMPT_MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-blue)] text-white transition-all duration-150 hover:bg-[var(--color-brand-blue-mid)] active:scale-[0.98] active:bg-[var(--color-brand-blue-dark)] disabled:opacity-40 disabled:pointer-events-none"
            aria-label={t("dashboard.send")}
          >
            {submitting ? (
              <Loader2 size={16} strokeWidth={2} className="animate-spin" />
            ) : (
              <ArrowRight size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
