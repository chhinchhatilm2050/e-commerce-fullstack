<script setup lang="ts">
  import { ref, watch, onUnmounted, nextTick, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProductsStore } from '@/stores/productsStore';
  import { useCategoryStore } from '@/stores/categoryStore';
  import { useCartStore } from '@/stores/cartStore';
  import { useWishlistStore } from '@/stores/wishlist';
  import ProductGrid from '@/components/category/ProductGrid.vue';
  import SortDropdown from '@/components/category/SortDropdown.vue';
  import SubcategoryPills from '@/components/category/SubcategoryPills.vue';
  import TopLoader from '@/components/common/TopLoader.vue';

  const route = useRoute();
  const router = useRouter();
  const productStore = useProductsStore();
  const categoryStore = useCategoryStore();
  const catStore = useCartStore();
  const wishlistStore = useWishlistStore();

  const currentSort = ref('recommend');
  const currentPage = ref(Number(route.query.page) || 1);

  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // Flag to stop infinite scroll URL pushes from re-triggering initial load
  let isInternalScroll = false;

  const loadCategoryDetails = async (slug: string) => {
    if (!slug) return;
    await Promise.all([
      categoryStore.fetchCategoryBySlug(slug),
      categoryStore.fetchCategoryChildren(slug),
    ]);
  };

  // Fetch Initial Products (When slug, search, sort, or page changes)
  const loadProductData = async () => {
    const slug = route.params.slug as string;
    const search = route.query.search as string | undefined;
    const sort = (route.query.sort as string) || 'recommend';
    const page = Number(route.query.page) || 1;

    await productStore.fetchProductsByCategory(slug, {
      sort,
      page: String(page),
      ...(search ? { search } : {}),
    });
  };

  const loadNextPage = async () => {
    if (productStore.loadingMore || !productStore.pagination?.hasNextPage) return;
    
    const slug = route.params.slug as string;
    const search = route.query.search as string | undefined;

    currentPage.value += 1;
    isInternalScroll = true; 

    await router.replace({
      query: { ...route.query, page: String(currentPage.value) },
    });

    await productStore.fetchMoreProductByCategory(slug, {
      sort: currentSort.value,
      page: String(currentPage.value),
      ...(search ? { search } : {}),
    });

    isInternalScroll = false;
  };

  const setupObserver = () => {
    observer?.disconnect();

    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadNextPage();
      }
    });

    if (sentinel.value) {
      observer.observe(sentinel.value);
    }
  };

  watch(
    () => route.params.slug,
    (newSlug) => {
      if (newSlug) {
        loadCategoryDetails(newSlug as string);
      }
    },
    { immediate: true },
  );

  watch(
    () => [route.params.slug, route.query.search, route.query.sort],
    () => {
      if (isInternalScroll) return; // Skip fetch if triggered by infinite scroll
      
      currentPage.value = Number(route.query.page) || 1;
      loadProductData();
    },
    { immediate: true },
  );

  // Setup observer once loading completes
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
      router.replace({ query: { ...route.query, sort: newSort, page: '1' } });
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchTerm = computed(() => (route.query.search as string) || '');
</script>

<template>
  <div>
    <TopLoader :isLoading="categoryStore.loading || productStore.loading || 
      productStore.loadingMore || catStore.getCartLoadingg || 
      catStore.removeCartLoading || catStore.updateCartLoading || wishlistStore.loading"
    />
    <div class="container-xl px-5 md:px-8 py-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4  shadow-lg border-gray-200 dark:border-gray-750 w-full">
        <div class="flex items-center justify-between lg:justify-start gap-4 flex-shrink-0">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="font-bold text-base truncate">{{ categoryStore.currentCategory?.name }}</span> 
            <span class="text-sm text-black/70 hidden md:block dark:text-white/70 whitespace-nowrap">[{{ categoryStore.currentCategory?.productCount || 0 }} Items]</span>
          </div>
          <!-- Sort Dropdown (Visible on Phone/Tablet) -->
          <div class="flex items-center gap-2 flex-shrink-0 lg:hidden">
            <span class="text-sm text-gray-700 dark:text-gray-300">Sort:</span>
            <SortDropdown v-model="currentSort" />
          </div>
        </div>
        <div class="w-full lg:flex-1 lg:min-w-0 overflow-x-auto scrollbar-hide">
          <SubcategoryPills 
            :subcategories="categoryStore.subcategories"
            :current-category="categoryStore.currentCategory"
          />
        </div>
        <div class="hidden lg:flex items-center gap-2 flex-shrink-0">
          <span class="text-sm text-gray-700 dark:text-gray-300">Sort:</span>
          <SortDropdown v-model="currentSort" />
        </div>

      </div>
      <ProductGrid :products="productStore.products" :search-term="searchTerm"/>
      <div ref="sentinel" class="h-4"></div>

      <button
        v-if="!productStore.pagination?.hasNextPage && productStore.products.length > 0 "
        @click="scrollToTop"
        class="fixed bottom-6 right-6 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-gray-800 transition z-50"
      >
        ↑
      </button>
    </div>
  </div>
</template>
