import { ref, watch, onMounted, onUnmounted } from "vue";

type Theme = "light" | "dark" | "system";

const theme = ref<Theme>("system");

const applyTheme = () => {
  if (typeof window === "undefined") return;

  const isDark =
    theme.value === "dark" ||
    (theme.value === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const getStoredTheme = (): Theme => {
  if (typeof localStorage === "undefined") return "system";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system")
    return stored;
  return "system";
};

// Initialize state
theme.value = getStoredTheme();

// Global Watcher
watch(theme, (newTheme) => {
  localStorage.setItem("theme", newTheme);
  applyTheme();
});

export function useTheme() {
  const handleSystemChange = () => {
    if (theme.value === "system") applyTheme();
  };

  onMounted(() => {
    applyTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemChange);

    // Clean up on unmount of the calling component
    onUnmounted(() => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    });
  });

  return { theme, applyTheme };
}
