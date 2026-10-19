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
  import ProductSlider from '@/components/products/ProductSlider.vue';
  import ProductReview from '@/components/products/ProductReview.vue';
  import ProductReviewList from '@/components/products/ProductReviewList.vue';
  import AuthDialog from '@/components/common/AuthDialog.vue';
  import CartDrawer from '@/components/cart/CartDrawer.vue';
  import TopLoader from '@/components/common/TopLoader.vue';

  // Sub-Components
  import ProductDetailHeader from '@/components/products/ProductDetailHeader.vue';
  import ProductVariantSelector from '@/components/products/ProductVariantSelector.vue';
  import ProductActionButtons from '@/components/products/ProductActionButtons.vue';
  import ProductAccordionSections from '@/components/products/ProductAccordionSections.vue';

  interface ISpecificationItem {
    key: string;
    value: string;
  }

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
  const isReviewModelOpen = ref<boolean>(false);
  const isAuthModelOpen = ref<boolean>(false);
  const page = ref<number>(1);
  const editingReview = ref<IReview | null>(null);
  const cartOpen = ref<boolean>(false);

  const product = computed(() => productStore.currentProduct);

  const categorySlug = computed(() => {
    const cat = productStore.currentProduct?.categoryId;
    if (!cat) return '';
    return typeof cat === 'object' && 'slug' in cat ? cat.slug : '';
  });

  // Specification Parsers for Size & Color
  const availableSizes = computed<string[]>(() => {
    const specs: ISpecificationItem[] = product.value?.specifications || [];
    if (!specs.length) return [];
    const sizeSpec = specs.find(
      (item) =>
        item.key.trim().toLowerCase() === 'sizes' ||
        item.key.trim().toLowerCase() === 'size',
    );
    if (!sizeSpec || !sizeSpec.value) return [];
    return sizeSpec.value.split(',').map((s) => s.trim()).filter(Boolean);
  });

  const availableColors = computed<string[]>(() => {
    const specs: ISpecificationItem[] = product.value?.specifications || [];
    if (!specs.length) return [];
    const colorSpec = specs.find(
      (item) =>
        item.key.trim().toLowerCase() === 'colors' ||
        item.key.trim().toLowerCase() === 'color',
    );
    if (!colorSpec || !colorSpec.value) return [];
    return colorSpec.value.split(',').map((c) => c.trim()).filter(Boolean);
  });

  watch(
    availableColors,
    (colors) => {
      selectedColor.value = colors[0] ?? null;
    },
    { immediate: true },
  );

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

  // Actions
  const handleToggleWishlist = async () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    }
    if (!product.value?._id) return;

    const result = await wishlistStore.toggleWishlist(product.value._id);
    showAlert(result.message, { type: result.success ? 'success' : 'error' });
  };

  const handleAddToBag = async () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    }
    if (!product.value) return;

    if (availableColors.value.length > 0 && !selectedColor.value) {
      showAlert('Please select a color', { type: 'error' });
      return;
    }
    if (availableSizes.value.length > 0 && !selectedSize.value) {
      showAlert('Please select a size', { type: 'error' });
      return;
    }

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

  const openReviewModel = () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    }
    editingReview.value = null;
    isReviewModelOpen.value = true;
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
</script>

<template>
  <TopLoader
    :isLoading="
      wishlistStore.loading ||
      cartStore.loading ||
      cartStore.getCartLoadingg ||
      cartStore.updateCartLoading ||
      cartStore.removeCartLoading
    "
  />

  <div v-if="productStore.loadingDetail" class="text-center py-20">
    <TopLoader
      :isLoading="productStore.loadingDetail || wishlistStore.loading"
    />
  </div>
  <div v-else-if="!product" class="text-center py-20 text-gray-500">
    Product not found.
  </div>

  <div v-else class="container-xl px-5 md:px-8 py-5 animate-slide-card">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start">
      <ProductImageGallery :images="product.images" />

      <div>
        <!-- Header: Price, Title, Rating, Stock -->
        <ProductDetailHeader
          :price="product.price"
          :compare-price="product.comparePrice"
          :name="product.name"
          :rating-avg="product.ratingAvg"
          :rating-count="product.ratingCount"
          :stock="product.stock"
        />

        <!-- Variants: Color and Size Pickers -->
        <ProductVariantSelector
          v-model:color="selectedColor"
          v-model:size="selectedSize"
          :available-colors="availableColors"
          :available-sizes="availableSizes"
          :product-images="product.images"
        />

        <!-- Action Buttons: Add to Bag and Wishlist -->
        <ProductActionButtons
          :stock="product.stock"
          :is-cart-loading="cartStore.loading"
          :is-wishlisted="wishlistStore.isWishlisted(product._id)"
          @add-to-bag="handleAddToBag"
          @toggle-wishlist="handleToggleWishlist"
        />

        <!-- Accordion: Description and Specifications -->
        <ProductAccordionSections
          :description="product.description"
          :specifications="product.specifications"
        />
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

  <AuthDialog v-model="isAuthModelOpen" @success-login="() => { isAuthModelOpen = false; isReviewModelOpen = true; }" />
  <CartDrawer v-model="cartOpen" />
</template>
