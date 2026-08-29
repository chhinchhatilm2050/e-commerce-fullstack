<script setup lang="ts">
  import { computed, ref, watch, nextTick } from 'vue';
  import type { IProductImage } from '@/types/product.ts';

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 2);
  const scrollContainer = ref<HTMLElement | null>(null);

  const props = defineProps<{
    images: IProductImage[];
  }>();

  const sortedImages = computed(() =>
    [...props.images].sort((a, b) => a.order - b.order),
  );

  // Clone the first image and place it at the end for continuous forward sliding
  const displayImages = computed(() => {
    if (sortedImages.value.length <= 1) return sortedImages.value;
    return [...sortedImages.value, sortedImages.value[0]];
  });

  const activeIndex = ref<number>(0);
  const isTransitioning = ref<boolean>(true);
  const isAnimating = ref(false);

  // Smoothly scroll the thumbnail column so the active thumbnail is always visible
  const scrollActiveThumbIntoView = () => {
    const container = scrollContainer.value;
    if (!container) return;

    // Use modulo so index points correctly to thumbnail array when activeIndex reaches clone
    const thumbIndex = activeIndex.value % sortedImages.value.length;
    const activeThumb = container.children[thumbIndex] as HTMLElement | undefined;
    if (!activeThumb) return;

    const containerRect = container.getBoundingClientRect();
    const thumbRect = activeThumb.getBoundingClientRect();

    const isFullyVisible =
      thumbRect.top >= containerRect.top && thumbRect.bottom <= containerRect.bottom;

    if (isFullyVisible) return;

    const thumbCenter = thumbRect.top + thumbRect.height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;
    const distance = thumbCenter - containerCenter;

    smoothScrollVertical(distance);
  };

  const smoothScrollVertical = (distance: number, duration = 400) => {
    const el = scrollContainer.value;
    if (!el) return;

    const start = el.scrollTop;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      el.scrollTop = start + distance * easeOutCubic(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  const selectImage = (index: number) => {
    isTransitioning.value = true;
    activeIndex.value = index;
  };

  const prevImage = () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    isTransitioning.value = true;
    if (activeIndex.value === 0) {
      isTransitioning.value = false;
      activeIndex.value = sortedImages.value.length;
      nextTick(() => {
        requestAnimationFrame(() => {
          isTransitioning.value = true;
          activeIndex.value = sortedImages.value.length - 1;
          isAnimating.value = false; // real transition now running, unlock when it ends too (see below)
        });
      });
    } else {
      activeIndex.value--;
    }
  };

  const nextImage = () => {
    if (isAnimating.value) return;
    isAnimating.value = true;
    isTransitioning.value = true;
    activeIndex.value++;
  };

  // Handle seamless reset when reaching the clone image
  const handleTransitionEnd = () => {
    if (activeIndex.value === sortedImages.value.length) {
      isTransitioning.value = false;
      activeIndex.value = 0;
      // let the instant jump paint before allowing another click
      requestAnimationFrame(() => {
        isAnimating.value = false;
      });
    } else {
      isAnimating.value = false;
    }
  };

  watch(activeIndex, async () => {
    await nextTick();
    scrollActiveThumbIntoView();
  });

</script>

<template>
  <div class="flex gap-3">
    <div
      ref="scrollContainer"
      class="flex flex-col gap-2 w-24 max-h-[680px] overflow-y-auto scrollbar-hide"
    >
      <button
        v-for="(img, index) in sortedImages"
        :key="img.publicId"
        class="border-1 overflow-hidden aspect-[2.8/4] flex-shrink-0 animate-slide-card cursor-pointer"
        :class="(activeIndex % sortedImages.length) === index ? 'border-black dark:border-white' : 'border-gray-200 dark:border-surface-900'"
        @click="selectImage(index)"
        :style="{ animationDelay: `${(index % 20) * 0.02}s` }"
      >
        <img :src="img.url" class="w-full h-full object-cover" />
      </button>
    </div>

    <div class="relative animate-slide-card w-[550px] h-[680px] bg-gray-100 overflow-hidden">
      <div 
        class="flex h-full w-full"
        :class="{ 'transition-transform duration-500 ease-in-out': isTransitioning }"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
        @transitionend="handleTransitionEnd"
      >
        <img
          v-for="(img, index) in displayImages"
          :key="`${img?.publicId}-${index}`"
          :src="img?.url"
          class="w-full h-full object-cover flex-shrink-0"
        />
      </div>

      <button
        v-if="sortedImages.length > 1"
        class="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-sm cursor-pointer bg-black/60 text-white flex items-center justify-center shadow"
        @click="prevImage"
      >
        <i class="ri-arrow-left-s-line"></i>
      </button>

      <button
        v-if="sortedImages.length > 1"
        class="absolute z-10 right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-sm cursor-pointer bg-black/60 text-white flex items-center justify-center shadow"
        @click="nextImage"
      >
        <i class="ri-arrow-right-s-line"></i>
      </button>
    </div>
  </div>
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

