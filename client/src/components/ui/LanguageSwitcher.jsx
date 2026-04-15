import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import useI18n from "@/hooks/useI18n";

export default function LanguageSwitcher({ className = "" }) {
  const { language, changeLanguage, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.value === language);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)] cursor-pointer transition-colors duration-150"
      >
        <Globe size={14} strokeWidth={1.5} />
        {current?.label}
        <ChevronDown size={10} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 min-w-[100px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-md)] py-1 z-50">
          {languages.map((lng) => (
            <button
              key={lng.value}
              onClick={() => {
                changeLanguage(lng.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors duration-150 ${
                lng.value === language
                  ? "text-[var(--color-brand-blue)] bg-[var(--color-bg-hover)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {lng.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
