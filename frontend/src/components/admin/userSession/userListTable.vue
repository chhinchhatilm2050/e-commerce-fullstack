<script setup lang="ts">
  import StatusDropdown from '@/components/admin/orderSession/StatusDropdown.vue';
  import type { User } from '@/types/user';

  defineProps<{
    customers: User[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'status-change', payload: { id: string; status: 'active' | 'inactive' | 'blocked' }): void;
    (e: 'view', customer: User): void;
    (e: 'delete', payload: { id: string; name: string }): void;
  }>();

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Blocked', value: 'blocked' },
  ];

  // Helper for user avatar initial letter fallback
  const getInitial = (firstName?: string) => {
    return firstName ? firstName.charAt(0).toUpperCase() : 'U';
  };

  // Format joined date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
</script>

<template>
  <div class="w-full h-full">
    <table class="w-full text-left text-xs border-collapse">
      <!-- Sticky Header -->
      <thead class="sticky top-0 z-10 bg-[#cdd0d5] text-[11px] font-semibold uppercase tracking-wider dark:bg-[#b0b3b8] text-black/90 shadow-xs">
        <tr>
          <th class="py-4 px-5">User</th>
          <th class="py-4 px-5">Role</th>
          <th class="py-4 px-5">Joined</th>
          <th class="py-4 px-5">Orders</th>
          <th class="py-4 px-5">Status</th>
          <th class="py-4 px-5 text-right">Actions</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100 dark:divide-slate-100/20 text-xs">
        <!-- Loading State -->
        <tr v-if="loading">
          <td colspan="6" class="p-8 py-30 text-center text-black/90">
            <i class="ri-refresh-line text-lg leading-none inline-block animate-spin"></i>
            <p class="mt-2 text-xs">Loading customer catalog...</p>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="customers.length === 0">
          <td colspan="6" class="p-8 py-30 text-center text-black/90">
            <i class="ri-search-line"></i> No customers found matching your filter criteria.
          </td>
        </tr>

        <!-- Data Rows -->
        <tr
          v-else
          v-for="customer in customers"
          :key="customer._id"
          class="hover:bg-slate-50/60 dark:hover:bg-surface-700/30"
        >
          <!-- User Info (Avatar + Name + Email) -->
          <td class="py-4 px-5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0 overflow-hidden">
                <img 
                  v-if="customer.avatar" 
                  :src="customer.avatar" 
                  :alt="`${customer.firstName}'s avatar`"
                  class="w-full h-full object-cover" 
                />
                <span v-else>
                  {{ getInitial(customer.firstName) }}
                </span>
              </div>
              <div>
                <span class="font-medium text-black/90 capitalize line-clamp-1">
                  {{ customer.firstName }} {{ customer.lastName }}
                </span>
                <span class="text-[10px] text-black/60 block">
                  {{ customer.email }}
                </span>
              </div>
            </div>
          </td>

          <!-- Role -->
          <td class="py-4 px-5 text-black/90 capitalize">
            <div class="font-medium">
              {{ customer.role || 'Customer' }}
            </div>
          </td>

          <!-- Joined -->
          <td class="py-4 px-5 text-black/80">
            {{ formatDate(customer.createdAt) }}
          </td>

          <!-- Orders -->
          <td class="py-4 px-5">
            <span class="font-semibold text-black/95 block">
              {{ customer.orderCount || 0 }} orders
            </span>
            <span class="text-[10px] text-black/60 block">
              ${{ (customer.totalSpent || 0).toFixed(2) }} spent
            </span>
          </td>

          <!-- Status Dropdown Column -->
          <td class="py-4 px-5 relative overflow-visible">
            <StatusDropdown
              v-model="customer.status"
              :entity-id="customer._id"
              :options="statusOptions"
              @change="(newStatus) => emit('status-change', { id: customer._id, status: newStatus as 'active' | 'inactive' | 'blocked' })"
            />
          </td>

          <!-- Actions Column -->
          <td class="py-4 px-5 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button
                type="button"
                @click="emit('view', customer)"
                title="View Details"
                class="p-1.5 hover:text-black/70 text-black/90 transition cursor-pointer inline-block"
              >
                <i class="ri-eye-line text-base"></i>
              </button>
              <button
                type="button"
                @click="emit('delete', { id: customer._id, name: `${customer.firstName} ${customer.lastName}` })"
                title="Delete User"
                class="p-1.5 ml-1 text-red-600 hover:text-red-700 transition cursor-pointer inline-block"
              >
                <i class="ri-delete-bin-line text-base"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
