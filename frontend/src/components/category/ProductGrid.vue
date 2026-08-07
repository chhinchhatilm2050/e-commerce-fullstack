<script setup lang="ts">
  import type { IProduct } from '@/types/product';
  import ProductCard from '@/components/products/ProductCard.vue';

  defineProps<{
    products: IProduct[];
    searchTerm: string;
  }>();
</script>
<template>
  <div v-if="products.length === 0" class="text-center text-lg font-semibold py-16">
    <i class="ri-emotion-unhappy-fill text-2xl"></i> Hmm... We couldn't find any results for " {{searchTerm}} ".
  </div>

  <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
    <ProductCard
      v-for="(p, i) in products"
      :key="p._id"
      :product="p"
      class="animate-slide-card"
      :style="{ animationDelay: `${(i % 20) * 0.02}s` }"
    />
  </div>
</template>
