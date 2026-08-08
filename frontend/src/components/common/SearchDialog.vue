<script setup lang="ts">
  import { ref, watchEffect } from 'vue';
  import { useSearchHistory } from '@/composables/useSearchHistory';

  const props = withDefaults(defineProps<{
    modelValue: boolean;
    zIndex?: number;
  }>(), {
    zIndex: 50,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'search': [query: string];
  }>();

  const query = ref('');
  const inputRef = ref<HTMLInputElement | null>(null);
  const { searchHistory, addSearchTerm, removeSearchTerm, clearHistory } = useSearchHistory();

  watchEffect(() => {
    if (props.modelValue) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.documentElement.style.overflow = 'hidden';
      setTimeout(() => inputRef.value?.focus(), 50);
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.removeProperty('--scrollbar-width');
      query.value = '';
    }
  });

  const close = () => {
    emit('update:modelValue', false);
  };

  const submitSearch = (term?: string) => {
    const finalTerm = (term ?? query.value).trim();
    if (!finalTerm) return;
    addSearchTerm(finalTerm);
    emit('search', finalTerm);
    close();
  };

  const handleRemove = (term: string, event: Event) => {
    event.stopPropagation();
    removeSearchTerm(term);
  };
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="props.modelValue"
        class="fixed inset-0 bg-black/50"
        :style="{ zIndex: props.zIndex }"
        @click="close"
      />
    </Transition>
    <div
      class="fixed h-full top-0 left-0 w-full overflow-hidden pointer-events-none"
      :style="{ zIndex: props.zIndex + 1 }"
    >
      <Transition name="bar">
        <div
          v-if="props.modelValue"
          class="w-full min-h-[140px] pt-5 pb-6 bg-white backdrop-blur-md dark:bg-surface-800 shadow-xl pointer-events-auto"
        >
          <div class="flex items-center gap-3 px-6 sm:p-0 sm:pt-5 max-w-[1316px] mx-auto left-0 right-0 max-xl py-4 border-b border-gray-400 dark:border-gray-300">
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              :placeholder="$t('nav.search')"
              aria-label="Search"
              @keyup.enter="submitSearch()"
              class="flex-1 bg-transparent placeholder-gray-600 dark:placeholder-gray-400 text-[18px] outline-none"
            />
            <div class="flex items-center gap-4">
              <button
                class="text-surface-100 cursor-pointer dark:text-gray-200"
                aria-label="Search"
                @click="submitSearch()"
              >
                <i class="ri-search-line text-xl" />
              </button>
              <button
                class="text-surface-100 cursor-pointer dark:text-gray-200"
                aria-label="Close"
                @click="close"
              >
                <i class="ri-close-line text-2xl" />
              </button>
            </div>
          </div>

          <div v-if="searchHistory.length > 0" class="max-w-[1316px] mx-auto px-6 sm:px-0 pt-5">
            <div class="flex items-center justify-between mb-3">
              <span class="font-semibold text-[15px] text-gray-900 dark:text-gray-100">
                Recent Searches
              </span>
              <button
                class="text-gray-900 dark:text-gray-100 text-[15px] underline font-semibold cursor-pointer"
                @click="clearHistory"
              >
                Clear All
              </button>
            </div>

            <ul class="flex flex-col gap-1">
              <li
                v-for="term in searchHistory"
                :key="term"
                class="flex items-center justify-between rounded hover:bg-gray-50 dark:hover:bg-surface-700 cursor-pointer group"
                @click="submitSearch(term)"
              >
                <div class="flex items-center gap-3">
                  <i class="ri-history-line text-gray-900 dark:text-gray-300 text-lg"></i>
                  <span class="text-gray-900 dark:text-gray-200 text-[15px]">{{ term }}</span>
                </div>

                <button
                  class="w-6 h-6 flex items-center justify-center rounded opacity-90 hover:opacity-100 transition cursor-pointer"
                  @click="handleRemove(term, $event)"
                >
                  <i class="ri-close-line text-xl text-gray-900 dark:text-gray-300"></i>
                </button>
              </li>
            </ul>
          </div>

          <div v-if="query" class="max-h-[70vh] overflow-y-auto">
            <slot :query="query" />
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.bar-enter-active {
  animation: slideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.bar-leave-active {
  animation: slideUp 0.3s ease-in forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}
</style>
