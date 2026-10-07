<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';

  interface Option {
    label: string;
    value: string;
  }

  const props = withDefaults(
    defineProps<{
      modelValue: string;
      entityId: string; // Generic ID (product ID or order ID)
      disabled?: boolean;
      options?: Option[];
    }>(),
    {
      disabled: false,
      options: () => [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
  }>();

  const isOpen = ref(false);

  const toggleDropdown = () => {
    if (props.disabled) return;
    isOpen.value = !isOpen.value;
  };

  const formatStatusLabel = (status: string) => {
    if (!status) return 'Select Status';
    const match = props.options.find(
      (opt) => opt.value.toLowerCase() === status.toLowerCase(),
    );
    return match ? match.label : status;
  };

  const selectStatus = (newStatus: string) => {
    isOpen.value = false;
    if (props.modelValue === newStatus) return;

    emit('update:modelValue', newStatus);
    emit('change', newStatus);
  };

  // Close dropdown when clicking outside using entityId
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(`.status-dropdown-${props.entityId}`)) {
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
  <div :class="`relative inline-block items-center text-left status-dropdown-${entityId}`">
    <!-- Trigger Button -->
    <button
      type="button"
      @click.stop="toggleDropdown"
      :disabled="disabled"
      :class="[
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        'w-[90px] flex items-center justify-between px-2.5 py-1 text-xs border border-gray-300 dark:border-surface-600 rounded-sm text-black/90 dark:text-white shadow-xs focus:outline-none transition'
      ]"
    >
      <span class="font-medium text-xs capitalize">{{ formatStatusLabel(modelValue) }}</span>
      <i 
        class="ri-arrow-down-s-line text-black/60 dark:text-white/60 text-sm transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
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
        class="absolute left-0 z-50 mt-1 w-[90px] rounded-sm bg-white dark:bg-surface-700 shadow-lg border border-slate-200 dark:border-surface-600 overflow-hidden"
      >
        <button
          v-for="status in options"
          :key="status.value"
          @click="selectStatus(status.value)"
          class="w-full flex items-center justify-between px-3 py-1.5 text-xs text-black dark:text-white hover:bg-gray-100 dark:hover:bg-surface-600 transition cursor-pointer"
          :class="status.value.toLowerCase() === modelValue?.toLowerCase()
            ? 'bg-gray-100 dark:bg-surface-800 font-semibold'
            : ''"
        >
          <span>{{ status.label }}</span>
          <i 
            v-if="modelValue?.toLowerCase() === status.value.toLowerCase()" 
            class="ri-check-line text-slate-800 dark:text-white text-sm"
          ></i>
        </button>
      </div>
    </Transition>
  </div>
</template>
