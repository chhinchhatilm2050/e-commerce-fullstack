import { ref } from 'vue';
import { getSerchHistory, setSearchHistory } from './useLocalStorage.ts';

const loadHistory = (): string[] => {
  try {
    const raw = getSerchHistory();
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};
const searchHistory = ref<string[]>(loadHistory());

const saveHistory = (): void => {
  setSearchHistory(searchHistory.value);
};

export const useSearchHistory = () => {
  const addSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    searchHistory.value = searchHistory.value.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    searchHistory.value.unshift(trimmed);

    if (searchHistory.value.length > 8) {
      searchHistory.value = searchHistory.value.slice(0, 8);
    }

    saveHistory();
  };

  const removeSearchTerm = (term: string) => {
    searchHistory.value = searchHistory.value.filter((t) => t !== term);
    saveHistory();
  };

  const clearHistory = () => {
    searchHistory.value = [];
    saveHistory();
  };

  return {
    searchHistory,
    addSearchTerm,
    removeSearchTerm,
    clearHistory,
  };
};
