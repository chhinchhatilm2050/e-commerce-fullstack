<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProductsStore } from '@/stores/productsStore.ts';
  import ProductGrid from '@/components/category/ProductGrid.vue';
  import SortDropdown from '@/components/category/SortDropdown.vue';
  import TopLoader from '@/components/common/TopLoader.vue';

  const route = useRoute();
  const router = useRouter();
  const productStore = useProductsStore();

  const currentSort = ref((route.query.sort as string) || 'recommend');
  const currentPage = ref(Number(route.query.page) || 1);

  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;
  let isInternalUpdate = false;

  const showBackToTop = ref(false);
  function handleScroll() {
    showBackToTop.value = window.scrollY > 400;
  }

  const loadInitialResults = async () => {
    const searchTerm = route.query.search as string;
    if (!searchTerm) return;

    const sort = (route.query.sort as string) || 'recommend';
    currentSort.value = sort;
    currentPage.value = 1;

    await productStore.fetchAllProducts({
      search: searchTerm,
      sort,
      page: '1',
    });
  };

  const loadNextPage = async () => {
    if (productStore.loadingMore || !productStore.pagination?.hasNextPage) return;
    const searchTerm = route.query.search as string;
    if (!searchTerm) return;

    currentPage.value += 1;

    isInternalUpdate = true;
    router.replace({ query: { ...route.query, page: String(currentPage.value) } });
    setTimeout(async() => {
      await productStore.fetchMoreAllProducts({
        search: searchTerm,
        sort: currentSort.value,
        page: String(currentPage.value),
      });
    }, 300);

  };

  const setupObserver = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNextPage();
      },
      { rootMargin: '200px' },
    );
    if (sentinel.value) observer.observe(sentinel.value);
  };

  watch(
    () => [route.query.search, route.query.sort],
    () => {
      if (isInternalUpdate) {
        isInternalUpdate = false;
        return;
      }
      loadInitialResults();
    },
    { immediate: true },
  );

  watch(
    () => productStore.loading,
    async (isLoading) => {
      if (!isLoading) {
        await nextTick();
        setupObserver();
      }
    },
  );

  watch(currentSort, (newSort) => {
    if (newSort !== route.query.sort) {
      isInternalUpdate = false;
      router.replace({ query: { ...route.query, sort: newSort, page: '1' } });
    }
  });

  onMounted(() => window.addEventListener('scroll', handleScroll));
  onUnmounted(() => {
    observer?.disconnect();
    window.removeEventListener('scroll', handleScroll);
  });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
</script>

<template>
  <div class="container-xl px-8 py-6">
    <TopLoader :isLoading="productStore.loading || productStore.loadingMore" />

    <div v-if="productStore.loading && productStore.products.length === 0" class="text-center py-16">
    </div>

    <template v-else>
      <div class="flex items-center justify-between gap-4 pb-4  border-gray-200">
        <h2 v-if="productStore.products.length > 0" class="text-lg font-semibold">
          <i class="ri-emotion-happy-line text-2xl"></i> PRODUCTS FOUND 
          <span class=" ">
            ( {{ productStore.pagination?.total || 0 }} Items )
          </span>
        </h2>

        <div v-if="productStore.products.length > 0" class="flex items-center gap-2">
          <span>Sort by:</span>
          <SortDropdown v-model="currentSort" />
        </div>
      </div>

      <div v-if="productStore.products.length === 0" class="text-center py-16 font-semibold text-xl">
        <i class="ri-emotion-unhappy-fill text-2xl"></i> Hmm... We couldn't find any results for " {{ route.query.search }} "
      </div>

      <template v-else>
        <ProductGrid :products="productStore.products" searchTerm="" />
        
        <div ref="sentinel" class="h-4"></div>
      </template>
    </template>

    <button
      v-if="!productStore.pagination?.hasNextPage && productStore.products.length > 0"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-gray-800 transition z-50"
    >
      ↑
    </button>
  </div>
</template>
