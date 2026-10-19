<script setup lang="ts">
  import { computed, watch } from 'vue';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';

  interface ISpecificationItem {
    key: string;
    value: string;
  }

  const props = defineProps<{
    specifications?: ISpecificationItem[];
  }>();

  const selected = defineModel<Record<string, string>>({ default: () => ({}) });

  const specLabels: Record<string, string> = {
    colors: 'Color',
    sizes: 'Size',
  };

  // Filter specs for Size and Color keys and parse values into array options
  const specEntries = computed(() => {
    const specs = props.specifications || [];
    if (!specs.length) return [];

    const result: [string, string[]][] = [];

    // Match Colors / Color
    const colorSpec = specs.find(
      (item) =>
        item.key.trim().toLowerCase() === 'colors' ||
        item.key.trim().toLowerCase() === 'color',
    );
    if (colorSpec && colorSpec.value) {
      const values = colorSpec.value.split(',').map((v) => v.trim()).filter(Boolean);
      if (values.length) result.push(['colors', values]);
    }

    // Match Sizes / Size
    const sizeSpec = specs.find(
      (item) =>
        item.key.trim().toLowerCase() === 'sizes' ||
        item.key.trim().toLowerCase() === 'size',
    );
    if (sizeSpec && sizeSpec.value) {
      const values = sizeSpec.value.split(',').map((v) => v.trim()).filter(Boolean);
      if (values.length) result.push(['sizes', values]);
    }

    return result;
  });

  function toDropdownOptions(values: string[]) {
    return values.map((v) => ({ value: v, label: v }));
  }

  // Automatically select first available option whenever specifications change
  watch(
    specEntries,
    (entries) => {
      const defaults: Record<string, string> = {};
      for (const [key, options] of entries) {
        if (options[0]) {
          defaults[key] = options[0];
        }
      }
      selected.value = defaults;
    },
    { immediate: true },
  );
</script>

<template>
  <div v-if="specEntries.length" class="flex gap-4 mt-3 flex-wrap">
    <div
      v-for="[key, options] in specEntries"
      :key="key"
      class="flex flex-col gap-1 w-[calc(50%-0.375rem)] sm:w-32"
    >
      <label class="text-xs text-black/70  dark:text-white/70">
        {{ specLabels[key] ?? key }}
      </label>
      <BaseDropdown
        class="capitalize"
        v-model="selected[key]"
        :options="toDropdownOptions(options)"
      />
    </div>
  </div>
</template>
