<script setup lang="ts">
  defineProps<{
    specification?: Record<string, unknown>;
  }>();

  const formatKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };
</script>

<template>
  <div v-if="specification && Object.keys(specification).length > 0" class="divide-y divide-black/10 dark:divide-white/20">
    <div
      v-for="(value, key) in specification"
      :key="key"
      class="flex justify-between py-2 text-sm"
    >
      <span class="text-black/60 dark:text-white/60">{{ formatKey(key) }}</span>
      <span class="font-medium text-right">{{ value }}</span>
    </div>
  </div>
</template>
