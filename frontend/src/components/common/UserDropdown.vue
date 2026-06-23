<script setup lang="ts">
  import { useAuthStore } from '@/stores/authStore.js';

  const authStore = useAuthStore();
  const emit = defineEmits<{
    'openRegister': [],
    'openLogin': []
  }>(); 
</script>

<template>
  <div>
    <button v-if="authStore.isLoggedIn"
      class="flex items-center btn-ghost gap-2 dark:hover:bg-surface-100"
    >
      <i class="ri-user-line text-lg text-gray-600 dark:text-gray-200"></i>
      <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
        {{ authStore.currentUser?.firstName?.split(' ')[0] }}
      </span>
    </button>
    <div v-else class="hidden sm:flex items-center gap-3">
      <button @click="emit('openRegister')" class="hidden lg:block rounded-sm text-[17px] hover:underline font-semibold transition-all duration-200 cursor-pointer">{{$t('nav.register')}}</button>
      <button @click="emit('openLogin')" class="hidden lg:block rounded-sm text-[17px] hover:underline font-semibold transition-all duration-200 cursor-pointer">{{$t('nav.login')}}</button>
    </div>
  </div>
</template>
