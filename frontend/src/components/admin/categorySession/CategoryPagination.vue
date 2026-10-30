<script setup lang="ts">
  defineProps<{
    currentPage: number;
    totalPages: number;
    totalCategories: number;
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'page-change', page: number): void;
  }>();
</script>

<template>
  <footer class="flex flex-col justify-between gap-3 border-t border-slate-200 bg-[#cdd0d5]/70 px-5 py-3 text-xs text-black/80 sm:flex-row sm:items-center">
    <span>
      Showing page <strong>{{ currentPage }}</strong> of <strong>{{ totalPages }}</strong>
      (<strong>{{ totalCategories }}</strong> categories)
    </span>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-md bg-white/60 px-3 py-1.5 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="currentPage <= 1 || loading"
        @click="emit('page-change', currentPage - 1)"
      >
        <i class="ri-arrow-left-s-line"></i> Previous
      </button>
      <button
        type="button"
        class="rounded-md bg-white/60 px-3 py-1.5 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="currentPage >= totalPages || loading"
        @click="emit('page-change', currentPage + 1)"
      >
        Next <i class="ri-arrow-right-s-line"></i>
      </button>
    </div>
  </footer>
</template>
