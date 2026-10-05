<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  interface CategoryOption {
    _id: string;
    name: string;
    level?: number;
  }

  const props = defineProps<{
    modelValue: string;
    categories: CategoryOption[];
    placeholder?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const isOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const selectedCategoryName = computed(() => {
    if (!props.modelValue) return props.placeholder || 'All Categories';
    const found = props.categories.find((cat) => cat._id === props.modelValue);
    return found ? found.name : props.placeholder || 'All Categories';
  });

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const selectCategory = (id: string) => {
    emit('update:modelValue', id);
    isOpen.value = false;
  };

  // Close dropdown on outside click
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div ref="dropdownRef" class="relative w-full sm:w-44 z-50 text-xs font-sans">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-sm bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 shadow-xs text-black/90 dark:text-slate-200 cursor-pointer focus:outline-none transition-all"
    >
      <span class="truncate pr-2 font-medium">{{ selectedCategoryName }}</span>
      <i 
        class="ri-arrow-up-s-line text-gray-400 text-sm transition-transform duration-200"
        :class="{ '-rotate-180': !isOpen }"
      ></i>
    </button>

    <!-- Floating Options Menu -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full mt-1 w-full min-w-[180px] bg-white dark:bg-surface-800 rounded-sm border border-slate-200/80 dark:border-slate-700 shadow-lg z-10 max-h-60 overflow-y-auto"
      >
        <!-- Default Option -->
        <button
          type="button"
          @click="selectCategory('')"
          class="w-full flex items-center justify-between cursor-pointer px-3.5 py-2 text-left transition-colors"
          :class="{ 'bg-gray-100 dark:bg-surface-700 dark:text-white font-semibold': modelValue === '' }"
        >
          <span>{{ placeholder || 'All Categories' }}</span>
          <i v-if="modelValue === ''" class="ri-check-line text-slate-700 dark:text-slate-200 text-sm"></i>
          
        </button>

        <div class="border-t border-slate-100 dark:border-slate-700/60"></div>

        <!-- Dynamic Category List -->
        <button
          v-for="cat in categories"
          :key="cat._id"
          type="button"
          @click="selectCategory(cat._id)"
          class="w-full flex items-center cursor-pointer justify-between px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
          :class="[
            { 'bg-gray-100 text-black dark:bg-surface-700 font-semibold': modelValue === cat._id },
            cat.level && cat.level > 0 ? 'pl-6 text-slate-600 dark:text-slate-400' : 'font-semibold text-black/80 dark:text-slate-200'
          ]"
        >
          <span class="truncate dark:text-white">{{ cat.name }}</span>
          <i v-if="modelValue === cat._id" class="ri-check-line text-slate-700 dark:text-slate-200 text-sm"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

