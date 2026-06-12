import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const darkMode = ref<boolean>(
    localStorage.getItem('chhatstore_dark') === 'true',
  );

  watch(
    darkMode,
    (val) => {
      localStorage.setItem('chhatstore_dark', String(val));
      document.documentElement.classList.toggle('dark', val);
    },
    { immediate: true },
  );

  const toggleDarkMode = (): void => {
    darkMode.value = !darkMode.value;
  };

  return { darkMode, toggleDarkMode };
});
