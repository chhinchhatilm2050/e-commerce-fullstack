<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProductsStore } from '@/stores/productsStore.js';
  import ProductImageGallery from '@/components/products/ProductImageGallery.vue';
  import ProductSpecification from '@/components/products/ProductSpecification.vue';
  import ProductRatingSummary from '@/components/products/ProductRatingSummary.vue';
  import TopLoader from '@/components/common/TopLoader.vue';
  import ProductSlider from '@/components/products/ProductSlider.vue';

  const route = useRoute();
  const router = useRouter();
  const productStore = useProductsStore();

  const quantity = ref(1);
  const selectedSize = ref<string | null>(null);
  const selectedColor = ref<string | null>(null);
  const openSection = ref<'description' | 'specification' | null>('description');

  const categorySlug = computed(() => {
    const cat = productStore.currentProduct?.categoryId;
    if (!cat) return '';
    return typeof cat === 'object' && 'slug' in cat ? cat.slug : '';
  });

  const loadProduct = async () => {
    const id = route.params.id as string;
    await productStore.fetchProductDetail(id);

    if (productStore.currentProduct) {
      const slug = categorySlug.value;

      if (slug) {
        await productStore.fetchRelatedProducts(categorySlug.value, id);
      }

      if (slug && !route.params.categorySlug) {
        router.replace({
          name: 'productDetailInCategory',
          params: { ...route.params, categorySlug: slug },
        });
      }
    }
    
  };

  watch(() => route.params.id, loadProduct, { immediate: true });

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

  const selectSize = (size: string) => {
    selectedSize.value = size;
  };

  const selectColor = (color: string) => {
    selectedColor.value = color;
  };

  const toggleSection = (section: 'description' | 'specification') => {
    openSection.value = openSection.value === section ? null : section;
  };

  const increaseQty = () => {
    if (product.value && quantity.value < product.value.stock) {
      quantity.value++;
    }
  };

  const decreaseQty = () => {
    if (quantity.value > 1) {
      quantity.value--;
    }
  };

  function handleAddToCart() {
    if (!product.value) return;

    // pass the selected variant info along, once your cart store exists
    // const payload = {
    //   productId: product.value._id,
    //   quantity: quantity.value,
    //   size: selectedSize.value,
    //   color: selectedColor.value,
    // };
  }
</script>

<template >
  <div v-if="productStore.loadingDetail" class="text-center py-20">
    <TopLoader :isLoading="productStore.loadingDetail"/>
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
          <button class="subCategory-button font-medium flex justify-center gap-1 items-center"><span><i class="ri-star-half-line"></i></span><span>Review</span></button>
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
              class="w-18 h-10 subCategory-button whitespace-nowrap flex items-center justify-center text-sm transition"
              :class="size === selectedSize ? 'border border-black/50 dark:border-white/50 font-medium' : ''"
              @click="selectSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="mt-6">
          <span class="text-sm font-medium block mb-2">Quantity</span>
          <div class="flex items-center gap-3">
            <button class="w-9 h-9 subCategory-button flex items-center justify-center" @click="decreaseQty">−</button>
            <span class="w-8 text-center">{{ quantity }}</span>
            <button class="w-9 h-9 subCategory-button flex items-center justify-center" @click="increaseQty">+</button>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6">
          <button
            class="flex-1 bg-black/90 dark:border border-white/30 text-white py-3 rounded font-semibold disabled:opacity-40 cursor-pointer "
            :disabled="product.stock === 0"
            @click="handleAddToCart"
          >
            {{ product.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
          </button>
          <button class="w-12 h-12 subCategory-button flex items-center justify-center cursor-pointer">
            <i class="ri-poker-hearts-line text-lg"></i>
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
  <div>
    <ProductSlider 
      :products="productStore.relatedProducts || []"
      title="Related Products"
      icon="ri-chat-smile-line"
      :see-more-link="`/products/category/${categorySlug}`"
    />
  </div>
</template>
