<script setup lang="ts">
  import { useAuthStore } from '@/stores/authStore.js';
  const authStore = useAuthStore();
  const emit = defineEmits<{
    'openRegister': [],
    'openLogin': [],
    'openAccount': []
  }>(); 
</script>

<template>
  <div>
    <button v-if="authStore.isLoggedIn" @click="emit('openAccount')"
      class="btn-ghost w-8 h-8 flex items-center justify-center rounded-full text-black dark:text-white dark:hover:bg-surface-100"
    >
      <i class="ri-user-line font-medium dark:text-gray-200"></i>
    </button>
    <div v-else class="hidden sm:flex items-center gap-3">
      <button @click="emit('openRegister')" class="hidden lg:block text-black dark:text-white rounded-sm text-[16px] hover:shadow-xl font-semibold transition-all duration-200 cursor-pointer">{{$t('nav.register')}}</button>
      <button @click="emit('openLogin')" class="hidden lg:block text-black dark:text-white rounded-sm text-[16px] hover:shadow-xl font-semibold transition-all duration-200 cursor-pointer">{{$t('nav.login')}}</button>
    </div>
  </div>
</template>
