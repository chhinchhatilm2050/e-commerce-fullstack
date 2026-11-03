<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import { useAdminStore } from '@/stores/admin';
  import type { BusinessReportPeriod } from '@/types/admin';

  const adminStore = useAdminStore();
  const { businessReport, reportLoading, reportError } = storeToRefs(adminStore);
  const currentDate = new Date();
  const selectedPeriod = ref<BusinessReportPeriod>('month');
  const selectedYear = ref(String(currentDate.getFullYear()));
  const selectedMonth = ref(String(currentDate.getMonth() + 1));
  const yearOptions = computed(() =>
    Array.from({ length: 6 }, (_, index) => {
      const year = String(currentDate.getFullYear() - index);
      return { value: year, label: year };
    }),
  );
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: new Date(Date.UTC(2025, index, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }),
  }));
  const periodOptions = [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
  ];
  const reportTitle = computed(() => {
    if (!businessReport.value) return '';
    if (businessReport.value.period === 'year') return `${businessReport.value.year} Annual Business Report`;
    const monthName = monthOptions.find((option) => option.value === String(businessReport.value?.month))?.label;
    return `${monthName} ${businessReport.value.year} Business Report`;
  });
  const summaryCards = computed(() => {
    const summary = businessReport.value?.summary;
    if (!summary) return [];
    return [
      { label: 'Collected Revenue', value: formatCurrency(summary.paidRevenue), icon: 'ri-money-dollar-circle-line' },
      { label: 'Paid Orders', value: summary.paidOrders.toLocaleString(), icon: 'ri-shopping-bag-3-line' },
      { label: 'Average Order Value', value: formatCurrency(summary.averageOrderValue), icon: 'ri-bar-chart-box-line' },
      { label: 'Pending Revenue', value: formatCurrency(summary.pendingRevenue), icon: 'ri-time-line' },
      { label: 'Pending Orders', value: summary.pendingOrders.toLocaleString(), icon: 'ri-hourglass-line' },
      { label: 'New Customers', value: summary.newCustomers.toLocaleString(), icon: 'ri-user-add-line' },
      { label: 'Cancelled Orders', value: summary.cancelledOrders.toLocaleString(), icon: 'ri-close-circle-line' },
      { label: 'Refunded Amount', value: formatCurrency(summary.refundedAmount), icon: 'ri-refund-2-line' },
    ];
  });

  function formatCurrency(value: number) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatPaymentMethod(method: string) {
    return method === 'COD' ? 'Cash on delivery' : method === 'aba_payway' ? 'ABA PayWay' : method;
  }

  function formatStatus(status: string) {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  async function loadReport() {
    await adminStore.getBusinessReport({
      period: selectedPeriod.value,
      year: Number(selectedYear.value),
      ...(selectedPeriod.value === 'month' ? { month: Number(selectedMonth.value) } : {}),
    });
  }

  function printReport() {
    window.print();
  }

  onMounted(loadReport);
</script>

<template>
  <section id="business-report" class="space-y-4 rounded-lg border border-slate-200 bg-[#cdd0d5]/70 p-4 shadow-xs sm:p-5 animate-slide-up">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-bold text-black">Business Reports</h2>
        <p class="mt-1 text-xs text-black/70">Review sales, orders, customers, and product performance by period.</p>
      </div>

      <form class="no-print flex flex-wrap items-end gap-2" @submit.prevent="loadReport">
        <div class="flex min-w-24 flex-col gap-1 text-xs font-medium text-black/70">
          Period
          <BaseDropdown v-model="selectedPeriod" :options="periodOptions" />
        </div>
        <div v-if="selectedPeriod === 'month'" class="flex min-w-28 flex-col gap-1 text-xs font-medium text-black/70">
          Month
          <BaseDropdown v-model="selectedMonth" :options="monthOptions" />
        </div>
        <div class="flex min-w-20 flex-col gap-1 text-xs font-medium text-black/70">
          Year
          <BaseDropdown v-model="selectedYear" :options="yearOptions" />
        </div>
        <button
          type="submit"
          :disabled="reportLoading"
          class="inline-flex py-1.5 items-center gap-2 rounded shadow-2xl bg-black/80 px-3 text-xs font-medium cursor-pointer text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i class="ri-refresh-line" :class="{ 'animate-spin': reportLoading }"></i>
          Generate Report
        </button>
        <button
          type="button"
          :disabled="!businessReport || reportLoading"
          class="inline-flex shadow-2xl py-1.5 items-center gap-2 cursor-pointer rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="printReport"
        >
          <i class="ri-printer-line"></i>
          Print
        </button>
      </form>
    </header>

    <div v-if="reportError" class="no-print rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
      <div class="flex items-center justify-between gap-3">
        <span>{{ reportError }}</span>
        <button class="font-semibold underline" type="button" @click="loadReport">Retry</button>
      </div>
    </div>

    <div v-if="reportLoading && !businessReport" class="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
      <i class="ri-loader-4-line animate-spin text-lg"></i>
      Loading business report...
    </div>

    <template v-else-if="businessReport">
      <div class="report-heading border-slate-200 pb-3">
        <h3 class="text-base font-bold text-black">{{ reportTitle }}</h3>
        <p class="mt-1 text-xs text-black/70">Generated {{ new Date().toLocaleString() }} · Revenue includes paid orders and delivered cash-on-delivery orders.</p>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-white p-3"
        >
          <span class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 sm:flex">
            <i :class="[card.icon, 'text-lg']"></i>
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-800">{{ card.value }}</p>
            <p class="text-[11px] leading-tight text-slate-500">{{ card.label }}</p>
          </div>
        </article>
      </div>

      <div class="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <h4 class="px-3 py-2 text-sm font-semibold text-black">
          {{ businessReport.period === 'month' ? 'Daily Sales Breakdown' : 'Monthly Sales Breakdown' }}
        </h4>
        <table class="w-full min-w-[400px] border-collapse text-left text-xs">
          <thead class="bg-[#cdd0d5]/70 text-[11px] uppercase text-black/70">
            <tr>
              <th class="px-3 py-2">{{ businessReport.period === 'month' ? 'Day' : 'Month' }}</th>
              <th class="px-3 py-2 text-center">Paid Orders</th>
              <th class="px-3 py-2 text-right">Collected Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in businessReport.timeline" :key="entry.label" class="border-t text-black/70 border-slate-100">
              <td class="px-3 py-2">{{ entry.label }}</td>
              <td class="px-3 py-2 text-center">{{ entry.orders.toLocaleString() }}</td>
              <td class="px-3 py-2 text-right font-medium">{{ formatCurrency(entry.revenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section class="rounded-md border border-slate-200 bg-white p-3">
          <h4 class="mb-2 text-sm font-semibold text-black">Top Products</h4>
          <p v-if="businessReport.topProducts.length === 0" class="py-3 text-xs text-black/70">No paid product sales for this period.</p>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-[10px] uppercase text-black/70">
                <tr><th class="py-1">Product</th><th class="py-1 text-right">Units</th><th class="py-1 text-right">Sales</th></tr>
              </thead>
              <tbody>
                <tr v-for="product in businessReport.topProducts" :key="product._id" class="border-t text-black/70 border-slate-100">
                  <td class="max-w-32 truncate py-2">{{ product._id }}</td>
                  <td class="py-2 text-right">{{ product.unitsSold }}</td>
                  <td class="py-2 text-right">{{ formatCurrency(product.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rounded-md border border-slate-200 bg-white p-3">
          <h4 class="mb-2 text-sm font-semibold text-black">Payment Methods</h4>
          <p v-if="businessReport.paymentMethods.length === 0" class="py-3 text-xs text-black/70">No collected payments for this period.</p>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-[10px] uppercase text-black/70">
                <tr><th class="py-1">Method</th><th class="py-1 text-right">Orders</th><th class="py-1 text-right">Revenue</th></tr>
              </thead>
              <tbody>
                <tr v-for="payment in businessReport.paymentMethods" :key="payment._id" class="border-t text-black/70 border-slate-100">
                  <td class="py-2">{{ formatPaymentMethod(payment._id) }}</td>
                  <td class="py-2 text-right">{{ payment.orders }}</td>
                  <td class="py-2 text-right">{{ formatCurrency(payment.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rounded-md border border-slate-200 bg-white p-3">
          <h4 class="mb-2 text-sm font-semibold text-black">Order Statuses</h4>
          <p v-if="businessReport.orderStatuses.length === 0" class="py-3 text-xs text-black/70">No orders for this period.</p>
          <div v-else class="space-y-2">
            <div v-for="status in businessReport.orderStatuses" :key="status._id" class="flex items-center justify-between border-t text-black/70 border-slate-100 pt-2 text-xs">
              <span>{{ formatStatus(status._id) }}</span>
              <span class="font-semibold">{{ status.count.toLocaleString() }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
@media print {
  :global(body *) {
    visibility: hidden !important;
  }

  #business-report,
  #business-report * {
    visibility: visible !important;
  }

  #business-report {
    position: absolute !important;
    inset: 0 auto auto 0 !important;
    width: 100% !important;
    border: 0 !important;
    background: white !important;
    padding: 0 !important;
    color: black !important;
    box-shadow: none !important;
  }

  #business-report .no-print {
    display: none !important;
  }

  #business-report .report-heading {
    display: block !important;
  }

  #business-report article,
  #business-report section,
  #business-report div {
    break-inside: avoid;
    color: black !important;
    background: white !important;
  }

  #business-report table {
    min-width: 0 !important;
  }
}
</style>
