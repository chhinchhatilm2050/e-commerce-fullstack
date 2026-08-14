<script setup lang="ts">
  import BaseAlert from './components/common/BaseAlert.vue';
  import AppNavbar from './components/common/AppNavbar.vue';
  import AppFooter from './components/common/AppFooter.vue';
  import { onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { setAccessToken, getAccessToken } from '@/composables/useLocalStorage.js';
  import { useAuthStore } from './stores/authStore.js';
  import { useAlert } from '@/composables/useAlert.js';
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const { showAlert } = useAlert();
  const isForgotPasswordRoute = computed(() => router.currentRoute.value.path.startsWith('/forget-password'));
  const isNotFoundPage = computed(() => route.name === 'notFound');

  onMounted(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('token');
    const oauthError = urlParams.get('error'); 

    const existingToken = getAccessToken();
    if (existingToken) {
      await authStore.fetchMe();
    }

    if (!accessToken) {
      if (oauthError) { 
        router.push('/');
        showAlert(oauthError, { type: 'error' });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return;
    }

    try {
      setAccessToken(accessToken);
      authStore.setToken(accessToken);
      await authStore.fetchMe();
      window.history.replaceState({}, document.title, window.location.pathname);
      router.push('/');
      showAlert('Login successfully.', { type: 'success' });
    } catch (err) {
      authStore.authError = err as string;
      showAlert('Login failed!', { type: 'error' });
    }
  });
</script>

<template>
  <app-navbar />
  <base-alert />
  <router-view />
  <app-footer v-if="!isForgotPasswordRoute && !isNotFoundPage" />
</template>
