<script setup lang="ts">
  defineProps<{
    stock: number;
    isCartLoading: boolean;
    isWishlisted: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'add-to-bag'): void;
    (e: 'toggle-wishlist'): void;
  }>();
</script>

<template>
  <div class="flex items-center gap-3 mt-6">
    <button
      class="flex-1 flex items-center justify-center gap-2 bg-black/90 hover:bg-black/80 dark:border border-white/30 text-white py-3 rounded font-semibold disabled:opacity-40 cursor-pointer"
      :disabled="stock === 0 || isCartLoading"
      @click="emit('add-to-bag')"
    >
      <svg
        v-if="isCartLoading"
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
      {{ stock > 0 ? 'Add to bag' : 'Out of Stock' }}
    </button>

    <button
      class="w-12 h-12 subCategory-button flex items-center justify-center cursor-pointer transition-colors"
      @click="emit('toggle-wishlist')"
    >
      <i
        :class="
          isWishlisted
            ? 'ri-heart-fill text-xl'
            : 'ri-poker-hearts-line text-lg'
        "
      ></i>
    </button>
  </div>
</template>
