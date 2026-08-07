<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useThemeStore } from '@/stores/useThemStore.js';
  import LangDropdown from './LangDropdown.vue';
  import AuthButton from './AuthButton.vue';
  import PhoneNavbar from './PhoneNavbar.vue';
  import AppAccount from './AppAccount.vue';
  import { useDialog } from '@/composables/useDialog.js';
  import AuthDialog from './AuthDialog.vue';
  import SearchDialog from './SearchDialog.vue';
  import { useCategoryStore } from '@/stores/categoryStore.ts';
  import { useRoute, useRouter } from 'vue-router';

  const themeStore = useThemeStore();
  const categoryStore = useCategoryStore();
  const route = useRoute();
  const router = useRouter();

  onMounted(() => {
    if (categoryStore.topLevelCategories.length === 0) {
      categoryStore.fetchTopLevelCategories();
    }
  });

  const { isOpen: isAuthOpen, open: openAuth } = useDialog();
  const { isOpen: isAccountOpen, open: openAccountDialog } = useDialog();
  const { isOpen, open, close } = useDialog();
  const openAsRegister = ref<boolean>(false);

  const openRegister = () => { openAsRegister.value = true; openAuth(); };
  const openLogin = () => { openAsRegister.value = false; openAuth(); };
  const openAccount = () => { openAccountDialog(); };
  const openSearch = () => open() ;

  const mobileMenuOpen = ref<boolean>(false);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const currentSlug = route.params.slug as string | undefined;

    if (route.name === 'category' && currentSlug) {
      router.push({ path: `/category/${currentSlug}`, query: { search: query.trim(), page: '1' } });
      return;
    } else {
      router.push({
        path: '/search',
        query: { search: query.trim(), page: '1' },
      });
    }
    close();
  };
</script>

<template>
    <header class="sticky top-0 z-50 bg-white backdrop-blur-md sm:border-b border-gray-200"
        :class="{ 'dark:bg-surface-800 dark:border-surface-700': true }"
    >
        <div class="container-xl">
            <nav class="flex items-center justify-between gap-3 h-16">
                <button @click="mobileMenuOpen = !mobileMenuOpen"
                    class="lg:hidden btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-full dark:hover:bg-surface-100"
                >
                    <svg class="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
                <RouterLink to="/" class="cursor-pointer">
                    <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] block dark:hidden" src="../../assets/image/torilogo.png" alt="">
                    <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] hidden dark:block" src="../../assets/image/torilogowhite.png" alt="">
                </RouterLink>
                <ul class="hidden lg:flex items-center gap-4">
                    <li>
                        <RouterLink to="/"
                            class="rounded-sm text-[17px] hover:underline font-semibold transition-all duration-200 cursor-pointer"
                            :class="{ underline: route.path === '/' }"
                        >
                            HOME
                        </RouterLink>
                    </li>
                    <li v-for="cat in categoryStore.topLevelCategories" :key="cat._id">
                        <RouterLink :to="`/category/${cat.slug}`"
                            class="rounded-sm text-[17px] hover:underline font-semibold transition-all duration-200 cursor-pointer"
                            :class="{ underline: route.path === `/category/${cat.slug}` }"
                        >
                            {{ cat.name.toUpperCase() }}
                        </RouterLink>
                    </li>
                </ul>

                <div class="flex items-center gap-1 sm:gap-3">
                    <LangDropdown/>
                    <button @click="openSearch" class="btn-ghost w-8 h-8 flex items-center justify-center rounded-full dark:hover:bg-surface-100">
                        <i class="ri-search-line text-gray-500 text-lg dark:text-gray-300"></i>
                    </button>
                    <button @click="themeStore.toggleDarkMode()" class="btn-ghost w-8 h-8 flex items-center justify-center rounded-full dark:hover:bg-surface-100">
                        <i v-if="!themeStore.darkMode" class="ri-moon-line text-gray-500 text-lg"></i>
                        <i v-else class="ri-sun-line text-gray-300"></i>
                    </button>
                    <button class="btn-ghost w-8 h-8 flex items-center justify-center rounded-full dark:hover:bg-surface-100">
                        <i class="ri-poker-hearts-line text-gray-500 text-lg dark:text-gray-300"></i>
                    </button>
                    <RouterLink to="/cart" class="relative btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-full dark:hover:bg-surface-100">
                        <i class="ri-shopping-bag-line text-lg dark:text-gray-300 text-gray-500"></i>
                        <span class="absolute -top-0 -right-0.5 w-4.5 h-4.5 bg-red-600 animate-bounce-sm text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        99+</span>
                    </RouterLink>

                    <AuthButton 
                        @open-register="openRegister" 
                        @open-login="openLogin"
                        @open-account="openAccount"
                    />
                </div>

            </nav>
        </div>
        <AuthDialog v-model="isAuthOpen" :start-register="openAsRegister"/>
        <AppAccount v-model="isAccountOpen"/>
        <SearchDialog v-model="isOpen" @search="handleSearchSubmit"/>
        <PhoneNavbar
            v-model="mobileMenuOpen" 
            @open-login="openLogin"
            @open-register="openRegister"
        />
    </header>
</template>

