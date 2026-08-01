<script setup lang="ts">
  import { ref, watchEffect } from 'vue';

  const props = withDefaults(defineProps<{
    modelValue: boolean;
    zIndex?: number;
  }>(), {
    zIndex: 50,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

  const query = ref('');
  const inputRef = ref<HTMLInputElement | null>(null);

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
          class="w-full h-[140px] pt-5 bg-white backdrop-blur-md dark:bg-surface-800 shadow-xl pointer-events-auto"
        >
          <div class="flex items-center gap-3 px-6 sm:p-0 sm:pt-5 max-w-[1316px] mx-auto  left-0 right-0 max-xl py-4 border-b border-gray-400 dark:border-gray-300"> 
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              :placeholder="$t('nav.search')"
              class="flex-1 bg-transparent placeholder-gray-600 dark:placeholder-gray-400 text-[18px] outline-none"
            />
            <div class="flex items-center gap-4">
              <button
                class="text-surface-100 cursor-pointer dark:text-gray-200"
                aria-label="Search"
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
