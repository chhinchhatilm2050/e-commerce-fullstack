<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
    title?: string;
    itemName?: string;
    deleteLoading?: boolean;
    description?: string;
    icon?: string;
  }>();

  const emit = defineEmits(['close', 'confirm']);
  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      emit('close');
    }
  };
</script>

<template>
  <div
    v-if="isOpen"
    @click="handleBackdropClick"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 "
  >
    <div class="w-full max-w-md bg-white dark:bg-surface-800 rounded-lg p-6 shadow-xl animate-slide-up">
      <div class="flex items-center justify-center gap-3 text-red-600">
        <div >
          <i :class="icon || 'ri-delete-bin-line'" class="text-2xl"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ title || 'Confirm Deletion' }}
        </h3>
      </div>

      <p class="mt-3 text-sm text-black/80 dark:text-white/80 text-center">
        Are you sure you want to delete
        <span class="font-semibold text-black dark:text-white">"{{ itemName }}"</span>? {{description || 'This action cannot be undone.'}}
      </p>

      <div class="mt-6 flex justify-end gap-2">
        <button
          @click="emit('close')"
          :disabled="deleteLoading"
          class="w-full subCategory-button px-4 py-1.5 bg-white dark:bg-white/50 border border-black/10 text-red-600 text-sm"
        >
          Cancel
        </button>
        <button
          @click="emit('confirm')"
          :disabled="deleteLoading"
          class="flex items-center gap-1.5 w-full subCategory-button px-4 py-1.5 text-sm"
        >
          <i v-if="deleteLoading" class="ri-loader-4-line animate-spin"></i>
          <span>{{ deleteLoading ? 'Deleting...' : 'Delete Product' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
