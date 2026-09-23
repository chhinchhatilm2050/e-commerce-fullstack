<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAdminStore } from '@/stores/admin';
  import AnalyticsCard from '@/components/admin/AnalyticsCard.vue';
  import RevenueChart from '@/components/admin/RevenueChart.vue';
  import TopProductsChart from '@/components/admin/TopProductsChart.vue';

  const adminStore = useAdminStore();
  const { analylicesData, loading, error } = storeToRefs(adminStore);

  const revenueBadge = computed(() => {
    const growth = analylicesData.value?.revenueGrowth;
    if (growth === undefined || growth === null) return undefined;
    return growth >= 0 ? `+${growth}%` : `${growth}%`;
  });

  const pendingBadge = computed(() => {
    const pendingCount = analylicesData.value?.pendingOrders ?? 0;
    return pendingCount > 0 ? 'Action Needed' : 'All Clear';
  });

  onMounted(() => {
    adminStore.getAnalyticsData();
    adminStore.getSalesChartsData();
  });
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Header Banner -->
    <div class="bg-[#cdd0d5] text-white p-6 rounded-lg shadow-sm flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-black/80">Have a good day, Admin <i class="ri-hearts-fill"></i></h2>
        <p class="text-xs text-black/80 mt-1">Here's what's happening in your store today.</p>
      </div>
      <button
        @click="adminStore.getAnalyticsData()"
        class="hidden sm:flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium transition cursor-pointer"
      >
        <i class="ri-refresh-line" :class="{ 'animate-spin': loading }"></i>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Error Alert Block -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
      <span>{{ error }}</span>
      <button @click="adminStore.getAnalyticsData()" class="font-bold underline cursor-pointer">Retry</button>
    </div>

    <!-- Grid using store data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <AnalyticsCard
        label="Total Revenue"
        :value="`$${(analylicesData?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
        icon="ri-money-dollar-circle-line"
        :is-loading="loading"
        :badge-text="revenueBadge"
      />
      <AnalyticsCard
        label="Total Orders"
        :value="analylicesData?.totalOrders ?? 0"
        icon="ri-shopping-bag-3-line"
        badge-text="+8% this week"
        :is-loading="loading"
      />
      <AnalyticsCard
        label="Pending Orders"
        :value="analylicesData?.pendingOrders ?? 0"
        icon="ri-time-line"
        :badge-text="pendingBadge"
        :is-loading="loading"
      />
      <AnalyticsCard
        label="Total Customers"
        :value="analylicesData?.totalCustomers ?? 0"
        icon="ri-user-3-line"
        badge-text="+4% active"
        :is-loading="loading"
      />
      <AnalyticsCard
        label="Low Stock"
        :value="analylicesData?.lowStockCount ?? 0"
        icon="ri-box-3-line"
        badge-text="+10% increase"
        :is-loading="loading"
      />
    </div>
   <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2">
      <!-- Updated prop bindings to match RevenueChart props -->
      <RevenueChart
        :monthly-revenue="adminStore.chartsData?.monthlySales ?? []"
        :monthly-orders="adminStore.chartsData?.monthlyOrders ?? []"
        :monthly-orders-pending="adminStore.chartsData?.monthlyPending ?? []"
        :monthly-pending-revenue="adminStore.chartsData?.monthlyPendingRevenue ?? []"
        :is-loading="adminStore.chartsLoading"
      />
    </div>
    <div>
      <TopProductsChart
        :names="adminStore.chartsData?.topProducts?.names ?? []"
        :counts="adminStore.chartsData?.topProducts?.counts ?? []"
        :is-loading="adminStore.chartsLoading"
      />
    </div>
</div>
  </div>
</template>
