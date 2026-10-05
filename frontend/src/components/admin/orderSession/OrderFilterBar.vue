<script setup lang="ts">
  import BaseDropdown from '@/components/common/BaseDropdown.vue';

  const searchInput = defineModel<string>('searchInput', { required: true });
  const selectedPaymentStatusFilter = defineModel<string>('selectedPaymentStatusFilter', { required: true });
  const selectedStatusFilter = defineModel<string>('selectedStatusFilter', { required: true });

  defineProps<{
    paymentStatusOption: { label: string; value: string }[];
    orderStatusOption: { label: string; value: string }[];
    searchDisabled: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'search'): void;
  }>();
</script>

<template>
  <div class="p-3 bg-[#cdd0d5]/70 rounded-lg shadow-xs space-y-3 shrink-0 animate-slide-up">
    <div class="flex flex-col md:flex-row gap-3 items-center">
      <!-- Search Input -->
      <div class="flex items-center gap-2 flex-1 w-full">
        <div class="relative flex-1">
          <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50 text-xs"></i>
          <input
            v-model="searchInput"
            @keyup.enter="emit('search')"
            type="text"
            placeholder="Search by transaction ID or order date..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:text-black/90 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#cdd0d5]  dark:placeholder-zinc-950/50 "
          />
        </div>
        <button
          @click="emit('search')"
          :disabled="searchDisabled"
          class="px-3 py-2 text-xs shrink-0 rounded-sm bg-black/80 text-white font-medium hover:bg-black transition cursor-pointer disabled:opacity-50"
        >
          Search
        </button>
      </div>

      <!-- Dropdown Filters -->
      <div class="w-full md:w-48">
        <BaseDropdown v-model="selectedPaymentStatusFilter" :options="paymentStatusOption" />
      </div>

      <div class="w-full md:w-48">
        <BaseDropdown v-model="selectedStatusFilter" :options="orderStatusOption" />
      </div>
    </div>
  </div>
</template>
