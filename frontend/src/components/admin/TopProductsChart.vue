<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      names?: string[];
      counts?: number[];
      isLoading?: boolean;
    }>(),
    {
      names: () => [],
      counts: () => [],
      isLoading: false,
    },
  );

  const chartOptions = computed(() => ({
    chart: {
      id: 'top-products-chart',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    colors: ['#005c8a'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '45%',
      },
    },
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: props.names,
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
    },
    yaxis: {
      labels: { style: { colors: '#334155', fontSize: '11px', fontWeight: 600 } },
    },
    grid: {
      borderColor: '#f1f5f9',
    },
  }));

  const series = computed(() => [
    {
      name: 'Units Sold',
      data: props.counts,
    },
  ]);
</script>

<template>
  <div class="bg-white p-5 rounded-lg border border-slate-200/90 shadow-xs">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-base font-bold text-slate-800">Top-Selling Products</h3>
        <p class="text-xs text-slate-500">Most popular items by unit sales</p>
      </div>
    </div>

    <div v-if="isLoading" class="h-[280px] flex items-center justify-center text-slate-400 text-xs">
      <i class="ri-loader-4-line animate-spin text-2xl mr-2"></i> Loading chart...
    </div>

    <apexchart
      v-else-if="names && names.length > 0"
      type="area"
      height="310"
      :options="chartOptions"
      :series="series"
    />

    <div v-else class="h-[290px] flex items-center justify-center text-slate-400 text-xs">
      No sales data available.
    </div>
  </div>
</template>
