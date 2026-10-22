import { ref, computed, type Ref } from 'vue';
import type { ISpecificationItem, IProduct } from '@/types/product';

interface FormState {
  name: Ref<string>;
  categoryId: Ref<string>;
  price: Ref<number | ''>;
  comparePrice: Ref<number | ''>;
  stock: Ref<number | ''>;
  description: Ref<string>;
  specifications: Ref<ISpecificationItem[]>;
  selectedFiles: Ref<File[]>;
  isEditMode: Ref<boolean>;
  productToEdit: Ref<IProduct | null | undefined>;
}

export function useProductFormValidation(state: FormState) {
  const fieldErrors = ref<Record<string, string>>({});
  const errorMessage = ref<string | null>(null);
  const initialSnapshot = ref<string>('');

  // Helper to serialize current form fields for comparison
  const getFormSnapshot = () => {
    const cleanSpecs = state.specifications.value.filter(
      (s) => s.key.trim() !== '' && s.value.trim() !== '',
    );
    return JSON.stringify({
      name: state.name.value.trim(),
      categoryId: state.categoryId.value,
      price: state.price.value !== '' ? Number(state.price.value) : '',
      comparePrice: state.comparePrice.value !== '' ? Number(state.comparePrice.value) : '',
      stock: state.stock.value !== '' ? Number(state.stock.value) : '',
      description: state.description.value.trim(),
      specifications: cleanSpecs,
    });
  };

  // Capture initial snapshot when modal opens or product changes
  const captureInitialSnapshot = () => {
    initialSnapshot.value = getFormSnapshot();
  };

  // Reactive Form Validation Check
  const isFormValid = computed(() => {
    if (!state.name.value.trim()) return false;
    if (!state.categoryId.value) return false;
    if (state.price.value === '' || Number(state.price.value) <= 0) return false;
    if (
      !state.comparePrice.value  &&
      !state.price.value  &&
      Number(state.comparePrice.value) <= Number(state.price.value)
    ) {
      return false;
    }
    if (
      state.stock.value === '' ||
      Number(state.stock.value) < 0 ||
      !Number.isInteger(Number(state.stock.value))
    ) {
      return false;
    }

    if (!state.isEditMode.value && state.selectedFiles.value.length === 0) {
      return false;
    }

    for (let i = 0; i < state.specifications.value.length; i++) {
      const spec = state.specifications.value[i];
      if ((spec?.key && !spec?.value) || (!spec?.key && spec?.value)) {
        return false;
      }
    }

    return true;
  });

  // Reactive Dirty Check for Edit Mode
  const isFormDirty = computed(() => {
    if (!state.isEditMode.value) return true;
    const isTextModified = getFormSnapshot() !== initialSnapshot.value;
    const hasNewImages = state.selectedFiles.value.length > 0;
    return isTextModified || hasNewImages;
  });

  // Explicit Validation Error Messages
  const validateForm = (): boolean => {
    fieldErrors.value = {};
    errorMessage.value = null;

    if (!state.name.value.trim()) {
      fieldErrors.value.name = 'Product name is required.';
    }
    if (!state.categoryId.value) {
      fieldErrors.value.categoryId = 'Please select a category.';
    }
    if (state.price.value === '' || Number(state.price.value) <= 0) {
      fieldErrors.value.price = 'Price must be greater than 0.';
    }
    if (
      state.comparePrice.value !== '' &&
      state.price.value !== '' &&
      Number(state.comparePrice.value) <= Number(state.price.value)
    ) {
      fieldErrors.value.comparePrice =
        'Compare price must be greater than regular price.';
    }
    if (
      state.stock.value === '' ||
      Number(state.stock.value) < 0 ||
      !Number.isInteger(Number(state.stock.value))
    ) {
      fieldErrors.value.stock = 'Stock must be a non-negative integer.';
    }

    if (!state.isEditMode.value && state.selectedFiles.value.length === 0) {
      fieldErrors.value.images = 'Please select at least one product image.';
    }

    for (let i = 0; i < state.specifications.value.length; i++) {
      const spec = state.specifications.value[i];
      if ((spec?.key && !spec?.value) || (!spec?.key && spec?.value)) {
        fieldErrors.value.specs = `Specification row #${i + 1} must have both key and value.`;
        break;
      }
    }

    return Object.keys(fieldErrors.value).length === 0;
  };

  const clearErrors = () => {
    fieldErrors.value = {};
    errorMessage.value = null;
  };

  return {
    fieldErrors,
    errorMessage,
    isFormValid,
    isFormDirty,
    validateForm,
    clearErrors,
    captureInitialSnapshot,
  };
}
