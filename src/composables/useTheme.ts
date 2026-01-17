import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const theme = ref<Theme>(localStorage.getItem('theme') as Theme || 'system');

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

  onMounted(() => {
    applyTheme();
    // Listen for system changes if in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme();
    });
  });

  return { theme, applyTheme };
}
