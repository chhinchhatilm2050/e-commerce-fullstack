<script setup lang="ts">
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import { computed } from 'vue';

  // const modelValue = defineModel<string>({ default: 'recommend' });
  const props = defineProps(['modelValue']);
  const emit = defineEmits(['update:modelValue']);
  const modelValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const sortOptions = [
    { label: 'Recommend', value: 'recommend' },
    { label: 'New items', value: 'newest' },
    { label: 'Price (High First)', value: 'price_high' },
    { label: 'Price (Low First)', value: 'price_low' },
    { label: 'Discount (High First)', value: 'discount_high' },
    { label: 'Discount (Low First)', value: 'discount_low' },
  ];
</script>

<template>
  <div class="w-48">
    <BaseDropdown v-model="modelValue" :options="sortOptions" />
  </div>
</template>
