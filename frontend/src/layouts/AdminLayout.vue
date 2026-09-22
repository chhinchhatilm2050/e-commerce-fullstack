<script setup lang="ts">
  import { ref } from 'vue';
  import AdminSidebar from '@/components/admin/AdminSidebar.vue';
  import AdminHeader from '@/components/admin/AdminHeader.vue';

  const isMobileOpen = ref(false);
  const isCollapsed = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex overflow-hidden animate-fade-in">
    <!-- Sidebar -->
    <AdminSidebar
      :is-open="isMobileOpen"
      :is-collapsed="isCollapsed"
      @close="isMobileOpen = false"
      @toggle-collapse="isCollapsed = !isCollapsed"
    />

    <!-- Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AdminHeader @toggle-mobile-sidebar="isMobileOpen = !isMobileOpen" />

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
