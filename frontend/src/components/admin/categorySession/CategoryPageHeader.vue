<script setup lang="ts">
  defineProps<{
    isTrashView: boolean;
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'refresh'): void;
    (event: 'update:isTrashView', value: boolean): void;
    (event: 'create'): void;
  }>();
</script>

<template>
  <header class="flex flex-col justify-between gap-4 rounded-lg bg-[#cdd0d5]/70 p-5 shadow-xs sm:flex-row sm:items-center animate-slide-up">
    <div class="flex items-center gap-3">
      <div class="rounded-lg bg-white p-2 text-black/80 shadow-lg">
        <i class="ri-folders-line text-2xl"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-black/80">{{ isTrashView ? 'Trash Categories' : 'Category Management' }}</h1>
        <p class="mt-0.5 text-xs text-black/70">
          {{ isTrashView ? 'Restore categories removed from the catalog' : 'Manage categories, images, and hierarchy' }}
        </p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md bg-white/60 px-3 py-2 text-xs font-medium text-black/80 shadow-sm transition hover:bg-white"
        :disabled="loading"
        @click="emit('refresh')"
      >
        <i class="ri-refresh-line" :class="{ 'animate-spin': loading }"></i>
        Refresh
      </button>
      <div class="inline-flex rounded-md border border-slate-300/40 bg-white/50 p-1 shadow-sm">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs transition"
          :class="!isTrashView ? 'bg-white text-black/80 shadow-sm' : 'text-black/70'"
          @click="emit('update:isTrashView', false)"
        >
          <i class="ri-list-check"></i> Active List
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs transition"
          :class="isTrashView ? 'bg-red-700/80 text-white shadow-sm' : 'text-black/70 hover:text-red-600'"
          @click="emit('update:isTrashView', true)"
        >
          <i class="ri-delete-bin-line"></i> Trash Bin
        </button>
      </div>
     
      <button
        type="button" 
        @click="emit('create')"
        class="inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium transition shadow-sm cursor-pointer"
        >
          <i class="ri-add-circle-line text-sm leading-none"></i>
          <span>Add Category</span>
        </button>
    </div>
  </header>
</template>
