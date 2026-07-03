<script setup lang="ts">
  import { useUserStore } from '@/stores/userStore.js';
  import { onMounted } from 'vue';
  const userStore = useUserStore();
  onMounted(() => {
    userStore.fetchProfile();
  });

</script>

<template>
  <hr class="border-gray-100 dark:border-surface-100 my-1" />
  <div class="relative w-full max-w-md animate-slide-up">
    <div class="flex items-center gap-4 py-3">
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-100 flex items-center justify-center flex-shrink-0">
        <i class="ri-user-fill text-2xl text-gray-500 dark:text-gray-200"></i>
      </div>
      <div>
        <p class="font-semibold text-gray-800 dark:text-gray-100 capitalize">
          {{ userStore.currentUser?.firstName }} {{ userStore.currentUser?.lastName }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-300">
          {{ userStore.currentUser?.email }}
        </p>
      </div>
    </div>

    <hr class="border-gray-100 dark:border-surface-100 my-1" />

    <div class="flex flex-col justify-center">
      <div class="flex items-center gap-3 py-3  transition-colors text-left">
        <i class="ri-women-line text-lg text-gray-500 dark:text-gray-300"></i>
        <span class="text-sm text-gray-700 dark:text-gray-200 capitalize">Gender : {{ userStore.currentUser?.gender }}</span>
      </div>

      <div class="flex items-center gap-3 py-3 transition-colors text-left">
        <i class="ri-phone-line text-lg text-gray-500 dark:text-gray-300"></i>
        <span class="text-sm text-gray-700 dark:text-gray-200 capitalize">Phone : {{ userStore.currentUser?.phoneNumber }}</span>
      </div>

      <div class="flex items-center gap-3 py-3 transition-colors text-left">
        <i class="ri-shopping-bag-line text-lg text-gray-500 dark:text-gray-300"></i>
        <span class="text-sm text-gray-700 dark:text-gray-200">Total Orders : {{ userStore.currentUser?.orderCount }}</span>
      </div>
      <div class="flex items-center gap-3 py-3 transition-colors text-left">
        <i class="ri-money-dollar-circle-line text-lg text-gray-500 dark:text-gray-300"></i>
        <span class="text-sm text-gray-700 dark:text-gray-200">Total Spent : $ {{ userStore.currentUser?.totalSpent }}</span>
      </div>

      <hr class="border-gray-100 dark:border-surface-100 my-1" />
    </div>
  </div>
</template>
