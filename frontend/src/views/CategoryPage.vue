<script setup lang="ts">
  import { ref, watch, onUnmounted, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProductsStore } from '@/stores/productsStore.ts';
  import { useCategoryStore } from '@/stores/categoryStore.ts';
  import ProductGrid from '@/components/category/ProductGrid.vue';
  import SortDropdown from '@/components/category/SortDropdown.vue';
  import SubcategoryPills from '@/components/category/SubcategoryPills.vue';

  const route = useRoute();
  const router = useRouter();
  const productStore = useProductsStore();
  const categoryStore = useCategoryStore();

  const currentSort = ref((route.query.sort as string) || 'recommend');
  const currentPage = ref(Number(route.query.page) || 1);

  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // flag to tell the watch "this URL change came from scroll, don't re-fetch from scratch"
  let isInternalUpdate = false;

  const loadInitialData = async () => {
    const slug = route.params.slug as string;
    const search = route.query.search as string | undefined;
    const sort = (route.query.sort as string) || 'recommend';
    const page = Number(route.query.page) || 1;

    currentSort.value = sort;
    currentPage.value = page;

    await Promise.all([
      categoryStore.fetchCategoryBySlug(slug),
      categoryStore.fetchCategoryChildren(slug),
      productStore.fetchProductsByCategory(slug, {
        sort,
        page: String(page),
        ...(search ? { search } : {}),
      }),
    ]);
  };

  const loadNextPage = async () => {
    if (productStore.loadingMore || !productStore.pagination?.hasNextPage) return;
    const slug = route.params.slug as string;
    const search = route.query.search as string | undefined;

    currentPage.value += 1;

    isInternalUpdate = true; // mark this as a scroll-triggered update
    router.replace({
      query: { ...route.query, page: String(currentPage.value) },
    });
    setTimeout(async () => {
      await productStore.fetchMoreProductByCategory(slug, {
        sort: currentSort.value,
        page: String(currentPage.value),
        ...(search ? { search } : {}),
      });
    }, 300);
  };

  function setupObserver() {
    observer?.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextPage();
        }
      },
    );

    if (sentinel.value) {
      observer.observe(sentinel.value);
    }
  }

  watch(
    () => [route.params.slug, route.query.search, route.query.sort],
    () => {
      if (isInternalUpdate) {
        isInternalUpdate = false; // consume the flag, skip this trigger
        return;
      }
      loadInitialData();
    },
    { immediate: true },
  );

  watch(
    () => categoryStore.loading || productStore.loading,
    async (isLoading) => {
      if (!isLoading) {
        await nextTick();
        setupObserver();
      }
    },
  );

  watch(currentSort, (newSort) => {
    if (newSort !== route.query.sort) {
      isInternalUpdate = false; // real user action — let it reload properly
      router.replace({ query: { ...route.query, sort: newSort, page: '1' } });
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
</script>

<template>
  <div class="container-xl px-8 py-6">
    <div
      v-if="(categoryStore.loading || productStore.loading) && productStore.products.length === 0"
      class="text-center py-16"
    >
      Loading...
    </div>

    <template v-else>
      <div class="flex items-center justify-between gap-4 pb-4 border-gray-200 ">
        <div class="flex flex-row items-center gap-3">
          <div class="max-w-[200verflow-hidden text-ellipsis whitespace-nowrap">
            {{ categoryStore.currentCategory?.name.toUpperCase() }} ( {{ categoryStore.currentCategory?.productCount || 0 }} Items )
          </div>
          <SubcategoryPills 
            :subcategories="categoryStore.subcategories"
            :current-category="categoryStore.currentCategory"
          />
        </div>
        <div class="flex items-center gap-2">
          <span>Sort: </span>
          <SortDropdown v-model="currentSort" />
        </div>
      </div>

      <ProductGrid :products="productStore.products" />
      <div ref="sentinel" class="h-4"></div>
      <button
        v-if="!productStore.pagination?.hasNextPage && productStore.products.length > 0"
        @click="scrollToTop"
        class="subCategory-button flex items-center justify-center gap-2 mt-6 mx-auto"
      >
        Back to Top ↑
      </button>
    </template>
  </div>
</template>
