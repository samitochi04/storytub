import { Globe } from "lucide-react";
import useI18n from "@/hooks/useI18n";

export default function LanguageSwitcher({ className = "" }) {
  const { language, changeLanguage, languages } = useI18n();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe
        size={14}
        strokeWidth={1.5}
        strokeLinecap="round"
        className="absolute left-2 pointer-events-none text-[var(--color-text-secondary)]"
      />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-transparent text-[11px] text-[var(--color-text-secondary)] pl-7 pr-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)] cursor-pointer transition-colors duration-150 focus:outline-none focus:border-[var(--color-border-focus)]"
      >
        {languages.map((lng) => (
          <option key={lng.value} value={lng.value}>
            {lng.label}
          </option>
        ))}
      </select>
    </div>
  );
}
