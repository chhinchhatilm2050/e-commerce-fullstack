<script setup lang="ts">
  import { ref } from 'vue';
  import type { IProduct } from '@/types/product.js';
  import ProductCard from './ProductCard.vue';

  defineProps<{
    products: IProduct[];
    title: string;
    icon?: string;
    seeMoreLink?: string;
  }>();

  const scrollContainer = ref<HTMLElement | null>(null);
  const canScrollLeft = ref(false);
  const canScrollRight = ref(true);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 2);

  const smoothScroll = (distance: number, duration = 500) => {
    const el = scrollContainer.value;
    if (!el) return;

    const start = el.scrollLeft;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      el.scrollLeft = start + distance * easeOutCubic(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  const updateScrollStatus = () => {
    if (!scrollContainer.value) return;
    const el = scrollContainer.value;
    canScrollLeft.value = el.scrollLeft > 0;
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  };

  const getScrollAmount = () => {
    if (!scrollContainer.value) return 0;
    const firstCard = scrollContainer.value.querySelector('.snap-start') as HTMLElement | null;
    return firstCard ? firstCard.offsetWidth + 24 : scrollContainer.value.clientWidth;
  };

  const scrollLeft = () => smoothScroll(-getScrollAmount());
  const scrollRight = () => smoothScroll(getScrollAmount());
</script>

<template>
  <section class="py-10">
    <div class="container-xl px-8">
      <div class="flex items-end justify-between mb-5">
        <h2 class="section-title">
          <i v-if="icon" :class="icon"></i> {{ title }}
        </h2>
        <RouterLink
          v-if="seeMoreLink"
          :to="seeMoreLink"
          class="text-sm font-medium hidden sm:inline-flex subCategory-button"
        >
          SEE MORE
        </RouterLink>
      </div>

      <div v-if="products.length === 0" class="text-center py-12 text-gray-500">
        No products available yet.
      </div>

      <div v-else class="relative">
        <button
          v-if="canScrollLeft"
          class="absolute left-2 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
          @click="scrollLeft"
        >
          <i class="ri-arrow-left-s-line text-xl"></i>
        </button>

        <div
          ref="scrollContainer"
          class="grid grid-flow-col auto-cols-[calc(100%-0.75rem)] sm:auto-cols-[calc(50%-0.75rem)] lg:auto-cols-[calc(25%-1.125rem)] gap-6 overflow-x-auto scrollbar-hide"
          @scroll="updateScrollStatus"
        >
          <div
            v-for="product in products"
            :key="product._id"
            class="snap-start"
          >
            <ProductCard :product="product" />
          </div>

          <RouterLink
            v-if="seeMoreLink"
            :to="seeMoreLink"
            class="snap-start relative overflow-hidden rounded aspect-[3/4] group bg-gray-100"
          >
            <img
              v-if="products[0]?.images?.[0]?.url"
              :src="products[0].images[0].url"
              class="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-gray-900 dark:text-white font-bold text-lg tracking-wide">SEE MORE</span>
            </div>
          </RouterLink>
        </div>

        <button
          v-if="canScrollRight"
          class="absolute right-2 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
          @click="scrollRight"
        >
          <i class="ri-arrow-right-s-line text-xl"></i>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
