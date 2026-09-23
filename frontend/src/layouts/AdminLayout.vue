<script setup lang="ts">
  import { ref } from 'vue';
  import AdminSidebar from '@/components/admin/AdminSidebar.vue';
  import AdminHeader from '@/components/admin/AdminHeader.vue';

  const isMobileOpen = ref(false);
  const isCollapsed = ref(false);
  
</script>

<template>
  <div class="min-h-screen dark:bg-surface-800 bg-slate-100 flex animate-fade-in">
    <!-- Fixed Sidebar -->
    <AdminSidebar
      :is-open="isMobileOpen"
      :is-collapsed="isCollapsed"
      @close="isMobileOpen = false"
      @toggle-collapse="isCollapsed = !isCollapsed"
    />

    <!-- Main Content Container -->
    <div 
      class="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
      :class="[isCollapsed ? 'lg:pl-16' : 'lg:pl-64']"
    >
      <!-- Sticky Header -->
      <AdminHeader @toggle-mobile-sidebar="isMobileOpen = !isMobileOpen" />

      <!-- Page Content -->
      <main class="flex-1 p-6 min-w-0 overflow-x-hidden">
        <router-view />
      </main>
    </div>
  </div>
</template>
