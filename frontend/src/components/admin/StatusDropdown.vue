<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';

  const props = defineProps<{
    modelValue: string;
    orderId: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
  }>();

  const statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const isOpen = ref(false);

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const formatStatusLabel = (status: string) => {
    if (!status) return 'Select Status';
    const match = statusOptions.find(opt => opt.value === status.toUpperCase());
    return match ? match.label : status;
  };

  const selectStatus = (newStatus: string) => {
    isOpen.value = false;
    if (props.modelValue === newStatus) return;

    emit('update:modelValue', newStatus);
    emit('change', newStatus);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(`.status-dropdown-${props.orderId}`)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    window.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div :class="`relative inline-block items-center text-left status-dropdown-${orderId}`">
    <!-- Trigger Button -->
    <button
      type="button"
      @click.stop="toggleDropdown"
      class="w-[100px] flex items-center justify-between px-2 py-1 text-xs border border-black/60 dark:border-surface-600 rounded-sm text-slate-800 shadow-xs focus:outline-none cursor-pointer transition"
    >
      <span class="font-normal capitalize">{{ formatStatusLabel(modelValue) }}</span>
      <i 
        class="ri-arrow-up-s-line text-black/60 text-sm transition-transform duration-200"
        :class="{ 'rotate-180': !isOpen }"
      ></i>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 z-50 mt-0.5 w-[100px] rounded-sm bg-[#f3f4f6] dark:bg-surface-700 shadow-lg border border-slate-200/80 dark:border-surface-600 overflow-hidden"
      >
        <button
          v-for="status in statusOptions"
          :key="status.value"
          @click="selectStatus(status.value)"
          class="w-full flex items-center justify-between px-3 py-2 text-xs text-black dark:text-white hover:bg-black/10 dark:hover:bg-surface-600 transition cursor-pointer"
        :class="status.value === modelValue
        ? 'bg-black/10 text-gray-900 dark:bg-surface-800 dark:text-white font-medium'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-10 dark:hover:bg-surface-700'"
        >
          <span>{{ status.label }}</span>
          <i 
            v-if="modelValue === status.value" 
            class="ri-check-line text-slate-800 dark:text-white text-sm"
          ></i>
        </button>
      </div>
    </Transition>
  </div>
</template>
