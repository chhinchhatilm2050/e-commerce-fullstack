<!-- src/components/admin/productSession/RestoreConfirmModal.vue -->
<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
    itemName?: string;
    loading?: boolean;
  }>();

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      emit('close');
    }
  };

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'confirm'): void;
  }>();
</script>

<template>
  <div
    v-if="isOpen"
    @click="handleBackdropClick"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 "
  >
    <div class="w-full max-w-md bg-white dark:bg-surface-800 rounded-lg p-6 shadow-xl animate-slide-up">
      <div class="flex items-center justify-center gap-3">
        <div class=" text-emerald-600 dark:text-emerald-300 rounded-lg">
          <i class="ri-restart-line text-xl"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Restore Product</h3>
        </div>
      </div>
    
      <p class="mt-3 text-sm text-black/80 dark:text-white/80 text-center">
        Are you sure you want to restore <span class="font-semibold text-black dark:text-white">"{{ itemName }}"</span>? It will appear in your active catalog list again.
      </p>

      <div class="flex items-center justify-end gap-2 mt-6">
        <button
          @click="emit('close')"
          :disabled="loading"
          class="w-full subCategory-button px-4 py-1.5 bg-white dark:bg-white/50 border border-black/10 text-red-600 text-sm"
        >
          Cancel
        </button>
        <button
          @click="emit('confirm')"
          :disabled="loading"
          class="flex items-center gap-1.5 w-full subCategory-button px-4 py-1.5 text-sm disabled:opacity-50"
        >
          <i v-if="loading" class="ri-loader-4-line animate-spin text-xs"></i>
          <span>{{ loading ? 'Restoring...' : 'Restore Product' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
