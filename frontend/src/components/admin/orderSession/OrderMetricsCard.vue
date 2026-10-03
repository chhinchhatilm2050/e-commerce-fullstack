<script setup lang="ts">
  defineProps<{
    label: string;
    value: string | number;
  }>();

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
    default:
      return 'border-slate-700 text-slate-700 bg-white/50 border-slate-200 shadow-lg';
    }
  };

</script>
<template>
    <div class="bg-[#cdd0d5]/70 p-5 rounded-lg border border-slate-200/80 dark:border-black shadow-xs flex items-center justify-center flex-col transition hover:shadow-md">
      <p :class="getStatusBadgeStyle(label)" class="text-2xl px-4 py-1.5 rounded-full font-bold">{{ value }}</p>
      <p  class="text-xs mt-1 bortder-0">{{label}}</p>
    </div>
</template>
