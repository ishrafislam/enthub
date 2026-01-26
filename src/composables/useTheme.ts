import { ref, watch, onMounted, onUnmounted, computed } from "vue";

type Theme = "light" | "dark" | "system" | "cyberpunk";

const theme = ref<Theme>("system");

const applyTheme = () => {
  if (typeof window === "undefined") return;

  const html = document.documentElement;

  // Remove all theme classes first
  html.classList.remove("dark", "cyberpunk");

  if (theme.value === "cyberpunk") {
    // Cyberpunk theme uses dark as base + cyberpunk class
    html.classList.add("dark", "cyberpunk");
  } else {
    const isDark =
      theme.value === "dark" ||
      (theme.value === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      html.classList.add("dark");
    }
  }
};

const getStoredTheme = (): Theme => {
  if (typeof localStorage === "undefined") return "system";
  const stored = localStorage.getItem("theme");
  if (
    stored === "light" ||
    stored === "dark" ||
    stored === "system" ||
    stored === "cyberpunk"
  )
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

  // Computed property to check if cyberpunk theme is active
  const isCyberpunk = computed(() => theme.value === "cyberpunk");

  onMounted(() => {
    applyTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemChange);

    // Clean up on unmount of the calling component
    onUnmounted(() => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    });
  });

  return { theme, applyTheme, isCyberpunk };
}
