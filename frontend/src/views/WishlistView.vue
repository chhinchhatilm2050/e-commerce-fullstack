<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useWishlistStore } from '@/stores/wishlist';
  import { useAlert } from '@/composables/useAlert';
  import TopLoader from '@/components/common/TopLoader.vue';
  import WishlistCard from '@/components/wishlists/WishlistCard.vue';

  const wishlistStore = useWishlistStore();
  const { showAlert } = useAlert();

  onMounted(async () => {
    await wishlistStore.fetchWishlist();
  });

  const handleRemove = async (productId: string) => {
    const res = await wishlistStore.toggleWishlist(productId);
    showAlert(res.message, { type: res.success ? 'success' : 'error' });
  };
</script>

<template>
  <div class="container-xl px-8 py-5">
    <h1 v-if="wishlistStore.items.length > 0" class="text-lg font-bold mb-3">
     <i class="ri-stack-line"></i> My Wishlist ({{ wishlistStore.wishlistCount }} Items)
    </h1>

    <div v-if="wishlistStore.loading" class="text-center py-20">
      <TopLoader :isLoading="wishlistStore.loading" />
    </div>

    <div v-else-if="wishlistStore.items.length === 0" class="text-center py-20">
      <p class="text-center font-semibold text-xl"><i class="ri-remix-line"></i> Your wishlist is currently empty.</p>
      <router-link to="/products/category/books" class="mt-4 inline-block underline font-medium ">Continue Shopping</router-link>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <WishlistCard
        v-for="item in wishlistStore.items"
        :key="item._id"
        :item="item"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

