<script setup lang="ts">
  defineProps<{
    total: number;
    active: number;
    inactive: number;
    outOfStock: number;
    loading: boolean;
  }>();
</script>

<template>
  <section class="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up">
    <article
      v-for="metric in [
        { label: 'Total Products', value: total, icon: 'ri-box-3-line' },
        { label: 'Active Products', value: active, icon: 'ri-checkbox-circle-line' },
        { label: 'Inactive Products', value: inactive, icon: 'ri-pause-circle-line' },
        { label: 'Out of Stock', value: outOfStock, icon: 'ri-error-warning-line' },
      ]"
      :key="metric.label"
      class="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-4 shadow-xs"
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/70">
        <i :class="[metric.icon, 'text-lg']"></i>
      </div>
      <div>
        <p v-if="loading" class="h-6 w-12 animate-pulse rounded bg-slate-300"></p>
        <p v-else class="text-xl font-bold text-black/90">{{ metric.value }}</p>
        <p class="text-xs text-black/60">{{ metric.label }}</p>
      </div>
    </article>
  </section>
</template>
