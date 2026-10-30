<script setup lang="ts">
  defineProps<{
    total: number;
    active: number;
    inactive: number;
  }>();
</script>

<template>
  <section class="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 animate-slide-up">
    <div class="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-4 shadow-xs">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/70">
        <i class="ri-folders-line text-lg"></i>
      </span>
      <div>
        <p class="text-xl font-bold text-black/90">{{ total }}</p>
        <p class="text-xs text-black/60">Total Categories</p>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-4 shadow-xs">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/70">
        <i class="ri-checkbox-circle-line text-lg"></i>
      </span>
      <div>
        <p class="text-xl font-bold text-black/90">{{ active }}</p>
        <p class="text-xs text-black/60">Active Categories</p>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-4 shadow-xs">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/70">
        <i class="ri-pause-circle-line text-lg"></i>
      </span>
      <div>
        <p class="text-xl font-bold text-black/90">{{ inactive }}</p>
        <p class="text-xs text-black/60">Inactive Categories</p>
      </div>
    </div>
  </section>
</template>
