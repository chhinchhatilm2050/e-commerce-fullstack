<script setup lang="ts">
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import type { ICategory } from '@/types/category';

  const statusOptions: Array<{ value: ICategory['status']; label: string }> = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  defineProps<{
    categories: ICategory[];
    parentNames: Record<string, string>;
    loading: boolean;
    isTrashView: boolean;
    mutationLoading: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'edit', category: ICategory): void;
    (event: 'delete', category: ICategory): void;
    (event: 'permanent-delete', category: ICategory): void;
    (event: 'restore', category: ICategory): void;
    (event: 'status-change', payload: { category: ICategory; status: ICategory['status'] }): void;
  }>();

  const formatDate = (date?: string) => {
    if (!date) return '—';
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? '—'
      : parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleStatusChange = (category: ICategory, status: string) => {
    if (status !== 'active' && status !== 'inactive') return;
    emit('status-change', { category, status });
  };
</script>

<template>
  <div class="w-full">
    <table class="w-full min-w-[760px] border-collapse text-left text-xs">
      <thead class="sticky top-0 z-10 bg-[#cdd0d5] text-[11px] font-semibold uppercase tracking-wider dark:bg-[#b0b3b8] text-black/90 shadow-xs"">
        <tr>
          <th class="px-5 py-4">Category</th>
          <th class="px-5 py-4">Parent</th>
          <th class="px-5 py-4">Slug</th>
          <th class="px-5 py-4">Status</th>
          <th class="px-5 py-4">Created</th>
          <th class="px-5 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-100/20 text-xs">
        <tr v-if="loading">
          <td colspan="6" class="py-24 text-center text-black/70" role="status">
            <i class="ri-refresh-line inline-block animate-spin text-lg"></i>
            <p class="mt-2">Loading categories...</p>
          </td>
        </tr>
        <tr v-else-if="categories.length === 0">
          <td colspan="6" class="py-24 text-center text-black/70">
            <i class="ri-folder-2-line"></i> {{ isTrashView ? 'No deleted categories.' : 'No categories found.' }}
          </td>
        </tr>
        <tr v-for="category in categories" v-else :key="category._id" class="mobile-list-row hover:bg-slate-50/60 dark:hover:bg-surface-700/30 transition-colors">
          <td data-label="Category" class="px-5 py-3">
            <div class="flex items-center gap-3">
              <img
                v-if="category.image"
                :src="category.image"
                :alt="category.name"
                class="h-10 w-10 rounded-md border border-slate-200 bg-white object-cover"
              />
              <div v-else class="flex h-10 w-10 items-center justify-center rounded-md bg-[#cdd0d5]/50 text-black/50">
                <i class="ri-folder-2-line text-lg"></i>
              </div>
              <div class="min-w-0">
                <p class="font-semibold capitalize text-black/90">{{ category.name }}</p>
                <p class="line-clamp-1 max-w-xs text-[10px] text-black/55">{{ category.description || 'No description' }}</p>
              </div>
            </div>
          </td>
          <td data-label="Parent" class="px-5 py-3 text-black/70">
            {{ category.parentId ? category.parentName || parentNames[category.parentId] || 'Unknown parent' : 'Top-level' }}
          </td>
          <td data-label="Slug" class="px-5 py-3 text-black/60">{{ category.slug }}</td>
          <td :data-label="isTrashView ? 'Deleted' : 'Status'" class="px-5 py-3">
            <template v-if="!isTrashView">
              <div class="w-22">
                <BaseDropdown
                  :model-value="category.status"
                  :options="statusOptions"
                  :disabled="mutationLoading"
                  @update:model-value="handleStatusChange(category, $event)"
                />
              </div>
            </template>
            <span v-else class="text-black/60">{{ formatDate(category.deletedAt ?? undefined) }}</span>
          </td>
          <td data-label="Created" class="px-5 py-3 text-black/70">{{ formatDate(category.createdAt) }}</td>
          <td data-label="Actions" class="px-5 py-3 text-right">
            <template v-if="isTrashView">
              <button
                type="button"
                :disabled="mutationLoading"
                class="rounded-md p-2 text-black/90 cursor-pointer disabled:opacity-50"
                title="Restore category"
                :aria-label="`Restore ${category.name}`"
                @click="emit('restore', category)"
              >
                <i class="ri-restart-line text-base"></i>
              </button>
              <button
                type="button"
                :disabled="mutationLoading"
                class="rounded-md p-2 text-red-600 cursor-pointer transition hover:text-red-700 disabled:opacity-50"
                title="Delete category permanently"
                :aria-label="`Delete ${category.name} permanently`"
                @click="emit('permanent-delete', category)"
              >
                <i class="ri-delete-bin-2-line text-base"></i>
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="rounded-md p-2 text-black/70 transition cursor-pointer hover:text-black"
                title="Edit category"
                :aria-label="`Edit ${category.name}`"
                @click="emit('edit', category)"
              >
                <i class="ri-edit-line text-base"></i>
              </button>
              <button
                type="button"
                :disabled="mutationLoading"
                class="rounded-md p-2 text-red-600 transition hover:text-shadow-red-700 cursor-pointer disabled:opacity-50"
                title="Move category to trash"
                :aria-label="`Delete ${category.name}`"
                @click="emit('delete', category)"
              >
                <i class="ri-delete-bin-line text-base"></i>
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  table {
    display: block;
    width: 100%;
    min-width: 0;
  }

  thead {
    display: none;
  }

  tbody {
    display: grid;
    gap: 0.75rem;
  }

  tbody > tr.mobile-list-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: visible;
    border: 1px solid rgb(148 163 184 / 0.35);
    border-radius: 0.5rem;
    background: rgb(255 255 255 / 0.55);
  }

  tbody > tr:not(.mobile-list-row) {
    display: block;
  }

  td {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem;
    overflow-wrap: anywhere;
  }

  tbody > tr:not(.mobile-list-row) > td {
    display: block;
  }

  td::before {
    color: rgb(15 23 42 / 0.6);
    content: attr(data-label);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  td:first-child,
  td:last-child {
    grid-column: 1 / -1;
  }

  td:last-child {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    text-align: left;
  }

  td:last-child::before {
    flex-basis: 100%;
  }
}
</style>
