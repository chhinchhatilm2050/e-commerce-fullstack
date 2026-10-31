<script setup lang="ts">
  import type { IDashboardProduct, IDashboardUser } from '@/types/admin';

  defineProps<{
    users: IDashboardUser[];
    products: IDashboardProduct[];
    loading: boolean;
  }>();

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const getProductImage = (product: IDashboardProduct) =>
    product.images?.find((image) => image.isPrimary)?.url ?? product.images?.[0]?.url;
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-2">
    <div class="rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-5 shadow-xs">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold dark:text-black"><i class="ri-user-line"></i> Recent Users</h3>
          <p class="text-xs text-black/60">Latest customer accounts</p>
        </div>
        <RouterLink to="/admin/customers" class="shrink-0 text-xs px-3 py-1 rounded-sm font-medium bg-white/60 dark:text-black">
          See all users 
        </RouterLink>
      </div>
      <div v-if="loading" class="space-y-3">
        <div v-for="row in 5" :key="row" class="h-9 animate-pulse rounded bg-white/60"></div>
      </div>
      <ul v-else-if="users.length" class="divide-y divide-slate-200/80 dark:divide-slate-200/20 ">
        <li v-for="user in users" :key="user._id" class="flex items-center justify-between gap-3 py-2.5">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="`${user.firstName} ${user.lastName}`"
              class="h-9 w-9 shrink-0 rounded-full bg-white object-cover"
            />
            <span
              v-else
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600"
              :aria-label="`${user.firstName} ${user.lastName}`"
            >
              {{ user.firstName.charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold dark:text-black">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="truncate text-[11px] text-black/60">{{ user.email }}</p>
            </div>
          </div>
          <time class="shrink-0 text-[11px] text-black/60">{{ formatDate(user.createdAt) }}</time>
        </li>
      </ul>
      <p v-else class="py-6 text-center text-xs text-slate-500">No customer accounts yet.</p>
    </div>

    <div class="rounded-lg border border-slate-200/80 bg-[#cdd0d5]/70 p-5 shadow-xs">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold dark:text-black"><i class="ri-exchange-funds-line"></i> Recent Products</h3>
          <p class="text-xs text-black/60">Latest catalog additions</p>
        </div>
        <RouterLink to="/admin/products" class="shrink-0 text-xs px-3 py-1 rounded-sm font-medium bg-white/60 dark:text-black">
          See all products
        </RouterLink>
      </div>
      <div v-if="loading" class="space-y-3">
        <div v-for="row in 5" :key="row" class="h-9 animate-pulse rounded bg-white/60"></div>
      </div>
      <ul v-else-if="products.length" class="divide-y divide-slate-200/80 dark:divide-slate-200/20 ">
        <li v-for="product in products" :key="product._id" class="flex items-center justify-between gap-3 py-2.5">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="getProductImage(product)"
              :src="getProductImage(product)"
              :alt="product.name"
              class="h-10 w-10 shrink-0 rounded-sm bg-white object-cover"
            />
            <span
              v-else
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-slate-500"
              aria-hidden="true"
            >
              <i class="ri-image-line"></i>
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold dark:text-black">{{ product.name }}</p>
              <p class="text-[11px] text-black/60">{{ product.stock }} in stock</p>
            </div>
          </div>
          <time class="shrink-0 text-[11px] text-black/60">{{ formatDate(product.createdAt) }}</time>
        </li>
      </ul>
      <p v-else class="py-6 text-center text-xs text-slate-500">No products yet.</p>
    </div>
  </section>
</template>
