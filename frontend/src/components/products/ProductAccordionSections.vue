<script setup lang="ts">
  import { ref } from 'vue';
  import ProductSpecification from '@/components/products/ProductSpecification.vue';

  interface ISpecificationItem {
    key: string;
    value: string;
  }

  defineProps<{
    description?: string;
    specifications?: ISpecificationItem[];
  }>();

  const openSection = ref<'description' | 'specification' | null>('description');

  const toggleSection = (section: 'description' | 'specification') => {
    openSection.value = openSection.value === section ? null : section;
  };
</script>

<template>
  <div class="mt-8 border-t border-black/10 dark:border-white/20">
    <!-- Description Accordion -->
    <div class="border-black/10 dark:border-white/20 border-b">
      <button
        class="w-full flex items-center justify-between py-4 text-sm font-semibold cursor-pointer"
        @click="toggleSection('description')"
      >
        Description
        <i
          :class="
            openSection === 'description'
              ? 'ri-arrow-up-s-line'
              : 'ri-arrow-down-s-line'
          "
        ></i>
      </button>
      <p
        v-if="openSection === 'description'"
        class="pb-4 text-sm text-black/60 dark:text-white/60 leading-relaxed"
      >
        {{ description }}
      </p>
    </div>

    <!-- Specification Accordion -->
    <div
      v-if="specifications && specifications.length > 0"
      class="border-b border-black/10 dark:border-white/20"
    >
      <button
        class="w-full flex items-center justify-between py-4 text-sm font-semibold cursor-pointer"
        @click="toggleSection('specification')"
      >
        Specification
        <i
          :class="
            openSection === 'specification'
              ? 'ri-arrow-up-s-line'
              : 'ri-arrow-down-s-line'
          "
        ></i>
      </button>
      <div v-if="openSection === 'specification'" class="pb-4">
        <ProductSpecification :specifications="specifications" />
      </div>
    </div>
  </div>
</template>
