<script setup lang="ts">
  import BaseNotification from './components/common/BaseNotification.vue';
  import AppNavbar from './components/common/AppNavbar.vue';
  import AppFooter from './components/common/AppFooter.vue';
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { setAccessToken } from '@/composables/useLocalStorage.js';
  import { useAuthStore } from './stores/authStore.ts';
  import { useNotification } from './composables/useNotification.js';

  const router = useRouter();
  const authStore = useAuthStore();
  const { showNotification } = useNotification();

  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('token');
    const oauthError = urlParams.get('error'); 

    if (!accessToken) {
      if (oauthError) { 
        showNotification('Login failed!', { type: 'error' });
      }
      return;
    }

    try {
      setAccessToken(accessToken);
      authStore.setToken(accessToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      router.push('/');
    } catch (err) {
      authStore.authError = err as string;
      showNotification('Login failed!', { type: 'error' });
    }
  });
</script>

<template>
  <app-navbar />
  <base-notification />
  <router-view />
  <app-footer />
</template>

<style scoped></style>
