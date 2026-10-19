<script setup lang="ts">
  import { ref } from 'vue';
  import { useProductAdminStore } from '@/stores/adminProduct';
  import ProductCategorySelect from './ProductCategorySelect.vue';
  import ProductImagePicker from './ProductImagePicker.vue';
  import ProductSpecBuilder from './ProductSpecBuilder.vue';
  import type { ISpecificationItem } from '@/types/product.ts';
  import { useAlert } from '@/composables/useAlert.ts';

  withDefaults(
    defineProps<{
      isOpen?: boolean;
    }>(),
    {
      isOpen: false,
    },
  );

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'created'): void;
  }>();

  const productAdminStore = useProductAdminStore();
  const { showAlert } = useAlert();

  // Form Data State
  const name = ref('');
  const categoryId = ref('');
  const price = ref<number | ''>('');
  const comparePrice = ref<number | ''>('');
  const stock = ref<number | ''>('');
  const description = ref('');
  const isPublished = ref(false);

  // Sub-Component States
  const specifications = ref<ISpecificationItem[]>([{ key: '', value: '' }]);
  const selectedFiles = ref<File[]>([]);
  const previewUrls = ref<string[]>([]);

  // UI & Validation State
  const errorMessage = ref<string | null>(null);
  const fieldErrors = ref<Record<string, string>>({});

  // Form Validation
  const validateForm = (): boolean => {
    fieldErrors.value = {};
    errorMessage.value = null;

    if (!name.value.trim()) {
      fieldErrors.value.name = 'Product name is required.';
    }
    if (!categoryId.value) {
      fieldErrors.value.categoryId = 'Please select a category.';
    }
    if (price.value === '' || Number(price.value) <= 0) {
      fieldErrors.value.price = 'Price must be greater than 0.';
    }
    if (
      comparePrice.value !== '' &&
      price.value !== '' &&
      Number(comparePrice.value) <= Number(price.value)
    ) {
      fieldErrors.value.comparePrice =
        'Compare price must be greater than regular price.';
    }
    if (
      stock.value === '' ||
      Number(stock.value) < 0 ||
      !Number.isInteger(Number(stock.value))
    ) {
      fieldErrors.value.stock = 'Stock must be a non-negative integer.';
    }
    if (selectedFiles.value.length === 0) {
      fieldErrors.value.images = 'Please select at least one product image.';
    }

    for (let i = 0; i < specifications.value.length; i++) {
      const spec = specifications.value[i];
      if ((spec?.key && !spec?.value) || (!spec?.key && spec?.value)) {
        fieldErrors.value.specs = `Specification row #${i + 1} must have both key and value.`;
        break;
      }
    }

    return Object.keys(fieldErrors.value).length === 0;
  };

  // Reset Form State
  const resetForm = () => {
    name.value = '';
    categoryId.value = '';
    price.value = '';
    comparePrice.value = '';
    stock.value = '';
    description.value = '';
    isPublished.value = false;
    specifications.value = [{ key: '', value: '' }];
    previewUrls.value.forEach((url) => URL.revokeObjectURL(url));
    selectedFiles.value = [];
    previewUrls.value = [];
    errorMessage.value = null;
    fieldErrors.value = {};
  };

  const handleClose = () => {
    resetForm();
    emit('close');
  };

  const handleSubmit = async() => {
    if (!validateForm()) return;
    errorMessage.value = null;

    const cleanSpecs = specifications.value.filter(
      (s) => s.key.trim() !== '' && s.value.trim() !== '',
    );

    const result = await productAdminStore.crateProduct({
      name: name.value.trim(),
      categoryId: categoryId.value,
      price: Number(price.value), 
      comparePrice: comparePrice.value !== '' ? Number(comparePrice.value) : undefined,
      stock: Number(stock.value || 0),
      description: description.value.trim(),
      status: isPublished.value ? 'active' : 'draft',
      specifications: cleanSpecs,
      images: selectedFiles.value,
    });

    if (result.success) {
      emit('created');
      handleClose();
      showAlert(result.message, { type: 'success' });
    } else {
      emit('created');
      handleClose();
      showAlert(result.message, { type: 'error' });
    }
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };
</script>

<template>
  <div
    v-if="isOpen"
    @click="handleBackdropClick"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <!-- Modal Card (Fixed Height Container) -->
    <div
      class="w-full animate-slide-up max-w-xl rounded-lg bg-white shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
    >
      <!-- FIXED HEADER -->
      <div
        class="flex items-center justify-between p-6 pt-4 pb-4 border-b border-gray-200 bg-[#cdd0d5]/70 dark:border-surface-600 shrink-0"
      >
        <h3 class="text-base font-semibold text-gray-900">
          Add New Product
        </h3>
        <button
          type="button"
          @click="handleClose"
          class="text-black/50 bg-[#cdd0d5]/70 rounded-md hover:text-slate-600 transition p-1 cursor-pointer"
        >
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>

      <!-- Error Banner -->
      <div
        v-if="errorMessage"
        class="mx-6 mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 shrink-0"
      >
        {{ errorMessage }}
      </div>

      <!-- SCROLLABLE FORM BODY -->
      <div class="flex-1 overflow-y-auto p-6 pt-3 space-y-4 text-xs">
        <!-- Product Name -->
        <div>
          <label class="label dark:text-black/80">
            Product Name <span class="text-red-600">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Enter product name"
            class="product-input"
            :class="{ 'border-red-500': fieldErrors.name }"
          />
          <p v-if="fieldErrors.name" class="mt-1 text-[11px] text-red-600">
            {{ fieldErrors.name }}
          </p>
        </div>

        <!-- Price & Compare Price -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block label dark:text-black/80">
              Price ($) <span class="text-red-600">*</span>
            </label>
            <input
              v-model.number="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="product-input"
              :class="{ 'border-red-500': fieldErrors.price }"
            />
            <p v-if="fieldErrors.price" class="mt-1 text-[11px] text-red-600">
              {{ fieldErrors.price }}
            </p>
          </div>
          <div>
            <label class="block label dark:text-black/80">
              Compare Price ($)
            </label>
            <input
              v-model.number="comparePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="product-input"
              :class="{ 'border-red-500': fieldErrors.comparePrice }"
            />
            <p v-if="fieldErrors.comparePrice" class="mt-1 text-[11px] text-red-600">
              {{ fieldErrors.comparePrice }}
            </p>
          </div>
        </div>

        <!-- Stock & Category Sub-Component -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block label dark:text-black/80">
              Stock Quantity <span class="text-red-600">*</span>
            </label>
            <input
              v-model.number="stock"
              type="number"
              min="0"
              placeholder="0"
              class="product-input"
              :class="{ 'border-red-500': fieldErrors.stock }"
            />
            <p v-if="fieldErrors.stock" class="mt-1 text-[11px] text-red-600">
              {{ fieldErrors.stock }}
            </p>
          </div>

          <!-- Component: Category Tree Select -->
          <ProductCategorySelect
            v-model="categoryId"
            :error="fieldErrors.categoryId"
          />
        </div>

        <!-- Component: Product Image Picker -->
        <ProductImagePicker
          v-model:files="selectedFiles"
          v-model:previews="previewUrls"
          :error="fieldErrors.images"
          @clear-error="delete fieldErrors.images"
        />

        <!-- Description -->
        <div>
          <label class="block label dark:text-black/80">
            Description
          </label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Product description..."
            class="product-input"
          ></textarea>
        </div>

        <!-- Component: Dynamic Specifications Builder -->
        <ProductSpecBuilder
          v-model="specifications"
          :error="fieldErrors.specs"
        />

        <!-- Immediate Publish Checkbox -->
        <div class="flex items-center gap-2 pt-2 dark:border-surface-600">
          <input
            id="publishCheck"
            v-model="isPublished"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-black"
          />
          <label
            for="publishCheck"
            class="font-medium dark:text-black/80 cursor-pointer"
          >
            Publish product immediately (uncheck to save as Draft)
          </label>
        </div>
      </div>

      <!-- FIXED FOOTER -->
      <div
        class="flex justify-end gap-3 px-6 py-4 border-slate-200 dark:border-surface-700 bg-[#cdd0d5]/70 shrink-0"
      >
        <button
          type="button"
          @click="handleClose"
          class="subCategory-button w-full px-4 py-1.5 bg-white dark:bg-white/50 border border-black/10 text-red-600 text-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="productAdminStore.createProductLoading"
          class="flex items-center gap-1.5 w-full subCategory-button cursor-pointer px-4 py-1.5 text-sm"
        >
         <svg
              v-if="productAdminStore.createProductLoading"
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          {{ productAdminStore.createProductLoading ? 'Creating...' : 'Create Product' }}
        </button>
      </div>
    </div>
  </div>
</template>
