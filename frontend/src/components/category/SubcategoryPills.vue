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
  const canScrollLeft = ref(false);
  const canScrollRight = ref(false);
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

  const scrollRight = () => smoothScroll(300);
  const scrollLeft = () => smoothScroll(-300);

  const updateScrollStatus = (): void => {
    if (!scrollContainer.value) return;
    const el = scrollContainer.value;
    isScrollable.value = el.scrollWidth > el.clientWidth;
    canScrollLeft.value = el.scrollLeft > 0;
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
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
  <button v-if="isScrollable" class="cursor-pointer" @click="scrollLeft">
    <i class="ri-arrow-left-s-line text-2xl font-medium"></i>
  </button>

  <div
    class="flex gap-4 max-w-[700px] overflow-x-auto scrollbar-hide scroll-smooth"
    ref="scrollContainer"
    @scroll="updateScrollStatus"
  >
    <button
      v-for="sub in subcategories"
      :key="sub._id"
      :data-slug="sub.slug"
      class="whitespace-nowrap cursor-pointer"
      :class="{ 'text-red-600': isActive(sub) }"
      @click="goToSubcategory(sub.slug)"
    >
      <div class="flex justify-center items-center gap-2">
        <img
          class="w-8 h-8 rounded-sm object-cover object-center flex-shrink-0 bg-gray-100"
          :src="sub.image"
          :alt="sub.name"
          loading="lazy"
        />
        <div>
          <span>{{ sub.name }}</span>
          <!-- <span v-if="sub.productCount" class="text-suface-800 font-normal">
            ({{ sub.productCount }})
          </span> -->
        </div>
      </div>
    </button>
  </div>
  <button v-if="isScrollable" class="cursor-pointer" @click="scrollRight">
    <i class="ri-arrow-right-s-line text-2xl font-medium"></i>
  </button>
</template>
