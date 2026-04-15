import { useTranslation } from "react-i18next";
import { User, Mail, Image, SlidersHorizontal } from "lucide-react";

const PROMPT_CARDS = [
  {
    key: "dashboard.prompts.personal",
    icon: User,
  },
  {
    key: "dashboard.prompts.email",
    icon: Mail,
  },
  {
    key: "dashboard.prompts.summarize",
    icon: Image,
  },
  {
    key: "dashboard.prompts.technical",
    icon: SlidersHorizontal,
  },
];

export default function PromptCards({ onSelect }) {
  const { t } = useTranslation();

  return (
    <div className="mb-[var(--space-6)] grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
      {PROMPT_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect(t(card.key))}
            className="flex min-h-[60px] cursor-pointer flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[14px] py-[var(--space-3)] text-left shadow-[var(--shadow-sm)] transition-all duration-150 hover:bg-[var(--color-bg-hover)]"
          >
            <span className="text-[12px] font-normal leading-[1.45] text-[var(--color-text-primary)]">
              {t(card.key)}
            </span>
            <Icon
              size={18}
              strokeWidth={1.5}
              strokeLinecap="round"
              className="mt-[var(--space-2)] text-[var(--color-text-tertiary)]"
            />
          </button>
        );
      })}
    </div>
  );
}
