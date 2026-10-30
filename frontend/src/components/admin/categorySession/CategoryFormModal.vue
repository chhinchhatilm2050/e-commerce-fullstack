<script setup lang="ts">
  import { ref, watch } from 'vue';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import CategorySelect from '@/components/admin/productSession/CategorySelect.vue';
  import type { ICategory } from '@/types/category';

  interface ParentOption {
    _id: string;
    name: string;
    level: number;
  }

  interface CategoryFormPayload {
    name: string;
    description: string;
    status: ICategory['status'];
    parentId: string | null;
    image: File | null;
  }

  const props = defineProps<{
    isOpen: boolean;
    category: ICategory | null;
    parentOptions: ParentOption[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'submit', payload: CategoryFormPayload): void;
  }>();

  const name = ref('');
  const description = ref('');
  const status = ref<ICategory['status']>('active');
  const parentId = ref('');
  const image = ref<File | null>(null);
  const imagePreview = ref('');
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  watch(
    () => [props.isOpen, props.category] as const,
    ([isOpen, category]) => {
      if (!isOpen) return;
      name.value = category?.name ?? '';
      description.value = category?.description ?? '';
      status.value = category?.status ?? 'active';
      parentId.value = category?.parentId ?? '';
      image.value = null;
      imagePreview.value = category?.image ?? '';
    },
    { immediate: true },
  );

  const handleImageChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    image.value = file;
    imagePreview.value = file ? URL.createObjectURL(file) : (props.category?.image ?? '');
  };

  const handleSubmit = () => {
    emit('submit', {
      name: name.value.trim(),
      description: description.value.trim(),
      status: status.value,
      parentId: parentId.value || null,
      image: image.value,
    });
  };
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="presentation"
    @click.self="emit('close')"
  >
    <section
      class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-form-title"
    >
      <header class="flex items-center justify-between border-b border-slate-200 bg-[#cdd0d5]/70 px-6 py-4">
        <div>
          <h2 id="category-form-title" class="text-base font-bold text-black/90">
            {{ category ? 'Edit Category' : 'Create Category' }}
          </h2>
          <p class="mt-0.5 text-xs text-black/60">Manage category details and hierarchy.</p>
        </div>
        <button type="button" aria-label="Close" class="rounded-md cursor-pointer p-1 text-black/60 bg-white/70" @click="emit('close')">
          <i class="ri-close-line text-xl"></i>
        </button>
      </header>

      <form class="space-y-4 overflow-y-auto p-6" @submit.prevent="handleSubmit">
        <div>
          <label for="category-name" class="mb-1 block text-xs font-medium text-black/80">Name</label>
          <input
            id="category-name"
            v-model="name"
            required
            minlength="2"
            maxlength="50"
            class="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-black/90 focus:outline-none focus:ring-1 focus:ring-[#9ca3af]"
            placeholder="e.g. Accessories"
          />
        </div>

        <div>
          <label for="category-parent" class="mb-1 block text-xs font-medium text-black/80">Parent category</label>
          <CategorySelect
            v-model="parentId"
            :categories="parentOptions"
            placeholder="Top-level category"
            full-width
          />
          <p v-if="category" class="mt-1 text-[11px] text-black/50">Changing the parent moves this category and its subcategories.</p>
        </div>

        <div>
          <label for="category-description" class="mb-1 block text-xs font-medium text-black/80">Description</label>
          <textarea
            id="category-description"
            v-model="description"
            rows="3"
            maxlength="500"
            class="w-full resize-y rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-black/90 focus:outline-none focus:ring-1 focus:ring-[#9ca3af]"
            placeholder="Optional description"
          ></textarea>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="category-status" class="mb-1 block text-xs font-medium text-black/80">Status</label>
            <BaseDropdown
              v-model="status"
              :options="statusOptions"
            />
          </div>
          <div>
            <label for="category-image" class="mb-1 block text-xs font-medium text-black/80">Image</label>
            <input id="category-image" type="file" accept="image/*" class="w-full text-xs cursor-pointer text-black/70" @change="handleImageChange" />
          </div>
        </div>

        <div v-if="imagePreview" class="flex items-center gap-3 rounded-md bg-[#cdd0d5]/30 p-3">
          <img :src="imagePreview" alt="Category preview" class="h-14 w-14 rounded-md bg-white object-cover" />
          <span class="text-xs text-black/60">{{ image?.name ?? 'Current category image' }}</span>
        </div>

        <footer class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-black/70 hover:bg-slate-50" :disabled="loading" @click="emit('close')">
            Cancel
          </button>
          <button type="submit" class="inline-flex items-center gap-2 rounded-md bg-[#33363b] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50" :disabled="loading">
            <i v-if="loading" class="ri-loader-4-line animate-spin"></i>
            {{ loading ? 'Saving...' : category ? 'Save Changes' : 'Create Category' }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>
