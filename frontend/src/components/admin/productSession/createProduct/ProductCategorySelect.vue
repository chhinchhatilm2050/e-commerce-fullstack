<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useProductAdminStore } from '@/stores/adminProduct';

  interface ICategoryNode {
    _id: string;
    name: string;
    children?: ICategoryNode[];
  }

  interface IFormattedCategory {
    _id: string;
    name: string;
    level: number;
  }

  const props = withDefaults(
    defineProps<{
      placeholder?: string;
      error?: string;
    }>(),
    {
      placeholder: 'Select category',
    },
  );

  // Form Model Binding
  const model = defineModel<string>({ required: true });

  const productAdminStore = useProductAdminStore();

  // Dropdown UI State
  const isOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  // Flatten Category Tree with Level Metadata
  const flattenCategories = (
    nodes: ICategoryNode[],
    level = 0,
  ): IFormattedCategory[] => {
    let result: IFormattedCategory[] = [];
    for (const node of nodes) {
      result.push({
        _id: node._id,
        name: node.name,
        level,
      });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenCategories(node.children, level + 1));
      }
    }
    return result;
  };

  // Formatted Categories Computed Property
  const formattedCategories = computed(() => {
    const tree = productAdminStore.categoryTree || [];
    return flattenCategories(tree);
  });

  // Selected Category Label (Strips indentation prefixes when displaying selected label in trigger)
  const selectedCategoryName = computed(() => {
    if (!model.value) return props.placeholder;
    const found = formattedCategories.value.find((cat) => cat._id === model.value);
    return found ? found.name : props.placeholder;
  });

  // Dropdown Interactions
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const selectCategory = (id: string) => {
    model.value = id;
    isOpen.value = false;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    if (!productAdminStore.categoryTree?.length) {
      productAdminStore.fetchCategories();
    }
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div ref="dropdownRef" class="relative w-full z-50 text-xs font-sans">
    <label class="block label dark:text-black/80">
      Category <span class="text-red-600">*</span>
    </label>

    <!-- Custom Select Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full flex items-center justify-between text-xs px-3 py-1.5 rounded-sm bg-white border border-black/30 shadow-xs text-black/90 cursor-pointer focus:outline-none transition-all"
      :class="{ 'border-red-500': error }"
    >
      <span class="truncate pr-2 font-medium" :class="{ 'text-black/50': !model }">
        {{ selectedCategoryName }}
      </span>
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
        class="absolute left-0 top-full mt-1 w-full bg-white rounded-md border border-slate-200/80 shadow-lg z-10 max-h-60 overflow-y-auto"
      >
        <!-- Dynamic Category List -->
        <button
          v-for="cat in formattedCategories"
          :key="cat._id"
          type="button"
          @click="selectCategory(cat._id)"
          class="w-full flex items-center cursor-pointer justify-between px-3.5 py-2 text-left hover:bg-black/10 transition-colors"
          :style="{ paddingLeft: cat.level > 0 ? `${cat.level * 1.25 + 0.875}rem` : '0.875rem' }"
          :class="[
            { 'bg-gray-100 text-black font-semibold': model === cat._id },
            cat.level === 0 ? 'font-semibold text-black/90' : 'text-black/80'
          ]"
        >
          <span class="truncate flex items-center gap-1">
            <span v-if="cat.level > 0" class="text-black font-mono">•</span>
            {{ cat.name }}
          </span>
          <i v-if="model === cat._id" class="ri-check-line text-black text-sm"></i>
        </button>
      </div>
    </transition>

    <!-- Validation Error Text -->
    <p v-if="error" class="mt-1 text-[11px] text-red-600">
      {{ error }}
    </p>
  </div>
</template>
