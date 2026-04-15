import { Sun, Moon } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";

export default function ThemeToggle({ className = "", expanded = false }) {
  const { isDark, toggle } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center gap-[var(--space-3)] h-[32px] rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all duration-150 cursor-pointer ${
        expanded ? "px-[var(--space-3)] w-full" : "justify-center w-[32px]"
      } ${className}`}
    >
      {isDark ? (
        <Sun
          size={18}
          strokeWidth={1.5}
          strokeLinecap="round"
          className="shrink-0"
        />
      ) : (
        <Moon
          size={18}
          strokeWidth={1.5}
          strokeLinecap="round"
          className="shrink-0"
        />
      )}
      {expanded && (
        <span className="text-[12px] font-normal whitespace-nowrap overflow-hidden">
          {isDark ? t("sidebar.lightMode") : t("sidebar.darkMode")}
        </span>
      )}
    </button>
  );
}
