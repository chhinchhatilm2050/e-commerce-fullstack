<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useCartStore } from '@/stores/cartStore';
  import type { IWishlistItem } from '@/types/wishlist';
  import WishlistSpecDropdowns from './WishlistSpecDropdowns.vue';

  const cartStore = useCartStore();

  const props = defineProps<{
    item: IWishlistItem;
  }>();

  const emit = defineEmits<{
    'remove': [productId: string];
    'open-cart': [];
    'move-cart': [productId: string];
  }>();

  const selectedSpecs = ref<Record<string, string>>({});
  const quantity = ref<number>(1);
  const isMoving = ref(false);

  const product = computed(() => props.item.productId);

  const discountPercent = computed(() => {
    if (
      !product.value ||
      !product.value.comparePrice ||
      product.value.comparePrice <= product.value.price
    ) {
      return 0;
    }
    return Math.round(
      ((product.value.comparePrice - product.value.price) /
        product.value.comparePrice) *
        100,
    );
  });

  const handleRemove = () => {
    if (product.value) emit('remove', product.value._id);
  };

  const handleMoveToBag = async () => {
    if (!product.value || isMoving.value) return;
    isMoving.value = true;
    try {
      const result = await cartStore.addToCart(
        product.value._id,
        quantity.value,
        selectedSpecs.value,
      );

      if (result.success) {
        emit('open-cart');
        emit('move-cart', product.value._id);
      }
    } finally {
      isMoving.value = false;
    }
  };
</script>

<template>
  <div
    v-if="product"
    class="bg-black/2 dark:bg-white/5 rounded-sm p-4 flex flex-col sm:flex-row gap-4 relative shadow-2xl"
  >
    <!-- Delete Button -->
    <button
      class="absolute top-3 cursor-pointer right-3 flex text-red-600 hover:text-red-700 items-center justify-center z-10"
      @click="handleRemove"
    >
      <i class="ri-delete-bin-line text-lg"></i>
    </button>

    <!-- Product Image Link -->
    <router-link
      :to="`/products/${product.slug}`"
      class="w-full sm:w-35 lg:w-45 shrink-0 aspect-[3/4] overflow-hidden bg-gray-100 max-w-45 mx-auto sm:mx-0"
    >
      <img
        v-if="product.images?.[0]"
        :src="product.images[0].url"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
    </router-link>

    <!-- Product Details & Actions -->
    <div class="flex-1 min-w-0 sm:h-[280px] pr-10 sm:pr-10 flex flex-col">
      <div>
        <!-- Price & Discount -->
        <div class="flex flex-wrap items-center gap-1">
          <span
            :class="
              discountPercent > 0
                ? 'text-red-600'
                : 'text-black/90 dark:text-white/90'
            "
            class="font-bold text-md"
          >
            US ${{ product.price.toFixed(2) }}
          </span>
          <span
            v-if="discountPercent > 0"
            class="text-red-500 font-semibold text-sm"
          >
            -{{ discountPercent }}%
          </span>
          <span
            v-if="product.comparePrice && product.comparePrice > product.price"
            class="text-black/50 dark:text-white/40 line-through text-sm"
          >
            US ${{ product.comparePrice.toFixed(2) }}
          </span>
        </div>

        <!-- Name & Code -->
        <p class="text-sm text-black/90 mt-1 line-clamp-2 dark:text-white/80">
          {{ product.name }}
        </p>

        <p
          v-if="product.code"
          class="text-sm text-black/90 mt-1 dark:text-white/80"
        >
          Code. {{ product.code }}
        </p>

        <!-- Array-Based Specifications Dropdowns -->
        <WishlistSpecDropdowns
          v-model="selectedSpecs"
          :specifications="product.specifications"
        />
      </div>

      <!-- Action Button -->
      <button
        @click="handleMoveToBag"
        :disabled="isMoving"
        class="mt-4 text-sm flex items-center justify-center gap-2 sm:mt-auto w-full sm:w-32 bg-black/90 dark:border border-white/30 text-white py-2 rounded font-medium disabled:opacity-40 cursor-pointer"
      >
        <svg
          v-if="isMoving"
          class="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
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
        <span>{{ isMoving ? 'Moving...' : 'Move to bag' }}</span>
      </button>
    </div>
  </div>
</template>
