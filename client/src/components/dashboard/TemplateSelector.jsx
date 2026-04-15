import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { listTemplates } from "@/services/video.service";
import { SkeletonCard } from "@/components/ui";

export default function TemplateSelector({ value, onChange }) {
  const { t, i18n } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTemplates()
      .then((data) => {
        if (!cancelled) setTemplates(data.templates || data || []);
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lang = i18n.language === "fr" ? "fr" : "en";

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-[12px] text-[var(--color-text-tertiary)]">
        {t("generate.noTemplates")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3">
      {templates.map((tpl) => {
        const isSelected = value === tpl.id;
        const name = lang === "fr" ? tpl.name_fr : tpl.name_en;
        const desc = lang === "fr" ? tpl.description_fr : tpl.description_en;

        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onChange(tpl.id)}
            className={`flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)] transition-all duration-150 text-left ${
              isSelected
                ? "border-[var(--color-brand-blue)] ring-1 ring-[var(--color-brand-blue)]"
                : "border-[var(--color-border-default)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)]"
            }`}
          >
            {tpl.thumbnail_url ? (
              <img
                src={tpl.thumbnail_url}
                alt={name}
                className="h-[80px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[80px] w-full items-center justify-center bg-[var(--color-bg-hover)]">
                <span className="text-[20px]">
                  {tpl.id === "story_mode"
                    ? "📖"
                    : tpl.id === "top_5"
                      ? "🏆"
                      : tpl.id === "motivation"
                        ? "💪"
                        : tpl.id === "did_you_know"
                          ? "💡"
                          : tpl.id === "news_recap"
                            ? "📰"
                            : "🎬"}
                </span>
              </div>
            )}
            <div className="p-[var(--space-2)]">
              <p className="text-[12px] font-bold text-[var(--color-text-primary)]">
                {name || tpl.id}
              </p>
              {desc && (
                <p className="mt-[2px] text-[11px] leading-[1.4] text-[var(--color-text-tertiary)]">
                  {desc}
                </p>
              )}
              {tpl.is_premium && (
                <span className="mt-[var(--space-1)] inline-block rounded-[var(--radius-xs)] bg-[var(--color-brand-blue)]/10 px-[var(--space-1)] py-[1px] text-[10px] text-[var(--color-brand-blue)]">
                  Premium
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
