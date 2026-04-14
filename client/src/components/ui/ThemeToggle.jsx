import { Sun, Moon } from "lucide-react";
import useTheme from "@/hooks/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center justify-center w-[30px] h-[30px] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all duration-150 cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.5} strokeLinecap="round" />
      ) : (
        <Moon size={16} strokeWidth={1.5} strokeLinecap="round" />
      )}
    </button>
  );
}
