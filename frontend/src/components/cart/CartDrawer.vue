<script setup lang="ts">
  import { watchEffect, computed, watch, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCartStore } from '@/stores/cartStore';
  import { useAuthStore } from '@/stores/authStore';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import type { ICartItem, ICartProduct } from '@/types/cart';
  import { useAlert } from '@/composables/useAlert';

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

  // Handle body scrolling lock when drawer is visible
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

  const specLabels: Record<string, string> = {
    colors: 'Color',
    sizes: 'Size',
  };

  const specKeyAliases: Record<string, string[]> = {
    colors: ['colors', 'color'],
    sizes: ['sizes', 'size'],
  };

  const selectedAttrAliases: Record<string, string[]> = {
    colors: ['color', 'colors'],
    sizes: ['size', 'sizes'],
  };

  const normalizeSpecValue = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string');
    }
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  };

  const getSpecEntries = (product: ICartProduct | undefined | null): [string, string[]][] => {
    const spec = product?.specification as Record<string, unknown> | undefined;
    if (!spec) return [];

    const result: [string, string[]][] = [];

    for (const [displayKey, aliases] of Object.entries(specKeyAliases)) {
      for (const alias of aliases) {
        const values = normalizeSpecValue(spec[alias]);
        if (values.length > 0) {
          result.push([displayKey, values]);
          break;
        }
      }
    }

    return result;
  };

  const toDropdownOptions = (values: string[]) => {
    return values.map((v) => ({ value: v, label: v }));
  };

  function getInitialAttrValue(item: ICartItem, displayKey: string, options: string[]): string | undefined {
    const attrs = item.selectedAttributes;
    if (attrs) {
      for (const alias of selectedAttrAliases[displayKey] ?? []) {
        const value = attrs[alias];
        if (value && options.includes(value)) return value;
      }
    }
    return options[0];
  }

  type SelectedAttributes = Record<string, string>;
  type SelectedMap = Record<string, SelectedAttributes>;

  const selected = reactive<SelectedMap>({});

  watch(
    () => cartStore.cartItems,
    (items: ICartItem[]) => {
      items.forEach((item) => {
        const entries = getSpecEntries(item.productId);
        if (!entries.length) return;

        let itemSelections = selected[item._id];
        if (!itemSelections) {
          itemSelections = {};
          selected[item._id] = itemSelections;
        }

        for (const [key, options] of entries) {
          if (itemSelections[key] === undefined) {
            const initialValue = getInitialAttrValue(item, key, options);
            if (initialValue !== undefined) {
              itemSelections[key] = initialValue;
            }
          }
        }
      });
    },
    { immediate: true, deep: false },
  );

  async function handleAttributeChange(
    itemId: string,
    item: ICartItem,
    displayKey: string,
    value: string,
  ) {
    let itemSelections = selected[itemId];
    if (!itemSelections) {
      itemSelections = {};
      selected[itemId] = itemSelections;
    }
    itemSelections[displayKey] = value;

    const attrKey = selectedAttrAliases[displayKey]?.[0] ?? displayKey;
    const updatedAttributes: Record<string, string> = {
      ...(item.selectedAttributes ?? {}),
      [attrKey]: value,
    };

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

  // Navigates to checkout page after fetching cart data
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
            <span v-if="!isEmpty" class="text-black/70 dark:text-white/70 font-normal"
              >({{ cartStore.totalItems }})</span
            >
          </h2>
          <button
            @click="close"
            class="cursor-pointer hover:bg-gray-200 dark:hover:bg-surface-700 w-7 h-7 flex items-center justify-center rounded-sm"
          >
            <i class="ri-close-large-line dark:text-gray-200"></i>
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
            <li v-for="item in cartStore.cartItems" :key="item._id" class="flex gap-3 py-5">
              <img
                @click="goToProductDetail(item.productId.slug)"
                :src="item.productId.images?.[0]?.url"
                :alt="item.productId?.name"
                class="w-28 h-38 object-cover bg-gray-100 dark:bg-surface-700 cursor-pointer"
              />

              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <p class="text-sm font-medium dark:text-gray-100 line-clamp-2">
                    {{ item.productId?.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Code. {{ item.productId?.code }}
                  </p>

                  <!-- Dynamic Specification Dropdowns -->
                  <div v-if="getSpecEntries(item.productId).length" class="flex gap-2 mt-2 flex-wrap">
                    <div
                      v-for="[key, options] in getSpecEntries(item.productId)"
                      :key="key"
                      class="flex flex-col gap-1 w-24"
                    >
                      <label class="text-xs text-black/70 dark:text-white/70">{{ specLabels[key] ?? key }}</label>
                      <BaseDropdown
                        :model-value="selected[item._id]?.[key]"
                        :options="toDropdownOptions(options)"
                        @update:model-value="(val: string) => handleAttributeChange(item._id, item, key, val)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Quantity and Pricing -->
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center gap-2 border border-gray-200 dark:border-surface-600 rounded-sm">
                    <button
                      @click="handleDecrement(item._id, item.quantity)"
                      :disabled="item.quantity <= 1 || cartStore.loading"
                      class="w-7 h-7 flex items-center justify-center cursor-pointer disabled:opacity-30 dark:text-gray-300"
                    >
                      −
                    </button>
                    <span class="text-sm w-4 text-center dark:text-gray-200">{{ item.quantity }}</span>
                    <button
                      @click="handleIncrement(item._id, item.quantity, item.productId?.stock || 0)"
                      :disabled="item.quantity >= (item.productId?.stock || 0) || cartStore.loading"
                      class="w-7 h-7 flex items-center justify-center cursor-pointer disabled:opacity-30 dark:text-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <span class="text-sm font-semibold dark:text-gray-100">
                    US ${{ ((item.productId?.price || 0) * item.quantity).toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Remove Item Button -->
              <button
                @click="handleRemove(item._id)"
                :disabled="cartStore.loading"
                class="self-start text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-30"
              >
                <i class="ri-delete-bin-line text-lg"></i>
              </button>
            </li>
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
