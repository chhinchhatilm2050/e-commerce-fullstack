<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      monthlyRevenue?: number[];
      monthlyOrders?: number[];
      monthlyOrdersPending?: number[];
      monthlyPendingRevenue?: number[];
      isLoading?: boolean;
    }>(),
    {
      monthlyRevenue: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyOrders: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyOrdersPending: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      monthlyPendingRevenue: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      isLoading: false,
    },
  );

  const chartOptions = computed(() => ({
    chart: {
      id: 'ecommerce-overview-chart',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    // Color 1: Brand Blue (Approved Revenue)
    // Color 2: Purple (Pending Revenue)
    // Color 3: Emerald Green (Approved Orders)
    // Color 4: Amber/Orange (Pending Orders)
    colors: ['#005c8a', '#8b5cf6', '#10b981', '#f59e1b'],
    stroke: {
      curve: 'smooth',
      width: [2.5, 2, 3, 2.5],
      dashArray: [0, 4, 0, 4], // Dashed lines for pending metrics
    },
    fill: {
      type: ['gradient', 'solid', 'solid', 'solid'],
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 1,
        opacityTo: 0.05,
        stops: [0, 80, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: [0, 3, 4, 4],
      hover: { size: 6 },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { style: { colors: '#64748b', fontSize: '12px' } },
    },
    yaxis: [
      {
        // Left Axis: Approved Revenue
        seriesName: 'Approved Revenue',
        title: { text: 'Revenue ($)', style: { color: '#005c8a', fontWeight: 600 } },
        labels: {
          formatter: (val: number) => `$${Math.round(val).toLocaleString()}`,
          style: { colors: '#64748b' },
        },
      },
      {
        // Shared Left Axis: Pending Revenue (Shares scale with Approved Revenue)
        seriesName: 'Approved Revenue',
        show: false,
      },
      {
        // Right Axis: Approved Orders
        opposite: true,
        seriesName: 'Approved Orders',
        title: { text: 'Orders', style: { color: '#10b981', fontWeight: 600 } },
        labels: {
          formatter: (val: number) => `${Math.round(val)}`,
          style: { colors: '#64748b' },
        },
      },
      {
        // Shared Right Axis: Pending Orders (Shares scale with Approved Orders)
        opposite: true,
        seriesName: 'Approved Orders',
        show: false,
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (val: number) => `$${(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
          formatter: (val: number) => `$${(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pending`,
        },
        {
          formatter: (val: number) => `${val ?? 0} approved`,
        },
        {
          formatter: (val: number) => `${val ?? 0} pending`,
        },
      ],
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#f1f5f9',
    },
  }));

  const series = computed(() => [
    {
      name: 'Approved Revenue',
      type: 'area',
      data: props.monthlyRevenue,
    },
    {
      name: 'Pending Revenue',
      type: 'line',
      data: props.monthlyPendingRevenue,
    },
    {
      name: 'Approved Orders',
      type: 'line',
      data: props.monthlyOrders,
    },
    {
      name: 'Pending Orders',
      type: 'line',
      data: props.monthlyOrdersPending,
    },
  ]);
</script>

<template>
  <div class="bg-white p-5 rounded-lg border border-slate-200/90 shadow-xs">
    <div class="flex items-center justify-between mb-2">
      <div>
        <h3 class="text-base font-bold text-slate-800">Sales & Performance Trends</h3>
        <p class="text-xs text-slate-500">Revenue compared against order volume</p>
      </div>
    </div>

    <div v-if="isLoading" class="h-[320px] flex items-center justify-center text-slate-400 text-xs">
      <i class="ri-loader-4-line animate-spin text-2xl mr-2"></i> Loading performance data...
    </div>

    <apexchart
      v-else
      type="line"
      height="320"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>
