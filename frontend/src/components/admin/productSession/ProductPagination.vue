<script setup lang="ts">
  import type { IPagination } from '@/types/adminProduct';

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
  <div class="flex flex-col sm:flex-row items-center justify-between border-white/90 border-t dark:bg-[#cdd0d5]/30 bg-[#cdd0d5]/70 p-4 px-5 rounded-b-lg dark:border-slate-700/80 pt-4 gap-3">
    <div class="text-xs text-black/90 dark:text-white/90">
      Showing Page <span class="font-semibold text-black/90 dark:text-white">{{ currentPage }}</span>
      of <span class="font-semibold text-black/90 dark:text-white">{{ pagination?.totalPages || 1 }}</span>
      (<span class="font-medium text-black/90 dark:text-white">{{ pagination?.total || 0 }}</span> items total)
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="emit('prev')"
        :disabled="currentPage === 1 || loading"
        class="inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-1.5 rounded-md font-medium transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="ri-arrow-left-s-line text-sm"></i>
        <span>Previous</span>
      </button>

      <button
        @click="emit('next')"
        :disabled="currentPage >= (pagination?.totalPages || 1) || loading"
        class="inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-1.5 rounded-md font-medium transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <i class="ri-arrow-right-s-line text-sm"></i>
      </button>
    </div>
  </div>
</template>
