<script setup lang="ts">
  import { computed } from 'vue';
  import ProductRatingSummary from '@/components/products/ProductRatingSummary.vue';

  const props = defineProps<{
    price: number;
    comparePrice?: number;
    name: string;
    ratingAvg: number;
    ratingCount: number;
    stock: number;
  }>();

  const discountPercent = computed(() => {
    if (!props.comparePrice || props.comparePrice <= props.price) return null;
    return Math.round(((props.comparePrice - props.price) / props.comparePrice) * 100);
  });
</script>

<template>
  <div>
    <!-- Pricing -->
    <div class="flex items-baseline gap-2">
      <p
        class="text-2xl font-bold"
        :class="discountPercent ? 'text-red-700/90' : ''"
      >
        US ${{ price.toFixed(2) }}
      </p>
      <span v-if="discountPercent" class="font-semibold text-xl">
        -{{ discountPercent }}%
      </span>
      <span v-if="discountPercent" class="opacity-70 line-through text-xl">
        US ${{ comparePrice?.toFixed(2) }}
      </span>
    </div>

    <!-- Product Title -->
    <h1 class="text-lg font-medium mt-3">{{ name }}</h1>

    <!-- Rating Summary -->
    <div class="mt-3 flex justify-between">
      <ProductRatingSummary
        :rating-avg="ratingAvg"
        :rating-count="ratingCount"
      />
    </div>

    <!-- Stock Status -->
    <p
      class="mt-4 text-sm"
      :class="stock > 0 ? 'text-black/80 dark:text-white/80' : 'text-red-500'"
    >
      {{ stock > 0 ? `${stock} in stock` : 'Out of stock' }}
    </p>
  </div>
</template>
