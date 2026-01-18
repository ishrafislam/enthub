import { ref, watch, onMounted, onUnmounted } from 'vue';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const getStoredTheme = (): Theme => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  };

  const theme = ref<Theme>(getStoredTheme());

  const applyTheme = () => {
    const isDark = 
      theme.value === 'dark' || 
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
    applyTheme();
  });

  let mediaQuery: MediaQueryList;
  const handleSystemChange = () => {
    if (theme.value === 'system') applyTheme();
  };

  onMounted(() => {
    applyTheme();
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemChange);
  });

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleSystemChange);
  });

  return { theme, applyTheme };
}
