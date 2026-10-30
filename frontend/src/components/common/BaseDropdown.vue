<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { onClickOutside } from '@vueuse/core';
  import { useI18n } from 'vue-i18n';

  interface DropdownOption {
    value: string;
    label: string;
  }

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      options: DropdownOption[];
      placeholder?: string;
      disabled?: boolean;
    }>(),
    {
      modelValue: '',
      placeholder: 'Select an option',
      disabled: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const isOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const selectedOption = computed(() => {
    return props.options.find((o) => o.value === props.modelValue);
  });

  const selectedLabel = computed(() => {
    if (selectedOption.value) {
      return selectedOption.value.label;
    }
    return props.placeholder ? t(props.placeholder) : '';
  });

  const select = (option: DropdownOption) => {
    if (props.disabled) return;
    emit('update:modelValue', option.value);
    isOpen.value = false;
  };

  onClickOutside(dropdownRef, () => (isOpen.value = false));
</script>

<!-- BaseDropdown.vue template snippet -->
<template>
  <div class="relative w-full" ref="dropdownRef">
    <button 
      type="button" 
      @click="isOpen = !isOpen"
      :disabled="disabled"
      class="w-full flex justify-between items-center text-black/80 px-2.5 py-1.5 rounded-sm border text-xs transition-all cursor-pointer duration-200 input bg-white dark:bg-surface-800 border-gray-200 dark:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      :class="isOpen ? 'ring-1 ring-black/20' : ''"
    >
      <span class="truncate capitalize pr-1" :class="selectedOption ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-white/50'">
        {{ selectedLabel }}
      </span>
      <i 
        class="ri-arrow-down-s-line text-gray-400 transition-transform duration-200 shrink-0"
        :class="isOpen ? 'rotate-180' : ''"
      ></i>
    </button>

    <!-- Ensure absolute positioning and z-index -->
    <div v-if="isOpen && !disabled" class="absolute left-0 top-full z-50 w-full mt-1">
      <ul
        class="w-full max-h-48 overflow-y-auto bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg"
      >
        <li
          v-for="option in options"
          :key="option.value"
          @click="select(option)"
          class="flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer transition-colors duration-150"
          :class="option.value === modelValue
            ? 'bg-gray-100 text-gray-900 font-semibold dark:bg-surface-700 dark:text-white'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-700'"
        >
          <span class="truncate pr-1">{{ option.label }}</span>
          <i v-if="option.value === modelValue" class="ri-check-line text-black dark:text-white shrink-0"></i>
        </li>
      </ul>
    </div>
  </div>
</template>
