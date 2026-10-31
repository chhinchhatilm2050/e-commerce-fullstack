<script setup lang="ts">
  import type { IDashboardProduct } from '@/types/admin';

  defineProps<{
    outOfStockCount: number;
    lowStockCount: number;
    outOfStockProducts: IDashboardProduct[];
    lowStockProducts: IDashboardProduct[];
    loading: boolean;
  }>();
</script>

<template>
  <section class="rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-5 shadow-xs">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-bold  text-red-700"><i class="ri-alert-line"></i> Stock Alerts</h3>
        <p class="text-xs text-black/60">Products needing inventory attention</p>
      </div>
      <RouterLink
        to="/admin/products"
        class="shrink-0 text-xs px-3 py-1 rounded-sm font-medium bg-white/60 dark:text-black"
      >
        See all products
      </RouterLink>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2">
      <div v-for="section in 2" :key="section" class="h-32 animate-pulse rounded-md bg-white/60"></div>
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-md bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-red-700">Out of stock</h4>
          <span class="rounded-md py-0.5 text-xs font-bold text-white bg-red-700 px-3">
            {{ outOfStockCount }}
          </span>
        </div>
        <ul v-if="outOfStockProducts.length" class="space-y-2">
          <li v-for="product in outOfStockProducts" :key="product._id" class="flex items-center justify-between gap-3 text-xs">
            <span class="truncate font-medium dark:text-black">{{ product.name }}</span>
            <span class="shrink-0 font-semibold text-red-700">{{ product.stock }} left</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-500">No out-of-stock products.</p>
      </div>

      <div class="rounded-md bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-amber-900">Low stock (1–10)</h4>
          <span class="rounded-sm px-2 py-0.5 text-xs font-bold bg-amber-800 text-white ">
            {{ lowStockCount }}
          </span>
        </div>
        <ul v-if="lowStockProducts.length" class="space-y-2">
          <li v-for="product in lowStockProducts" :key="product._id" class="flex items-center justify-between gap-3 text-xs">
            <span class="truncate font-medium dark:text-black">{{ product.name }}</span>
            <span class="shrink-0 font-semibold text-amber-700">{{ product.stock }} left</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-500">No low-stock products.</p>
      </div>
    </div>
  </section>
</template>
