<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProductsStore } from '@/stores/productsStore.js';
  import { useReviewStore } from '@/stores/reviewStore.js'; 
  import { useAuthStore } from '@/stores/authStore';
  import { useCartStore } from '@/stores/cartStore';
  import { useWishlistStore } from '@/stores/wishlist';
  import { useAlert } from '@/composables/useAlert';
  import type { ICreateReview, IReview } from '@/types/review';
  import ProductImageGallery from '@/components/products/ProductImageGallery.vue';
  import ProductSpecification from '@/components/products/ProductSpecification.vue';
  import ProductRatingSummary from '@/components/products/ProductRatingSummary.vue';
  import TopLoader from '@/components/common/TopLoader.vue';
  import ProductSlider from '@/components/products/ProductSlider.vue';
  import ProductReview from '@/components/products/ProductReview.vue';
  import ProductReviewList from '@/components/products/ProductReviewList.vue';
  import AuthDialog from '@/components/common/AuthDialog.vue';
  import CartDrawer from '@/components/common/CartDrawer.vue';

  const route = useRoute();
  const router = useRouter();
  const productStore = useProductsStore();
  const reviewStore = useReviewStore();
  const authStore = useAuthStore();
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const { showAlert } = useAlert();

  const quantity = ref(1);
  const selectedSize = ref<string | null>(null);
  const selectedColor = ref<string | null>(null);
  const openSection = ref<'description' | 'specification' | null>('description');
  const isReviewModelOpen = ref<boolean>(false);
  const isAuthModelOpen = ref<boolean>(false);
  const page = ref<number>(1);
  const editingReview = ref<IReview | null>(null);
  const cartOpen = ref<boolean>(false);

  const openReviewModel = () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    }
    editingReview.value = null;
    isReviewModelOpen.value = true;
  };

  const handleToggleWishlist = async () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    };

    if (!product.value?._id) return;

    const result = await wishlistStore.toggleWishlist(product.value._id);
    if (result.success) {
      showAlert(result.message, { type: 'success' });
    } else {
      showAlert(result.message, { type: 'error' });
    }
  };

  const handleAuthSuccess = () => {
    isAuthModelOpen.value = false;
    isReviewModelOpen.value = true; 
  };
  const categorySlug = computed(() => {
    const cat = productStore.currentProduct?.categoryId;
    if (!cat) return '';
    return typeof cat === 'object' && 'slug' in cat ? cat.slug : '';
  });

  const loadProduct = async () => {
    const slug = route.params.slug as string;
    await productStore.fetchProductDetail(slug);

    if (productStore.currentProduct) {
      const slug = categorySlug.value;
      if (slug) {
        await productStore.fetchRelatedProducts(categorySlug.value, slug);
      }

      if (slug && !route.params.categorySlug) {
        router.replace({
          name: 'productDetailInCategory',
          params: { ...route.params, categorySlug: slug },
        });
      }
    }
  };

  watch(() => route.params.slug, loadProduct, { immediate: true });

  const product = computed(() => productStore.currentProduct);

  const discountPercent = computed(() => {
    const p = product.value;
    if (!p?.comparePrice || p.comparePrice <= p.price) return null;
    return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
  });

  const availableSizes = computed<string[]>(() => {
    const spec = product.value?.specification;
    if (!spec) return [];
    if (Array.isArray(spec.sizes)) return spec.sizes as string[];
    if (typeof spec.size === 'string') return [spec.size]; 
    return [];
  });

  const availableColors = computed<string[]>(() => {
    const spec = product.value?.specification;
    if (!spec) return [];
    if (Array.isArray(spec.colors)) return spec.colors as string[];
    if (typeof spec.color === 'string') return [spec.color];
    return [];
  });

  watch(availableColors, (colors) => {
    selectedColor.value = colors[0] ?? null;
  }, { immediate: true });

  const selectSize = (size: string) => { selectedSize.value = size; };
  const selectColor = (color: string) => { selectedColor.value = color; };
  const toggleSection = (section: 'description' | 'specification') => {
    openSection.value = openSection.value === section ? null : section;
  };

  const handleReviewSubmit = async (payload: ICreateReview): Promise<void> => {
    let result;
    
    if (payload._id) {
      result = await reviewStore.updateReview(payload._id, {
        rating: payload.rating,
        comment: payload.comment,
        images: payload.images,
        removeImageIds: payload.removeImageIds,
      });
    } else {
      result = await reviewStore.createReview(payload);
    }

    if (result.success) {
      isReviewModelOpen.value = false;
      editingReview.value = null;
      const currentSlug = route.params.slug as string;
      
      await Promise.all([
        productStore.fetchProductDetail(currentSlug),
        reviewStore.fetchReview(payload.productId, page.value, true),
      ]);
      showAlert(result.message, { type: 'success' });
    } else {
      showAlert(result.message, { type: 'error' });
    }
  };
  const handleEditReview = (review: IReview) => {
    editingReview.value = review;
    isReviewModelOpen.value = true;
  };

  const handleAddToBag = async () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    };

    if (!product.value) return;

    if (availableColors.value.length > 0 && !selectedColor.value) {
      showAlert('Please select a color', { type: 'error' });
      return;
    }

    if (availableSizes.value.length > 0 && !selectedSize.value) {
      showAlert('Please select a size', { type: 'error' });
      return;
    };

    const selectedAttributes: Record<string, string> = {};
    if (selectedColor.value) selectedAttributes.color = selectedColor.value;
    if (selectedSize.value) selectedAttributes.size = selectedSize.value;

    const result = await cartStore.addToCart(
      product.value._id,
      quantity.value,
      selectedAttributes,
    );

    cartOpen.value = true;

    if (result.success) {
      showAlert('The item has been added', { type: 'success' });
    } else {
      showAlert(result.message || 'Failed to add item to bag', { type: 'error' });
    }
  };
</script>

<template >
  <TopLoader :isLoading="wishlistStore.loading || cartStore.loading ||
    cartStore.getCartLoadingg || cartStore.updateCartLoading 
    || cartStore.removeCartLoading"
  />
  <div v-if="productStore.loadingDetail" class="text-center py-20">
    <TopLoader :isLoading="productStore.loadingDetail || wishlistStore.loading "/>
  </div>
  <div v-else-if="!product" class="text-center py-20 text-gray-500">
    Product not found.
  </div>

  <div v-else class="container-xl px-8 py-5 animate-slide-card">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
      <ProductImageGallery :images="product.images" />

      <div>
        <div class="flex items-baseline gap-2">
          <p class="text-2xl font-bold" :class="discountPercent ? 'text-red-700/90' : ''">
            US ${{ product.price.toFixed(2) }}
          </p>
          <span v-if="discountPercent" class="font-semibold text-xl">
            -{{ discountPercent }}%
          </span>
          <span v-if="discountPercent" class="opacity-70 line-through text-xl">
            US ${{ product.comparePrice?.toFixed(2) }}
          </span>
        </div>

        <h1 class="text-lg font-medium mt-3">{{ product.name }}</h1>

        <div class="mt-3 flex justify-between">
          <ProductRatingSummary :rating-avg="product.ratingAvg" :rating-count="product.ratingCount" />
        </div>

        <p class="mt-4 text-sm" :class="product.stock > 0 ? 'text-black/80 dark:text-white/80' : 'text-red-500'">
          {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
        </p>

        <!-- Color selector -->
        <div v-if="availableColors.length > 0" class="mt-6">
          <span class="text-sm font-medium block mb-2">
            Color: <span class="font-normal capitalize">{{ selectedColor }}</span>
          </span>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="color in availableColors"
              :key="color"
              class="flex flex-col items-center gap-1.5"
            >
              <button
                class="w-24 h-32 border overflow-hidden transition cursor-pointer"
                :class="color === selectedColor ? 'border-black dark:border-white' : 'border-transparent'"
                @click="selectColor(color)"
              >
                <img
                  v-if="product.images[0]"
                  :src="product.images[0].url"
                  class="w-full h-full object-cover"
                />
              </button>
              <p class="text-black/90 dark:text-white/90 text-sm capitalize">{{ color }}</p>
            </div>
          </div>
        </div>

        <!-- Size selector -->
        <div v-if="availableSizes.length > 0" class="mt-6">
          <span class="text-sm font-medium block mb-2">Size</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in availableSizes"
              :key="size"
              class="w-auto px-3 h-8 border border-black/20 dark:border-white/20 rounded-sm cursor-pointer  whitespace-nowrap flex items-center justify-center text-sm transition"
              :class="size === selectedSize ? 'subCategory-button' : ''"
              @click="selectSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6">
          <button
            class="flex-1 flex items-center justify-center gap-2 bg-black/90 hover:bg-black/80 dark:border border-white/30 text-white py-3 rounded font-semibold disabled:opacity-40 cursor-pointer "
            :disabled="product.stock === 0 || cartStore.loading"
            @click="handleAddToBag"
          >
           <svg
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              v-if="cartStore.loading"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ product.stock > 0 ? 'Add to bag' : 'Out of Stock' }}
          </button>
          <button 
            class="w-12 h-12 subCategory-button flex items-center justify-center cursor-pointer transition-colors"
            @click="handleToggleWishlist"
          >
            <i :class="product && wishlistStore.isWishlisted(product._id) ? 'ri-heart-fill text-xl' : 'ri-poker-hearts-line text-lg'"></i>
          </button>
        </div>

        <div class="mt-8 border-t border-black/10 dark:border-white/20">
          <div class="border-black/10 dark:border-white/20 border-b">
            <button class="w-full flex items-center justify-between py-4 text-sm font-semibold" @click="toggleSection('description')">
              Description
              <i :class="openSection === 'description' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            </button>
            <p v-if="openSection === 'description'" class="pb-4 text-sm text-black/60 dark:text-white/60 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <div v-if="product.specification && Object.keys(product.specification).length > 0" class="border-b border-black/10 dark:border-white/20">
            <button class="w-full flex items-center justify-between py-4 text-sm font-semibold" @click="toggleSection('specification')">
              Specification
              <i :class="openSection === 'specification' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            </button>
            <div v-if="openSection === 'specification'" class="pb-4">
              <ProductSpecification :specification="product.specification" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ProductReviewList
    v-if="product"
    :productId="product._id"
    @open-review-modal="openReviewModel"
    @edit-review="handleEditReview"
  />

  <ProductSlider 
    :products="productStore.relatedProducts || []"
    title="Related Products"
    icon="ri-chat-smile-line"
    :see-more-link="`/products/category/${categorySlug}`"
  />
  <ProductReview
    v-if="product"
    v-model="isReviewModelOpen"
    :product="product"
    :editingReview="editingReview"
    @submit-review="handleReviewSubmit"
  />
  <AuthDialog v-model="isAuthModelOpen" @success-login="handleAuthSuccess" />
  <CartDrawer v-model="cartOpen"/>
</template>
