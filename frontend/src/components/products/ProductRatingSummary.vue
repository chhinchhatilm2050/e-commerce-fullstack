<script setup lang="ts">
  defineProps<{
    ratingAvg: number;
    ratingCount: number;
  }>();
</script>

<template>
  <div v-if="ratingCount > 0" class="flex items-center gap-2">
    <div class="flex items-center gap-0.5">
      <i
        v-for="n in 5"
        :key="n"
        class="ri-star-fill text-[15px]"
        :class="n <= Math.round(ratingAvg) ? 'text-yellow-600' : 'text-gray-200'"
      ></i>
    </div>
    <span class="font-semibold text-sm">{{ ratingAvg.toFixed(1) }}</span>
    <span class="text-black/60 text-sm dark:text-white/80">({{ ratingCount }} reviews)</span>
  </div>
  <div v-else class="text-black/80 dark:text-white/80 text-sm flex justify-center items-center gap-1">
    <i class="ri-star-half-line text-yellow-600"></i> No reviews yet
  </div>
</template>

