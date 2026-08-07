<script setup lang="ts">
  withDefaults(
    defineProps<{
      isLoading?: boolean;
      isError?: boolean;
    }>(),
    {
      isLoading: false,
      isError: false,
    },
  );
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="isLoading" 
      class="fixed top-0 left-0 right-0 h-1 bg-blue-100/50 z-50 overflow-hidden pointer-events-none"
    >
      <div class="h-full bg-blue-400 w-full animate-progress origin-left"></div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes progress {
  0% {
    transform: scaleX(0);
  }
  50% {
    transform: scaleX(0.7);
  }
  100% {
    transform: scaleX(1);
  }
}

.animate-progress {
  animation: progress 1s infinite ease-in-out;
}
</style>
