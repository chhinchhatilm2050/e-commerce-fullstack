<script setup lang="ts">
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import type { ICategory } from '@/types/category';

  const props = defineProps<{
    subcategories: ICategory[];
    currentCategory?: ICategory | null;
  }>();

  const router = useRouter();
  const route = useRoute();
  const scrollContainer = ref<HTMLElement | null>(null);
  const isScrollable = ref(false);
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 2);

  const smoothScroll = (distance: number, duration = 1000) => {
    const el = scrollContainer.value;
    if (!el) return;

    const start = el.scrollLeft;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      el.scrollLeft = start + distance * easeOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const updateScrollStatus = (): void => {
    if (!scrollContainer.value) return;
    const el = scrollContainer.value;
    isScrollable.value = el.scrollWidth > el.clientWidth;
  };

  const scrollActivePillIntoView = (): void => {
    const container = scrollContainer.value;
    if (!container || !props.currentCategory) return;

    const activeButton = container.querySelector<HTMLElement>(
      `[data-slug="${props.currentCategory.slug}"]`,
    );
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    const isFullyVisible =
      buttonRect.left >= containerRect.left && buttonRect.right <= containerRect.right;

    if (isFullyVisible) return;

    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const distance = buttonCenter - containerCenter;

    smoothScroll(distance, 1000);
  };

  const goToSubcategory = (slug: string): void => {
    router.push({
      name: 'category',
      params: { slug },
      query: {
        ...route.query,
        page: '1',
      },
    });
  };

  const isActive = (sub: ICategory): boolean => {
    return sub.slug === props.currentCategory?.slug;
  };

  onMounted(() => {
    updateScrollStatus();
    scrollContainer.value?.addEventListener('scroll', updateScrollStatus);
  });

  watch(
    () => props.subcategories,
    async () => {
      await nextTick();
      updateScrollStatus();
    },
  );
  watch(
    () => props.currentCategory?.slug,
    async () => {
      await nextTick();
      scrollActivePillIntoView();
    },
  );
</script>

<template>
  <div
    class="flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth flex-nowrap w-full"
    ref="scrollContainer"
    @scroll="updateScrollStatus"
  >
    <button
      v-for="sub in subcategories"
      :key="sub._id"
      :data-slug="sub.slug"
      class="whitespace-nowrap cursor-pointer flex items-center gap-2 flex-shrink-0 py-1 transition-all group"
      @click="goToSubcategory(sub.slug)"
    >
      <img
        class="w-7 h-7 rounded-sm object-cover object-center flex-shrink-0 bg-gray-100"
        :src="sub.image"
        :alt="sub.name"
        loading="lazy"
      />
      <span 
        class="text-sm font-medium transition-colors"
        :class="isActive(sub) ? 'text-red-600 font-semibold' : 'text-gray-800 dark:text-gray-200 hover:text-red-500'"
      >
        {{ sub.name }}
      </span>
    </button>
  </div>
</template>
