import { create } from "zustand";

function getInitialTheme() {
  try {
    return localStorage.getItem("theme") || "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  root.classList.toggle("dark", isDark);
}

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage unavailable
    }
    applyTheme(theme);
    set({ theme });
  },
}));

// Apply theme on load
applyTheme(useThemeStore.getState().theme);

// Listen for system preference changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    const { theme } = useThemeStore.getState();
    if (theme === "system") applyTheme("system");
  });

export default useThemeStore;
