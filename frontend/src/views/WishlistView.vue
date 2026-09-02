<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useWishlistStore } from '@/stores/wishlist';
  import { useCartStore } from '@/stores/cartStore';
  import { useAlert } from '@/composables/useAlert';
  import TopLoader from '@/components/common/TopLoader.vue';
  import WishlistCard from '@/components/wishlists/WishlistCard.vue';
  import CartDrawer from '@/components/common/CartDrawer.vue';

  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const { showAlert } = useAlert();

  onMounted(async () => {
    await wishlistStore.fetchWishlist(true);
  });

  const isCartOpen = ref<boolean>(false);
  const handleRemove = async (productId: string) => {
    const res = await wishlistStore.toggleWishlist(productId);
    showAlert(res.message, { type: res.success ? 'success' : 'error' });
  };

  const handleMoveToCart = async (productId: string) => {
    const res = await wishlistStore.toggleWishlist(productId);
    if (res.success) {
      showAlert('Item move to bag successfully', { type: 'success' });
    }
  };
</script>

<template>
  <TopLoader :isLoading=" cartStore.removeCartLoading || cartStore.updateCartLoading" />
  <div class="container-xl px-8 py-5">
    <h1 v-if="wishlistStore.items.length > 0" class="text-lg font-bold mb-3">
     <i class="ri-stack-line"></i> My Wishlist ({{ wishlistStore.wishlistCount }} Items)
    </h1>

    <div v-if="wishlistStore.loading " class="text-center py-20">
      <TopLoader :isLoading="wishlistStore.loading || cartStore.removeCartLoading || cartStore.updateCartLoading" />
    </div>

    <div v-else-if="wishlistStore.items.length === 0" class="text-center py-20">
      <p class="text-center font-semibold text-xl"><i class="ri-remix-line"></i> Your wishlist is currently empty.</p>
      <router-link to="/products/category/books" class="mt-5 default-button inline-block text-sm">Continue Shopping</router-link>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
      <WishlistCard
        v-for="item in wishlistStore.items"
        :key="item._id"
        :item="item"
        @remove="handleRemove"
        @open-cart="isCartOpen = true"
        @move-cart="handleMoveToCart"
      />
    </div>
    <CartDrawer v-model="isCartOpen"/>
  </div>
</template>

