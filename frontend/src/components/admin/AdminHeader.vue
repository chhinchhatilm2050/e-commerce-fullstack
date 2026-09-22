<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';

  const authStore = useAuthStore();
  const emit = defineEmits(['toggle-mobile-sidebar']);
  const route = useRoute();
  const router = useRouter();
  
  const pageTitle = computed(() => (route.meta?.title as string) || 'Dashboard Overview');
  const handleLogtout = async () => {
    await authStore.logout();
    router.push('/');
  };
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 md:px-6 px-3 flex items-center justify-between shrink-0 animate-slide-up">
    <!-- Page Header Title -->
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggle-mobile-sidebar')"
        class="lg:hidden px-1 rounded-sm hover:bg-black/10 cursor-pointer"
      >
        <i class="ri-sidebar-unfold-line text-2xl"></i>
      </button>

      <div>
        <h1 class="text-base font-bold text-black/90 leading-tight">{{ pageTitle }}</h1>
        <p class="text-xs text-black/60">Admin Dashboard</p>
      </div>
    </div>

    <!-- Header Actions -->
    <div class="flex items-center gap-4 text-xs font-semibold">
      <router-link to="/" class="flex subCategory-button items-center md:block hidden gap-1.5 shadow-sm subCategory-button transition">
        <i class="ri-external-link-line"></i>
        <span>View Store</span>
      </router-link>

      <button @click="handleLogtout" class="flex subCategory-button items-center gap-1.5 bg-white  text-red-600 hover:text-shadow-red-700 transition cursor-pointer">
        <i :class="authStore.loading ? 'hidden' : 'block'" class="ri-logout-box-r-line"></i>
        <svg
            v-if="authStore.loading"
            class="w-4 h-4 animate-spin text-red-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{{ authStore.loading ? "Logout" : $t("profile.logout") }}</span>
      </button>
    </div>
  </header>
</template>
