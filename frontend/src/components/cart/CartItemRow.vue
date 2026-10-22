<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import type { ICartItem } from '@/types/cart';
  import { getPrimaryImage } from '@/utils/productImage';

  interface ISpecificationItem {
    key: string;
    value: string | string[];
  }

  const props = defineProps<{
    item: ICartItem;
    isLoading: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'navigate', slug: string): void;
    (e: 'remove', itemId: string): void;
    (e: 'increment', itemId: string, currentQty: number, stock: number): void;
    (e: 'decrement', itemId: string, currentQty: number): void;
    (e: 'attribute-change', itemId: string, attributes: Record<string, string>): void;
  }>();

  const specLabels: Record<string, string> = {
    colors: 'Color',
    sizes: 'Size',
    color: 'Color',
    size: 'Size',
  };

  const selected = ref<Record<string, string>>({});

  // Converts spec values (strings, comma-separated lists, or arrays) into string arrays
  function parseSpecValues(rawValue: unknown): string[] {
    if (!rawValue) return [];
    if (Array.isArray(rawValue)) {
      return rawValue.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof rawValue === 'string') {
      return rawValue.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return [];
  }

  // Extracts available options from product specifications, falling back to selectedAttributes if omitted
  const specEntries = computed(() => {
    const specs = (props.item.productId?.specifications || []) as ISpecificationItem[];
    const result: [string, string[]][] = [];

    if (specs.length > 0) {
      // Look up all color choices
      const colorSpec = specs.find((s) => {
        const k = s.key?.trim().toLowerCase();
        return k === 'color' || k === 'colors';
      });
      if (colorSpec?.value) {
        const values = parseSpecValues(colorSpec.value);
        if (values.length) result.push(['color', values]);
      }

      // Look up all size choices
      const sizeSpec = specs.find((s) => {
        const k = s.key?.trim().toLowerCase();
        return k === 'size' || k === 'sizes';
      });
      if (sizeSpec?.value) {
        const values = parseSpecValues(sizeSpec.value);
        if (values.length) result.push(['size', values]);
      }
    }

    // Fallback if product specifications were not populated in the cart query
    if (result.length === 0 && props.item.selectedAttributes) {
      const attrs = props.item.selectedAttributes;
      if (attrs.color) result.push(['color', [attrs.color]]);
      if (attrs.size) result.push(['size', [attrs.size]]);
    }

    return result;
  });

  const toDropdownOptions = (values: string[]) => {
    return values.map((v) => ({ value: v, label:  v }));
  };

  // Keep local dropdown value synchronized with item.selectedAttributes
  watch(
    [specEntries, () => props.item.selectedAttributes],
    () => {
      const attrs = props.item.selectedAttributes || {};
      const defaults: Record<string, string> = {};

      for (const [key, options] of specEntries.value) {
        const currentVal = attrs[key] || attrs[key === 'color' ? 'colors' : 'sizes'];
    
        defaults[key] = (currentVal && options.includes(currentVal)) 
          ? currentVal 
          : (options[0] ?? '');
      }
      selected.value = defaults;
    },
    { immediate: true },
  );

  // Triggered when user selects a new value from the dropdown
  function handleSelectChange(displayKey: string, newValue: string) {
    selected.value[displayKey] = newValue;

    // Build full updated selectedAttributes object
    const updatedAttributes: Record<string, string> = {
      ...(props.item.selectedAttributes ?? {}),
      [displayKey]: newValue,
    };

    emit('attribute-change', props.item._id, updatedAttributes);
  }
</script>

<template>
  <li class="flex gap-3 py-5">
    <!-- Product Thumbnail -->
    <img
      @click="props.item.productId?.slug && emit('navigate', props.item.productId.slug)"
      :src="getPrimaryImage(props.item.productId)?.url"
      :alt="props.item.productId?.name"
      class="w-28 h-38 object-cover bg-gray-100 dark:bg-surface-700 cursor-pointer"
    />

    <!-- Item Information -->
    <div class="flex-1 flex flex-col justify-between">
      <div>
        <p class="text-sm font-medium dark:text-gray-100 line-clamp-2">
          {{ props.item.productId?.name }}
        </p>
        <p v-if="props.item.productId?.code" class="text-xs text-gray-500 dark:text-gray-400">
          Code. {{ props.item.productId.code }}
        </p>

        <!-- Interactive Color & Size Dropdowns -->
  <div v-if="specEntries.length" class="grid grid-cols-2 gap-3 mt-2 w-full max-w-[240px]">
    <div
      v-for="[key, options] in specEntries"
      :key="key"
      class="flex flex-col gap-1 min-w-0"
    >
      <label class="text-xs text-black/70 dark:text-white/70 capitalize">
        {{ specLabels[key] ?? key }}
      </label>
      <BaseDropdown
        class="capitalize"
        :model-value="selected[key]"
        :options="toDropdownOptions(options)"
        @update:model-value="(val: string) => handleSelectChange(key, val)"
      />
    </div>
  </div>
      </div>

      <!-- Quantity Adjuster & Pricing -->
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center gap-2 border border-gray-200 dark:border-surface-600 rounded-sm">
          <button
            @click="emit('decrement', props.item._id, props.item.quantity)"
            :disabled="props.item.quantity <= 1 || props.isLoading"
            class="w-7 h-7 flex items-center justify-center cursor-pointer disabled:opacity-30 dark:text-gray-300"
          >
            −
          </button>
          <span class="text-sm w-4 text-center dark:text-gray-200">{{ props.item.quantity }}</span>
          <button
            @click="emit('increment', props.item._id, props.item.quantity, props.item.productId?.stock || 0)"
            :disabled="props.item.quantity >= (props.item.productId?.stock || 0) || props.isLoading"
            class="w-7 h-7 flex items-center justify-center cursor-pointer disabled:opacity-30 dark:text-gray-300"
          >
            +
          </button>
        </div>
        <span class="text-sm font-semibold dark:text-gray-100">
          US ${{ ((props.item.productId?.price || 0) * props.item.quantity).toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- Remove Item Button -->
    <button
      @click="emit('remove', props.item._id)"
      :disabled="props.isLoading"
      class="self-start text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-30"
    >
      <i class="ri-delete-bin-line text-lg"></i>
    </button>
  </li>
</template>
