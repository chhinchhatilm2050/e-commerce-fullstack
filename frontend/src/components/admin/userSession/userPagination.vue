<script setup lang="ts">
  import type { IPagination } from '@/types/iorder';
  defineProps<{
    currentPage: number;
    pagination: IPagination | null;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'prev'): void;
    (e: 'next'): void;
  }>();
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-[#cdd0d5]/80 text-xs text-black/80 font-sans">
    <div>
      <span>Showing Page </span>
      <span class="font-bold">{{ currentPage }}</span>
      <span> of </span>
      <span class="font-bold">{{ pagination?.totalPages || 1 }}</span>
      <span class="ml-1 text-black/60">({{ pagination?.total || 0 }} items total)</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="emit('prev')"
        :disabled="currentPage <= 1 || loading"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/70 hover:bg-white text-black/80 font-medium transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <i class="ri-arrow-left-s-line text-sm"></i>
        <span>Previous</span>
      </button>

      <button
        @click="emit('next')"
        :disabled="currentPage >= (pagination?.totalPages || 1) || loading"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/70 hover:bg-white text-black/80 font-medium transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>Next</span>
        <i class="ri-arrow-right-s-line text-sm"></i>
      </button>
    </div>
  </div>
</template>
