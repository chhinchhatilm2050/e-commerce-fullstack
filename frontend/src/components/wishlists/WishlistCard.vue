<script setup lang="ts">
  import type { IWishlistItem } from '@/types/wishlist';
  import { computed, ref, watch } from 'vue';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';

  const props = defineProps<{
    item: IWishlistItem;
  }>();

  const emit = defineEmits<{
    (e: 'remove', productId: string): void;
  }>();

  // track selected option per spec key (colors, sizes)
  const selected = ref<Record<string, string>>({});

  const product = computed(() => props.item.productId);

  const discountPercent = computed(() => {
    if (!product.value || !product.value.comparePrice || product.value.comparePrice <= product.value.price) {
      return 0;
    }
    return Math.round(
      ((product.value.comparePrice - product.value.price) / product.value.comparePrice) * 100,
    );
  });

  const specLabels: Record<string, string> = {
    colors: 'Color',
    sizes: 'Size',
  };

  // maps the "display" key -> the possible field names it could be stored under
  // (some products store `colors: string[]`, others store a single `color: string`)
  const specKeyAliases: Record<string, string[]> = {
    colors: ['colors', 'color'],
    sizes: ['sizes', 'size'],
  };

  function normalizeSpecValue(value: unknown): string[] {
    if (Array.isArray(value)) return value as string[];
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  }

  // only show size/color dropdowns, in this fixed order, and only if the
  // product actually has data for them — regardless of whether the backend
  // stored it as a plural array (`colors`) or a singular string (`color`)
  const specEntries = computed(() => {
    const spec = product.value?.specification;
    if (!spec) return [];

    const result: [string, string[]][] = [];

    for (const [displayKey, aliases] of Object.entries(specKeyAliases)) {
      for (const alias of aliases) {
        const values = normalizeSpecValue(spec[alias]);
        if (values.length > 0) {
          result.push([displayKey, values]);
          break; // stop at the first alias that has data for this key
        }
      }
    }

    return result;
  });

  // BaseDropdown expects { value, label }[] — reuse the same string for both,
  // since these are raw product option values (e.g. "Red", "M"), not i18n keys.
  // vue-i18n's t() falls back to returning the string itself when no matching
  // translation key exists, so this is safe to pass straight through.
  function toDropdownOptions(values: string[]) {
    return values.map((v) => ({ value: v, label: v }));
  }

  // default each dropdown to its first available option whenever the product
  // (or its spec) changes — e.g. wishlist items loading, or switching products
  watch(
    specEntries,
    (entries) => {
      const defaults: Record<string, string> = {};
      for (const [key, options] of entries) {
        const first = options[0];
        if (first !== undefined) {
          defaults[key] = first;
        }
      }
      selected.value = defaults;
    },
    { immediate: true },
  );

  const handleRemove = () => {
    if (product.value) emit('remove', product.value._id);
  };
</script>

<template>
  <div
    v-if="product"
    class="bg-black/2 dark:bg-white/5 rounded-sm p-4 flex flex-col sm:flex-row gap-4 relative shadow-xl"
  >
    <button
      class="absolute top-3 cursor-pointer right-3 flex items-center justify-center z-10"
      @click="handleRemove"
    >
      <i class="ri-delete-bin-line text-lg"></i>
    </button>

    <router-link
      :to="`/products/${props.item.productId.slug}`"
      class="w-full sm:w-35 lg:w-45 shrink-0 aspect-[3/4] sm:aspect-[3/4] rounded-sm overflow-hidden bg-gray-100 max-w-45 mx-auto sm:mx-0"
    >
      <img
        v-if="product.images?.[0]"
        :src="product.images[0].url"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
    </router-link>

    <div class="flex-1 min-w-0 sm:h-[292px] pr-10 sm:pr-10 flex flex-col">
      <div>
        <div class="flex flex-wrap items-center gap-1">
          <span class="text-red-500 font-bold text-md">
            US ${{ product.price.toFixed(2) }}
          </span>
          <span v-if="discountPercent > 0" class="text-red-500 font-semibold text-sm">
            {{ discountPercent }}%
          </span>
          <span
            v-if="product.comparePrice > product.price"
            class="text-black/50 dark:text-white/40 line-through text-sm"
          >
            US ${{ product.comparePrice.toFixed(2) }}
          </span>
        </div>

        <p class="text-sm text-black/90 mt-1 line-clamp-2 dark:text-white/80">{{ product.name }}</p>

        <p v-if="product.code" class="text-sm text-black/90 mt-1 dark:text-white/80">
          Code. {{ product.code }}
        </p>

        <div v-if="specEntries.length" class="flex gap-3 mt-3 flex-wrap">
          <div v-for="[key, options] in specEntries" :key="key" class="flex flex-col gap-1 w-[calc(50%-0.375rem)] sm:w-32">
            <label class="text-xs text-blace/70">{{ specLabels[key] ?? key }}</label>
            <BaseDropdown
              v-model="selected[key]"
              :options="toDropdownOptions(options)"
            />
          </div>
        </div>
      </div>

      <button
        class="mt-4 sm:mt-auto w-full sm:w-32 bg-black/90 dark:border border-white/30 text-white py-2 rounded font-medium disabled:opacity-40 cursor-pointer "
      >
        Move to Cart
      </button>
    </div>
  </div>
</template>

