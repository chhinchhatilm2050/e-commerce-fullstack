<script setup lang="ts">
  defineProps<{
    stats?: {
      total: number;
      active: number;
      inactive: number;
      blocked: number;
    };
    isLoading?: boolean;
  }>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 shrink-0">
    <!-- Total Customers Card -->
    <div class="bg-[#cdd0d5]/70 p-4 rounded-lg flex flex-col items-center justify-center shadow-xs">
      <div v-if="isLoading" class="animate-pulse flex flex-col items-center justify-center space-y-2 w-full py-1">
        <div class="w-12 h-7 bg-slate-200 rounded-full"></div>
        <div class="w-24 h-3 bg-slate-200 rounded-full"></div>
      </div>
      <template v-else>
        <span class="text-2xl font-bold text-black/90">{{ stats?.total ?? 0 }}</span>
        <span class="text-xs text-black/70 font-medium mt-1">Total Customers</span>
      </template>
    </div>

    <!-- Active Accounts Card -->
    <div class="bg-[#cdd0d5]/70 p-4 rounded-lg flex flex-col items-center justify-center shadow-xs">
      <div v-if="isLoading" class="animate-pulse flex flex-col items-center justify-center space-y-2 w-full py-1">
        <div class="w-12 h-7 bg-slate-200 rounded-full"></div>
        <div class="w-24 h-3 bg-slate-200 rounded-full"></div>
      </div>
      <template v-else>
        <span class="text-2xl font-bold text-black/90">{{ stats?.active ?? 0 }}</span>
        <span class="text-xs text-black/70 font-medium mt-1">Active Accounts</span>
      </template>
    </div>

    <!-- Inactive Accounts Card -->
    <div class="bg-[#cdd0d5]/70 p-4 rounded-lg flex flex-col items-center justify-center shadow-xs">
      <div v-if="isLoading" class="animate-pulse flex flex-col items-center justify-center space-y-2 w-full py-1">
        <div class="w-12 h-7 bg-slate-200 rounded-full"></div>
        <div class="w-24 h-3 bg-slate-200 rounded-full"></div>
      </div>
      <template v-else>
        <span class="text-2xl font-bold text-black/90">{{ stats?.inactive ?? 0 }}</span>
        <span class="text-xs text-black/70 font-medium mt-1">Inactive Accounts</span>
      </template>
    </div>

    <!-- Blocked Accounts Card -->
    <div class="bg-[#cdd0d5]/70 p-4 rounded-lg flex flex-col items-center justify-center shadow-xs">
      <div v-if="isLoading" class="animate-pulse flex flex-col items-center justify-center space-y-2 w-full py-1">
        <div class="w-12 h-7 bg-slate-200 rounded-full"></div>
        <div class="w-24 h-3 bg-slate-200 rounded-full"></div>
      </div>
      <template v-else>
        <span class="text-2xl font-bold text-red-700">{{ stats?.blocked ?? 0 }}</span>
        <span class="text-xs text-black/70 font-medium mt-1">Blocked Accounts</span>
      </template>
    </div>
  </div>
</template>
