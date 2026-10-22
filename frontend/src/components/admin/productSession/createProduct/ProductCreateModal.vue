<script setup lang="ts">
  import { ref, computed, watch, toRef } from 'vue';
  import { useProductAdminStore } from '@/stores/adminProduct';
  import ProductCategorySelect from './ProductCategorySelect.vue';
  import ProductImagePicker from './ProductImagePicker.vue';
  import ProductSpecBuilder from './ProductSpecBuilder.vue';
  import type { ISpecificationItem, IProduct } from '@/types/product.ts';
  import { useAlert } from '@/composables/useAlert.ts';
  import { useProductFormValidation } from '@/composables/useProductFormValidation';

  const props = withDefaults(
    defineProps<{
      isOpen?: boolean;
      productToEdit?: IProduct | null;
    }>(),
    {
      isOpen: false,
      productToEdit: null,
    },
  );

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'saved'): void;
  }>();

  const productAdminStore = useProductAdminStore();
  const { showAlert } = useAlert();

  const isEditMode = computed(() => !!props.productToEdit?._id);

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
  const existingImages = ref<{ _id?: string; url: string; publicId: string }[]>([]);
  const isSubmitting = ref(false);

  // Plug in Validation Composable
  const {
    fieldErrors,
    errorMessage,
    isFormDirty,
    validateForm,
    clearErrors,
    captureInitialSnapshot,
  } = useProductFormValidation({
    name,
    categoryId,
    price,
    comparePrice,
    stock,
    description,
    specifications,
    selectedFiles,
    isEditMode,
    productToEdit: toRef(props, 'productToEdit'),
  });

  // Watch for changes in productToEdit or isOpen
  watch(
    () => [props.isOpen, props.productToEdit],
    () => {
      if (!props.isOpen) return;

      if (props.productToEdit) {
        const p = props.productToEdit;
        name.value = p.name || '';
        categoryId.value = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id || '';
        price.value = p.price ?? '';
        comparePrice.value = p.comparePrice ?? '';
        stock.value = p.stock ?? '';
        description.value = p.description || '';
        isPublished.value = p.status === 'active';
        
        specifications.value = p.specifications && p.specifications.length > 0 
          ? JSON.parse(JSON.stringify(p.specifications))
          : [{ key: '', value: '' }];

        existingImages.value = p.images ? [...p.images] : [];
        selectedFiles.value = [];
        previewUrls.value.forEach((url) => URL.revokeObjectURL(url));
        previewUrls.value = [];

        captureInitialSnapshot();
      } else {
        resetForm();
      }
    },
    { immediate: true },
  );

  const isSubmitDisabled = computed(() => {
    if (productAdminStore.createProductLoading || productAdminStore.updateProductLoading || isSubmitting.value) {
      return true;
    }
    if (isEditMode.value && !isFormDirty.value) return true;
    return false;
  });

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
    existingImages.value = [];
    clearErrors();
  };

  const handleClose = () => {
    resetForm();
    emit('close');
  };

  const handleRemoveExistingImage = async (publicId: string) => {
    if (!props.productToEdit?._id) return;
    
    if (existingImages.value.length <= 1 && selectedFiles.value.length === 0) {
      showAlert('Product must have at least one image', { type: 'error' });
      return;
    }

    const respone = await productAdminStore.removeProductImage(props.productToEdit._id, publicId);
    if (respone.success) {
      existingImages.value = existingImages.value.filter((img) => img.publicId !== publicId);
      captureInitialSnapshot();
      showAlert(respone.message, { type: 'success' });
    } else {
      showAlert(respone.message || 'Failed to remove image', { type: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    isSubmitting.value = true;

    const cleanSpecs = specifications.value.filter(
      (s) => s.key.trim() !== '' && s.value.trim() !== '',
    );

    try {
      if (isEditMode.value && props.productToEdit?._id) {
        const productId = props.productToEdit._id;

        const updateRes = await productAdminStore.updateProduct(productId, {
          name: name.value.trim(),
          categoryId: categoryId.value,
          price: Number(price.value),
          comparePrice: comparePrice.value !== '' ? Number(comparePrice.value) : undefined,
          stock: Number(stock.value || 0),
          description: description.value.trim(),
          specifications: cleanSpecs,
        });

        if (selectedFiles.value.length > 0) {
          await productAdminStore.uploadProductImages(productId, selectedFiles.value);
        }

        if (updateRes.success) {
          showAlert(updateRes.message || 'Product updated successfully', { type: 'success' });
          emit('saved');
          handleClose();
        } else {
          showAlert(updateRes.message || 'Failed to update product', { type: 'error' });
        }
      } else {
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
          emit('saved');
          handleClose();
          showAlert(result.message, { type: 'success' });
        } else {
          showAlert(result.message, { type: 'error' });
        }
      }
    } finally {
      isSubmitting.value = false;
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
          {{ isEditMode ? 'Edit Product' : 'Add New Product' }}
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

        <!-- Existing Images Display (EDIT MODE ONLY) -->
        <div v-if="isEditMode && existingImages.length > 0">
          <label class="block label dark:text-black/80 mb-1">
            Current Images
          </label>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="img in existingImages"
              :key="img.publicId"
              class="relative w-18 h-18 rounded border overflow-hidden group bg-gray-100"
            >
              <img :src="img.url" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="handleRemoveExistingImage(img.publicId)"
                class="absolute top-1 right-1 text-red-600 hover:text-red-700 bg-white/80 dark:bg-surface-800/80 hover:bg-red-500/10 hover:backdrop-blur-xs w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs border border-red-200/50 dark:border-red-500/30"
                title="Remove image from DB"
              >
                <i class="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Component: Product Image Picker (Adds New Files) -->
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

        <!-- Immediate Publish Checkbox (Only shown on creation) -->
        <div v-if="!isEditMode" class="flex items-center gap-2 pt-2 dark:border-surface-600">
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
          :disabled="isSubmitDisabled"
          class="flex items-center justify-center gap-1.5 w-full subCategory-button px-4 py-1.5 text-sm transition-all duration-150"
          :class="isSubmitDisabled ? 'opacity-50 cursor-not-allowed ' : 'cursor-pointer'"
        >
          <svg
            v-if="productAdminStore.createProductLoading || productAdminStore.updateProductLoading || isSubmitting"
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
          {{ isEditMode ? 'Update Product' : 'Create Product' }}
        </button>
      </div>
    </div>
  </div>
</template>
