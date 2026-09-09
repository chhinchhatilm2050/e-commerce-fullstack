<script setup lang="ts">
  import { useCartStore } from '@/stores/cartStore';
  import { useAlert } from '@/composables/useAlert';
  import { useRouter } from 'vue-router';

  const cartStore = useCartStore();
  const { showAlert } = useAlert();
  const router = useRouter();

  // Helper to check if item is discounted
  const hasDiscount = (price?: number, comparePrice?: number) => {
    return !!(comparePrice && price && comparePrice > price);
  };

  // Calculate percentage savings
  const calculateDiscountPercent = (price?: number, comparePrice?: number) => {
    if (!hasDiscount(price, comparePrice)) return 0;
    return Math.round((((comparePrice! - price!) / comparePrice!) * 100));
  };

  const handleIncrement = async (itemId: string, currentQty: number, stock: number) => {
    if (currentQty >= stock) return;
    const result = await cartStore.updateCartItem(itemId, { quantity: currentQty + 1 });
    if (!result.success) {
      showAlert('Failed to update quantity', { type: 'error' });
    } else {
      showAlert('Item increase successfully', { type: 'success' });
    }
  };

  const handleDecrement = async (itemId: string, currentQty: number) => {
    if (currentQty <= 1) return;
    const result = await cartStore.updateCartItem(itemId, { quantity: currentQty - 1 });
    if (!result.success) {
      showAlert('Failed to update quantity', { type: 'error' });
    } else {
      showAlert('Item decrease successfully', { type: 'success' });
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
  
  const goToProductDetail = (slug: string) => {
    router.push(`/products/${slug}`);
  };
</script>

<template>
  <div>
    <h2 class="text-base font-bold text-gray-900 mb-2">
      Shopping Cart ({{ cartStore.totalItems }})
    </h2>
    <p class="text-xs text-gray-500 mb-4">ⓘ Items in your bag are not reserved - complete checkout to place order.</p>

    <div v-if="cartStore.cartItems.length === 0" class="py-8 text-center text-sm text-gray-500">
      Your cart is empty.
    </div>

    <!-- Scrollable Container for Cart Items -->
    <div 
      v-else 
      class="space-y-4 max-h-[472px] overflow-y-auto pr-2 custom-scrollbar"
    >
      <div 
        v-for="item in cartStore.cartItems" 
        :key="item._id" 
        class="flex gap-4 pb-4 border-b relative border-gray-100"
      >
        <!-- Product Image & Discount Tag -->
        <div class="relative w-28 h-38 flex-shrink-0">
          <img 
            :src="item.productId?.images?.[0]?.url" 
            :alt="item.productId?.name" 
            class="w-full h-full object-cover bg-gray-100 cursor-pointer" 
            @click="goToProductDetail(item.productId?.slug)"
          />
          <span 
            v-if="hasDiscount(item.productId?.price, item.productId?.comparePrice)"
            class="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-meduim px-1.5 py-0.5"
          >
            -{{ calculateDiscountPercent(item.productId?.price, item.productId?.comparePrice) }}%
          </span>
        </div>
        
        <div class="flex-1 text-sm flex flex-col justify-between">
          <div class="space-y-1 pr-6">
            <p class="font-bold text-gray-900 leading-snug">{{ item.productId?.name }}</p>
            <p class="text-xs text-black/50">Code. {{ item.productId?.code }}</p>

            <!-- Read-Only Selected Color & Size Display -->
            <div 
              v-if="item.selectedAttributes && (item.selectedAttributes.color || item.selectedAttributes.colors || item.selectedAttributes.size || item.selectedAttributes.sizes)"
              class="flex items-center gap-1.5 text-xs text-gray-600 pt-0.5"
            >
              <span v-if="item.selectedAttributes.color || item.selectedAttributes.colors">
                Color: <strong class="text-gray-800 capitalize">{{ item.selectedAttributes.color || item.selectedAttributes.colors }}</strong>
              </span>

              <span v-if="(item.selectedAttributes.color || item.selectedAttributes.colors) && (item.selectedAttributes.size || item.selectedAttributes.sizes)">
                /
              </span>

              <span v-if="item.selectedAttributes.size || item.selectedAttributes.sizes">
                Size: <strong class="text-gray-800 uppercase">{{ item.selectedAttributes.size || item.selectedAttributes.sizes }}</strong>
              </span>
            </div>

            <!-- Stock Warning -->
            <p class="text-xs text-red-500 pt-0.5" v-if="(item.productId?.stock || 0) <= 5">
              Only {{ item.productId?.stock }} left
            </p>
          </div>

          <!-- Quantity Controls & Remove Action -->
          <div class="flex items-end justify-between pt-2">
            <div class="flex items-center gap-3">
              <!-- Decrement / Increment Control -->
              <div class="flex items-center border border-gray-300 rounded">
                <button
                  @click="handleDecrement(item._id, item.quantity)"
                  :disabled="item.quantity <= 1 || cartStore.loading"
                  class="w-7 h-7 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                >
                  −
                </button>
                <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
                <button
                  @click="handleIncrement(item._id, item.quantity, item.productId?.stock || 0)"
                  :disabled="item.quantity >= (item.productId?.stock || 0) || cartStore.loading"
                  class="w-7 h-7 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              <!-- Delete Icon Button -->
              <div class="absolute right-0 top-0">
                <button
                  @click="handleRemove(item._id)"
                  :disabled="cartStore.loading"
                  class="text-xs text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-30 p-1"
                  title="Remove item"
                >
                  <i class="ri-delete-bin-line text-[16px]"></i>
                </button>
              </div>
            </div>

            <!-- Stacked Price Breakdown (Matching Image Style) -->
            <div class="text-right space-y-0.5">
              <template v-if="hasDiscount(item.productId?.price, item.productId?.comparePrice)">
                <!-- Original Compare Price -->
                <div class="text-xs text-gray-400 line-through">
                  ${{ ((item.productId?.comparePrice || 0) * item.quantity).toFixed(2) }}
                </div>

                <!-- Discount Percentage & Discount Amount -->
                <div class="text-xs font-medium text-gray-900">
                  ({{ calculateDiscountPercent(item.productId?.price, item.productId?.comparePrice) }}% off) 
                  <span>-${{ (((item.productId?.comparePrice || 0) - (item.productId?.price || 0)) * item.quantity).toFixed(2) }}</span>
                </div>

                <!-- Final Price in Red -->
                <div class="text-sm font-medium text-red-600">
                  ${{ ((item.productId?.price || 0) * item.quantity).toFixed(2) }}
                </div>
              </template>

              <!-- Regular Price Display -->
              <template v-else>
                <div class="text-sm font-medium text-black">
                  ${{ ((item.productId?.price || 0) * item.quantity).toFixed(2) }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

