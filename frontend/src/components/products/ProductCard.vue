<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import type { IProduct } from '@/types/product';
  import { getPrimaryImage } from '@/utils/productImage';
  import { computed } from 'vue';
  import { useWishlistStore } from '@/stores/wishlist';
  import { useAuthStore } from '@/stores/authStore';
  import { useAlert } from '@/composables/useAlert';
  import { ref } from 'vue';
  import AuthDialog from '../common/AuthDialog.vue';

  const wishlistStore = useWishlistStore();
  const authStore = useAuthStore();
  const isAuthModelOpen = ref<boolean>(false);
  const { showAlert } = useAlert();

  const handleToggleWishlist = async () => {
    if (!authStore.isLoggedIn) {
      isAuthModelOpen.value = true;
      return;
    };

    if (!props.product?._id) return;

    const result = await wishlistStore.toggleWishlist(props.product._id);
    if (result.success) {
      showAlert(result.message, { type: 'success' });
    } else {
      showAlert(result.message, { type: 'error' });
    }
  };

  const props = defineProps<{
    product: IProduct;
  }>();
  const router = useRouter();
  const goToProductDetail = (): void => {
    router.push(`/products/${props.product.slug}`);
  };

  const discountPrice = computed(() => {
    const compare = props.product.comparePrice;
    if (!compare || compare <= props.product.price) return 0;
    return Math.round((1 - props.product.price / compare) * 100);
  });
</script>
<template>
  <div class="group  animate-slide-up mt-5">
    <div class="aspect-[3.1/4] overflow-hidden bg-gray-100 relative">
      <span
        v-if="discountPrice > 0"
        class="px-2 py-0.5 text-sm absolute right-0 z-10 bg-red-600 text-gray-200 flex items-center justify-center"
      >
        -{{ discountPrice }} %
      </span>
      <span
        v-if="product.stock > 0"
        class="px-2 py-0.5 text-sm absolute left-0 bottom-0 z-10 bg-black/90 text-gray-200 flex items-center justify-center"
      >
        {{ product.stock }} in stock <i class="ri-stack-fill ml-1"></i>
      </span>

      <img
        @click="goToProductDetail"
        :src="getPrimaryImage(product)?.url"
        :alt="product.name"
        class="w-full h-full cursor-pointer object-cover transition-opacity  group-hover:opacity-0"
      />
      <img
        v-if="product.images?.[1]?.url"
        @click="goToProductDetail"
        :src="product.images[1].url"
        :alt="product.name"
        class="absolute inset-0 w-full h-full cursor-pointer object-cover opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>
    <div class="mt-2">
      <div class="flex items-center justify-between gap-2 mb-1">
        <div class="flex gap-2 items-center justify-center">
          <p :class="discountPrice > 0 ? 'text-red-600' : ''" class="text-sm">US ${{ product.price.toFixed(2) }}</p>
          <span class="font-display text-sm line-through  dark:text-red-500-white" v-if="discountPrice > 0 ">US ${{ product.comparePrice?.toFixed(2) }}</span>
        </div>
        <button @click="handleToggleWishlist" class="px-1 cursor-pointer">
          <i :class="product && wishlistStore.isWishlisted(product._id) ? 'ri-heart-fill text-xl' : 'ri-poker-hearts-line text-lg'"></i>
        </button>
      </div>
      <p class="text-sm truncate">{{ product.name }}</p>
    </div>
  </div>
  <AuthDialog v-model="isAuthModelOpen" />
</template>
