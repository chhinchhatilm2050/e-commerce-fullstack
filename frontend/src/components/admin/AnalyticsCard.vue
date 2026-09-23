<script setup lang="ts">
  defineProps<{
    label: string;
    value: string | number;
    icon: string;
    badgeText?: string;
    isLoading: boolean;
  }>();
</script>

<template>
  <div class="bg-[#cdd0d5] p-5 rounded-lg border border-slate-200/80 shadow-xs transition hover:shadow-md">
    <!-- Skeleton Loading State -->
    <div v-if="isLoading" class="animate-pulse space-y-3">
      <div class="flex justify-between items-center">
        <div class="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div class="w-12 h-5 bg-slate-200 rounded-full"></div>
      </div>
      <div class="w-28 h-7 bg-slate-200 rounded-md"></div>
      <div class="w-20 h-3 bg-slate-200 rounded"></div>
    </div>

    <!-- Active Data State -->
    <div v-else class="space-y-3">
      <div class="flex justify-between items-center">
        <div class="w-10 h-10 rounded-full bg-white/50 text-black/70 flex items-center justify-center">
          <i :class="[icon, 'text-xl']"></i>
        </div>
        <span
          v-if="badgeText"
          class="text-xs font-bold text-emerald-600 bg-white/50 px-2.5 py-1 rounded-full"
        >
          {{ badgeText }}
        </span>
      </div>

      <div>
        <h3 class="text-2xl font-bold text-black/70 tracking-tight">{{ value }}</h3>
        <p class="text-xs font-medium text-black/50 mt-0.5">{{ label }}</p>
      </div>
    </div>
  </div>
</template>
