<script setup lang="ts">
  import { useNotification } from '@/composables/useNotification.js';
  const { notifications, removeNotification } = useNotification();
  const notificationClass = (type: string) => ({
    success: 'bg-gray-200 border border-gray-300',
    error:   'bg-red-50 text-red-600 border border-red-200',
  }[type] ?? 'bg-green-50 text-green-600 border border-green-200');

  const notificationText = (type: string) => ({
    success: 'text-gray-600',
    error:   'text-red-600',
  }[type] ?? 'text-bg-primary-600');

  const notificationIcon = (type: string) => ({
    success: '<i class="ri-check-line text-green-600"></i>',
    error:   '<i class="ri-error-warning-line text-red-600"></i>',
  }[type] ?? '✓');

</script>
<template>
    <Teleport to="body">
    <div class="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-100">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="flex items-center gap-3 px-3 py-2 rounded-xl shadow-lg text-white text-sm"
          :class="notificationClass(notification.type)"
          @click="removeNotification(notification.id)"
        >
          <span class="text-lg h-6 w-6 rounded-full bg-white flex items-center justify-center "
            v-html="notificationIcon(notification.type)"
          >
          </span>
          <span :class="notificationText(notification.type)">{{ notification.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<style scoped>
    .notification-move,
  .notification-enter-active,
  .notification-leave-active {
    transition: all 0.3s ease;
  }
  .notification-enter-from {
    opacity: 0;
    transform: translateY(-100%);
  }
  .notification-leave-to {
    opacity: 0;
    transform: translateY(-100%);
  }
  .notification-leave-active {
    overflow: hidden;
  }
</style>
