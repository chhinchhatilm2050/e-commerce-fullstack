<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';
  import { useAuthStore } from '@/stores/authStore';

  const userStore = useUserStore();
  const authStore = useAuthStore();

  defineProps<{
    isOpen: boolean;
    isCollapsed: boolean;
  }>();

  const emit = defineEmits(['close', 'toggle-collapse']);
  const route = useRoute();

  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [{ name: 'Dashboard', path: '/admin/dashboard', icon: 'ri-home-4-line' }],
    },
    {
      title: 'CATALOG',
      items: [
        { name: 'Products', path: '/admin/products', icon: 'ri-box-3-line' },
        { name: 'Categories', path: '/admin/categories', icon: 'ri-price-tag-3-line' },
      ],
    },
    {
      title: 'SALES',
      items: [{ name: 'Orders', path: '/admin/orders', icon: 'ri-shopping-bag-3-line' }],
    },
    {
      title: 'CUSTOMERS',
      items: [{ name: 'Users', path: '/admin/customers', icon: 'ri-user-3-line' }],
    },
  ];
</script>

<template>
  <!-- Mobile Backdrop -->
  <div
    v-if="isOpen"
    @click="emit('close')"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
  ></div>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 bg-black md:bg-black/90 text-white flex flex-col transition-all duration-300 ease-in-out lg:static shadow-lg ',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isCollapsed ? 'lg:w-17' : 'lg:w-64',
      'w-64'
    ]"
  >
    <!-- Header / Brand -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0 animate-slide-up">
      
      <!-- Expanded State Logos -->
      <div v-if="!isCollapsed" class="flex items-center">
        <img
          class="w-[90px] h-[20px] sm:w-[125px] sm:h-[25px]"
          src="../../assets/image/torilogowhite.png"
          alt="Logo"
        />
      </div>

      <!-- Collapsed State: "C" Logo swaps to Unfold Icon on Hover -->
      <div 
        v-if="isCollapsed" 
        @click="emit('toggle-collapse')"
        class="hidden lg:flex group cursor-pointer w-full items-center justify-center h-10 rounded-lg hover:bg-white/10 transition"
        title="Expand Sidebar"
      >
        <!-- Static "C" Logo -->
        <div class="w-8 h-8 rounded-full bg-[#005c8a] flex items-center justify-center font-bold text-white group-hover:hidden">
          <img class="rounded-full" src="https://i.pinimg.com/736x/4c/28/8e/4c288ea0426a2eae841762ad251789bb.jpg" alt="">
        </div>
        <!-- Hover Unfold Icon -->
        <i class="ri-sidebar-unfold-line text-xl text-white hidden group-hover:block"></i>
      </div>

      <!-- Desktop Collapse Toggle Button (Shown when Expanded) -->
      <button
        v-if="!isCollapsed"
        @click="emit('toggle-collapse')"
        class="hidden cursor-pointer lg:flex items-center justify-center w-7 h-7 rounded text-white hover:text-white hover:bg-white/10 transition"
        title="Collapse Sidebar"
      >
        <i class="ri-sidebar-fold-line text-xl"></i>
      </button>

      <!-- Mobile Close -->
      <button @click="emit('close')" class="lg:hidden cursor-pointer">
        <i class="ri-sidebar-fold-line text-2xl"></i>
      </button>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 p-3 space-y-5 overflow-y-auto overflow-x-hidden animate-slide-up">
      <div v-for="group in navigationGroups" :key="group.title" class="space-y-2">
        <!-- Section Title -->
        <p
          v-if="!isCollapsed"
          class="px-3 text-xs font-medium tracking-wider text-white/60 uppercase mb-1"
        >
          {{ group.title }}
        </p>

        <!-- Links -->
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          @click="emit('close')"
          class="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="[
            route.path === item.path
              ? 'bg-[#005c8a]/60 text-white font-medium'
              : 'text-white hover:text-white hover:bg-white/5'
          ]"
        >
          <i :class="[item.icon, 'text-lg shrink-0']"></i>
          <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
        </router-link>
      </div>

      <!-- Store Navigation Link -->
      <div class="pt-2 border-t border-white/10">
        <p v-if="!isCollapsed" class="px-3 text-xs font-medium tracking-wider text-white/60 uppercase mb-1">
          STORE
        </p>
        <router-link
          to="/"
          class="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium bg-[#005c8a]/60 text-white hover:bg-[#005c8a] transition"
        >
          <i class="ri-shopping-cart-2-line text-lg shrink-0"></i>
          <span v-if="!isCollapsed" class="truncate">Back to Store</span>
        </router-link>
      </div>
    </nav>

    <!-- Footer Profile -->
    <div class="p-3 border-t border-white/10 shrink-0 bg-black/10">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full bg-gray-200 dark:bg-surface-100 border flex items-center justify-center flex-shrink-0"
        >
          <img class="w-full h-full object-cover rounded-full" v-if="userStore.currentUser?.avatar"
            :src="userStore.currentUser.avatar" alt="">
            <i v-else class="ri-user-fill text-2xl text-gray-500 dark:text-gray-200"></i>
        </div>
        <div class="overflow-hidden">
          <p class="font-meduim capitalize truncate">
            {{ authStore.currentUser?.role }}
          </p>
          <p class="text-xs text-white/60 truncate">
            {{ authStore.currentUser?.email }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
