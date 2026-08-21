<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
    title?: string;
    message?: string;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    'confirm': [];
    'cancel': [];
  }>();

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      emit('cancel');
    }
  };
  
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 "
      @click="handleBackdropClick"
    >
      <div
        class="relative bg-white dark:bg-surface-800 rounded-lg max-w-sm w-full p-6  border border-black/10 dark:border-white/10 animate-scale-in"
      >
        <!-- Close Icon Button -->
        <button
          @click="emit('cancel')"
          :disabled="loading"
          class="absolute top-4 right-4 text-black/80 dark:text-white/80 hover:text-gray-600 dark:hover:text-white/90 transition cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <i class="ri-close-line text-xl"></i>
        </button>

        <!-- Content -->
        <h3 class="text-lg font-semibold text-black/90 dark:text-white pr-6">
          {{ title || 'Confirm Action' }}
        </h3>
        <p class="mt-2 text-sm text-black/80 dark:text-gray-300">
          {{ message || 'Are you sure you want to proceed?' }}
        </p>

        <!-- Actions -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="emit('cancel')"
            :disabled="loading"
            class="subCategory-button cursor-pointer text-sm"
          >
            Cancel
          </button>
          <button
            @click="emit('confirm')"
            :disabled="loading"
            class="subCategory-button  text-red-700 cursor-pointer text-sm flex gap-1"
          >
          <i v-if="loading" class="ri-loader-4-line animate-spin"></i>
          <i v-else class="ri-delete-bin-5-line"></i>
            {{ loading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
