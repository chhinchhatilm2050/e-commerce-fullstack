<script setup lang="ts">
  import { watchEffect, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCartStore } from '@/stores/cartStore';
  import { useAuthStore } from '@/stores/authStore';
  import { useAlert } from '@/composables/useAlert';
  import CartItemRow from '@/components/cart/CartItemRow.vue';

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
    }>(),
    {
      modelValue: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

  const router = useRouter();
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const { showAlert } = useAlert();

  const close = () => emit('update:modelValue', false);

  // Lock background scroll when drawer is open
  watchEffect(() => {
    if (props.modelValue) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  });

  // Fetch cart on drawer open or login status change
  watch(
    [() => props.modelValue, () => authStore.isLoggedIn],
    async ([isOpen, isLoggedIn]) => {
      if (isOpen && isLoggedIn) {
        await cartStore.fetchCart(true);
      }
    },
    { immediate: true },
  );

  const isEmpty = computed(() => cartStore.cartItems.length === 0);

  async function handleAttributeChange(itemId: string, updatedAttributes: Record<string, string>) {
    await cartStore.updateCartItem(itemId, { selectedAttributes: updatedAttributes });
  }

  const handleIncrement = async (itemId: string, currentQty: number, stock: number) => {
    if (currentQty >= stock) return;
    const result = await cartStore.updateCartItem(itemId, { quantity: currentQty + 1 });
    if (result.success) {
      showAlert('Item quantity increased', { type: 'success' });
    } else {
      showAlert('Failed to update item quantity', { type: 'error' });
    }
  };

  const handleDecrement = async (itemId: string, currentQty: number) => {
    if (currentQty <= 1) return;
    const result = await cartStore.updateCartItem(itemId, { quantity: currentQty - 1 });
    if (result.success) {
      showAlert('Item quantity decreased', { type: 'success' });
    } else {
      showAlert('Failed to update item quantity', { type: 'error' });
    }
  };

  const handleRemove = async (itemId: string) => {
    const result = await cartStore.removeFromCart(itemId);
    if (result.success) {
      showAlert('Item removed successfully', { type: 'success' });
    } else {
      showAlert('Failed to remove item', { type: 'error' });
    }
  };

  const handleShopNow = () => {
    close();
    router.push('/products/category/books');
  };

  const handleCheckout = async () => {
    close();
    if (authStore.isLoggedIn) {
      await cartStore.fetchCart(true);
    }
    router.push('/checkout');
  };

  const goToProductDetail = (slug: string) => {
    close();
    router.push(`/products/${slug}`);
  };
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="props.modelValue" class="fixed inset-0 bg-black/40 z-[60]" @click="close" />
    </Transition>

    <Transition name="slide-right">
      <div
        v-if="props.modelValue"
        class="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-surface-800 z-[70] shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-surface-700">
          <h2 class="text-lg font-semibold dark:text-gray-100">
            Your Bag
            <span v-if="!isEmpty" class="text-black/70 dark:text-white/70 font-normal">
              ({{ cartStore.totalItems }})
            </span>
          </h2>
          <button
            @click="close"
            class="cursor-pointer hover:bg-gray-200 dark:hover:bg-surface-700 w-7 h-7 flex items-center justify-center rounded-sm"
          >
            <i class="ri-sidebar-fold-line text-xl dark:text-gray-200"></i>
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="isEmpty" class="flex-1 flex flex-col items-center mt-30 gap-6 px-8 text-center">
          <i class="ri-shopping-bag-line text-5xl text-black/90 dark:text-white/90"></i>
          <div>
            <p class="text-2xl font-bold dark:text-white">Your bag is empty</p>
            <p class="text-sm text-black/70 dark:text-white/70 mt-2">
              Check out our latest arrivals and stay up-to-date with the latest styles
            </p>
          </div>
          <div class="w-full flex flex-col gap-3">
            <button
              @click="handleShopNow"
              class="w-full py-3 rounded-sm font-semibold bg-black/90 dark:border border-white/30 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              Shop Now
            </button>
          </div>
        </div>

        <!-- Cart Items List -->
        <template v-else>
          <ul class="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-surface-700 px-5">
            <CartItemRow
              v-for="item in cartStore.cartItems"
              :key="item._id"
              :item="item"
              :is-loading="cartStore.loading"
              @navigate="goToProductDetail"
              @remove="handleRemove"
              @increment="handleIncrement"
              @decrement="handleDecrement"
              @attribute-change="(itemId, attrs) => handleAttributeChange(itemId, attrs)"
            />
          </ul>

          <!-- Footer Action Bar -->
          <div class="border-t border-gray-100 dark:border-surface-700 p-5">
            <div class="flex items-center justify-between mb-4">
              <span class="text-md font-bold dark:text-gray-100">Amount to pay</span>
              <span class="text-md font-bold dark:text-gray-100">US ${{ cartStore.amount.toFixed(2) }}</span>
            </div>
            <button
              @click="handleCheckout"
              :disabled="cartStore.loading"
              class="w-full py-3 rounded-sm font-semibold bg-black/90 dark:border border-white/30 text-white hover:bg-black/80 transition-colors cursor-pointer disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
