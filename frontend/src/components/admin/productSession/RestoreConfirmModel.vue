<!-- src/components/admin/productSession/RestoreConfirmModal.vue -->
<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
    itemName?: string;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'confirm'): void;
  }>();
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
  >
    <div class="bg-white dark:bg-slate-800 rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-lg">
          <i class="ri-restart-line text-xl"></i>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Restore Product</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bring this item back to catalog</p>
        </div>
      </div>

      <p class="text-xs text-slate-600 dark:text-slate-300">
        Are you sure you want to restore <span class="font-semibold text-slate-900 dark:text-white">"{{ itemName }}"</span>? It will appear in your active catalog list again.
      </p>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button
          @click="emit('close')"
          :disabled="loading"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          Cancel
        </button>
        <button
          @click="emit('confirm')"
          :disabled="loading"
          class="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <i v-if="loading" class="ri-loader-4-line animate-spin text-xs"></i>
          <span>Confirm Restore</span>
        </button>
      </div>
    </div>
  </div>
</template>
