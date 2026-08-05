<template>
  <div class="relative w-full " ref="dropdownRef">
    <button type="button" @click="isOpen = !isOpen"
      class="w-full flex justify-between px-3 py-2 rounded-sm border text-sm transition-all duration-200 input"
      :class="isOpen
      ? ' ring-2 ring-gray-300  bg-white dark:bg-surface-800'
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-800'"

    >
      <span class="text-gray-700 dark:text-gray-300">
        {{ selectedLabel }}
      </span>
      <i class="ri-arrow-down-s-line text-gray-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      ></i>
    </button>
      <div name="dropdown">
        <ul
          v-if="isOpen"
          class="absolute z-50 w-full mt-1 bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden"
        >
          <li
            v-for="option in options"
            :key="option.value"
            @click="select(option)"
            class="flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors duration-150"
            :class="option.value === modelValue
              ? 'bg-gray-200 text-gray-600 dark:text-gray-600 font-medium'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-100'"
          >
            {{$t(option.label) }}
            <i v-if="option.value === modelValue" class="ri-check-line  dark:text-gray-600"></i>
          </li>
        </ul>
      </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { onClickOutside } from '@vueuse/core';
  import { useI18n } from 'vue-i18n';

  interface DropdownOption {
    value: string;
    label: string;
  }

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    options: DropdownOption[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>();

  const isOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const selectedLabel = computed(() => {
    const found = props.options.find(o => o.value === props.modelValue);
    return found ? t(found.label) : '';
  });

  const select = (option: DropdownOption) => {
    emit('update:modelValue', option.value);
    isOpen.value = false;
  };

  onClickOutside(dropdownRef, () => isOpen.value = false);
</script>
