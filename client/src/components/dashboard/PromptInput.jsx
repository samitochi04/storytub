import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Image, Globe } from "lucide-react";
import { PROMPT_MAX_LENGTH } from "@/config/constants";

export default function PromptInput({ initialValue = "" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef(null);

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

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    navigate("/generate", { state: { prompt: trimmed } });
  }

  const charCount = value.length;
  const isOverLimit = charCount > PROMPT_MAX_LENGTH;
  const canSubmit = value.trim().length > 0 && !isOverLimit;

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
          className="min-h-[40px] flex-1 resize-none border-none bg-transparent text-[13px] font-normal text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
        />
        <span className="flex shrink-0 items-center gap-[var(--space-1)] rounded-full border border-[var(--color-border-default)] px-[var(--space-2)] py-[2px] text-[11px] text-[var(--color-text-secondary)]">
          <Globe size={12} strokeWidth={1.5} />
          {t("dashboard.scopeAll")}
        </span>
      </div>

      {/* Bottom row: actions + counter + send */}
      <div className="mt-[var(--space-6)] flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            type="button"
            className="flex items-center gap-[var(--space-1)] text-[11px] text-[var(--color-text-tertiary)] transition-colors duration-150 hover:text-[var(--color-text-secondary)]"
          >
            <Plus size={14} strokeWidth={1.5} />
            {t("dashboard.addAttachment")}
          </button>
          <button
            type="button"
            className="flex items-center gap-[var(--space-1)] text-[11px] text-[var(--color-text-tertiary)] transition-colors duration-150 hover:text-[var(--color-text-secondary)]"
          >
            <Image size={14} strokeWidth={1.5} />
            {t("dashboard.useImage")}
          </button>
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
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </form>
  );
}
