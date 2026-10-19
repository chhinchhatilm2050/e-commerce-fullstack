<script setup lang="ts">
  interface ISpecificationItem {
    key: string;
    value: string;
  }

  defineProps<{
    specifications?: ISpecificationItem[];
  }>();

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };
  </script>

<template>
  <div
    v-if="specifications && specifications.length > 0"
    class="divide-y divide-black/10 dark:divide-white/10"
  >
    <div
      v-for="(spec, index) in specifications"
      :key="index"
      class="flex justify-between py-2 text-sm"
    >
      <span class="text-black/60 dark:text-white/60">
        {{ formatKey(spec.key) }}
      </span>
      <span class="font-medium capitalize text-right dark:text-white">
        {{ spec.value }}
      </span>
    </div>
  </div>
</template>
