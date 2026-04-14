import useThemeStore from "@/stores/themeStore";

export default function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return { theme, setTheme, isDark, toggle };
}
