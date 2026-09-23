<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import { useUserStore } from '@/stores/userStore';
  import { useThemeStore } from '@/stores/useThemStore';

  const authStore = useAuthStore();
  const userStore = useUserStore();
  const themeStore = useThemeStore();
  const emit = defineEmits(['toggle-mobile-sidebar']);
  const route = useRoute();
  const router = useRouter();

  const pageTitle = computed(() => (route.meta?.title as string) || 'Dashboard Overview');

  // Live Date & Time State
  const currentTime = ref('');
  let timer: ReturnType<typeof setInterval> | null = null;

  const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Dropdown Menu State
  const isDropdownOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isDropdownOpen.value = false;
    }
  };

  onMounted(() => {
    updateClock();
    timer = setInterval(updateClock, 1000);
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
    document.removeEventListener('click', handleClickOutside);
  });

  const handleLogout = async () => {
    isDropdownOpen.value = false;
    await authStore.logout();
    router.push('/');
  };
</script>

<template>
  <header class="sticky top-0 z-30 h-16 dark:bg-surface-800 bg-white border-b border-slate-200 dark:border-surface-700 md:px-6 px-3 flex items-center justify-between shrink-0 animate-slide-up relative">
    <!-- Page Header Title -->
    <div class="flex items-center gap-3">
      <button
        @click="emit('toggle-mobile-sidebar')"
        class="lg:hidden px-1 rounded-sm hover:bg-black/10 cursor-pointer"
      >
        <i class="ri-sidebar-unfold-line text-2xl"></i>
      </button>

      <div>
        <h1 class="text-base font-bold text-black/90 dark:text-white/90 leading-tight">{{ pageTitle }}</h1>
        <p class="text-xs text-black/60 dark:text-white/60">Admin Dashboard</p>
      </div>
    </div>

    <!-- Live Time Display & User Profile Dropdown -->
    <div class="flex items-center gap-4 text-xs font-semibold">
      <!-- Live Clock Badge -->
      <div class="hidden rounded-sm lg:flex items-center gap-2 bg-[#cdd0d5]/60 dark:bg-surface-700 dark:text-white/70 text-black/70 px-3 py-1.5">
        <i class="ri-time-line text-black/90 dark:text-white/90"></i>
        <span class="text-[12px] tracking-tight">{{ currentTime }}</span>
      </div>

      <button
        @click="themeStore.toggleDarkMode()"
        class="btn-ghost w-8 h-8 flex items-center justify-center rounded-full bg-[#cdd0d5] dark:bg-surface-700"
      >
        <i
          v-if="!themeStore.darkMode"
          class="ri-moon-line text-black/80 text-[14px]"
        ></i>
        <i v-else class="ri-sun-line text-black dark:text-white"></i>
      </button>

      <!-- User Profile Trigger & Dropdown Menu -->
      <div class="relative" ref="dropdownRef">
        <!-- Trigger Button -->
        <button
          @click="toggleDropdown"
          class="flex items-center gap-3 p-1.5 rounded-lg text-left border border-transparent cursor-pointer"
        >
          <!-- User Avatar -->
          <div v-if="userStore.currentUser?.avatar" class="w-9 h-9 rounded-full overflow-hidden border-1 border-[#cdd0d5] bg-slate-200 shrink-0">
            <img
              :src="userStore.currentUser?.avatar || '/default-avatar.png'"
              :alt="authStore.currentUser?.role || 'Admin'"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- User Information -->
          <div class="hidden sm:block leading-tight">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white/80 tracking-tight">
              {{ userStore.currentUser?.firstName }} {{ userStore.currentUser?.lastName }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-white/60 font-normal">
              {{ authStore.currentUser?.email || 'admin@chhatstore.com' }}
            </p>
          </div>

          <i
            class="ri-arrow-down-s-line text-black/70 dark:text-white/70 text-base transition-transform duration-200"
            :class="{ 'rotate-180': isDropdownOpen }"
          ></i>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="isDropdownOpen"
          class="absolute right-0 mt-2 w-54 bg-[#cdd0d5] border border-[#cdd0d5] rounded-md shadow-lg py-1.5 text-slate-700 animate-in fade-in zoom-in-95 duration-150 z-30"
        >
          <!-- User info inside dropdown for mobile screens -->
          <div class="sm:hidden px-4 py-2 border-b border-slate-100">
            <p class="text-sm font-bold text-slate-800">{{ authStore.currentUser?.role || 'Admin' }}</p>
            <p class="text-xs text-slate-500 truncate">{{ authStore.currentUser?.email || 'admin@chhatstore.com' }}</p>
          </div>

          <!-- View Store Option -->
          <router-link
            to="/"
            @click="isDropdownOpen = false"
            class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition"
          >
            <i class="ri-external-link-line text-base text-black/80"></i>
            <span>View Store</span>
          </router-link>

          <div class="my-1 border-t border-slate-100"></div>

          <!-- Logout Option -->
          <button
            @click="handleLogout"
            :disabled="authStore.loading"
            class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 transition cursor-pointer text-left"
          >
            <i v-if="!authStore.loading" class="ri-logout-box-r-line text-base"></i>
            <svg
              v-else
              class="w-4 h-4 animate-spin text-rose-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ authStore.loading ? 'Logging out...' : $t('profile.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
