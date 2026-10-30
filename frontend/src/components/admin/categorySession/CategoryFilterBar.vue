<script setup lang="ts">
  import BaseDropdown from '@/components/common/BaseDropdown.vue';

  const searchInput = defineModel<string>('searchInput', { default: '' });
  const selectedStatus = defineModel<string>('selectedStatus', { default: '' });

  const emit = defineEmits<{
    (event: 'search'): void;
    (event: 'clear'): void;
  }>();

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];
</script>

<template>
  <section class="rounded-md bg-[#cdd0d5]/70 p-3.5 shadow-sm animate-slide-up">
    <div class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <div class="relative min-w-0 flex-1">
        <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-black/50"></i>
        <input
          v-model="searchInput"
          placeholder="Search category name..."
          class="w-full rounded-sm border border-slate-200 bg-white px-9 py-2 text-xs text-black/90 focus:outline-none focus:ring-1 focus:ring-[#9ca3af]"
          @keyup.enter="emit('search')"
        />
      </div>
      <button type="button" class="rounded-sm bg-[#33363b] cursor-pointer px-4 py-2 text-xs text-white hover:bg-black" @click="emit('search')">
        Search
      </button>
      <div class="w-full sm:w-36">
        <BaseDropdown v-model="selectedStatus" :options="statusOptions" />
      </div>
     
    </div>
  </section>
</template>
