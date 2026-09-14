<script setup lang="ts">
  import { ref, computed, watch, watchEffect, onUnmounted } from 'vue';
  import { CAMBODIA_LOCATIONS, type IDistrict, type ICommune } from '@/data/cambodiaLocations';
  import BaseDropdown from '@/components/common/BaseDropdown.vue';
  import { useAddressStore } from '@/stores/address';

  const addressStore = useAddressStore();

  interface DropdownOption {
    value: string;
    label: string;
  }

  export interface AddressData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    provinceId: string;
    districtId: string;
    communeId: string;
    streetAddress: string;
  }

  const props = defineProps<{
    isOpen: boolean;
    initialData?: AddressData | null;
    isDeleteOpen: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', address: AddressData): void;
    (e: 'delete'): void;
  }>();

  const isConfirmingDelete = ref(false);

  const form = ref<AddressData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    provinceId: '',
    districtId: '',
    communeId: '',
    streetAddress: '',
  });

  watchEffect(() => {
    if (props.isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      isConfirmingDelete.value = false;
    }
  });

  onUnmounted(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      emit('close');
    }
  };

  watch(
    () => props.initialData,
    (newData) => {
      if (newData) {
        form.value = { ...newData };
      } else {
        form.value = {
          firstName: '',
          lastName: '',
          phoneNumber: '',
          provinceId: '',
          districtId: '',
          communeId: '',
          streetAddress: '',
        };
      }
    },
    { immediate: true, deep: true },
  );

  const provinceOptions = computed<DropdownOption[]>(() =>
    CAMBODIA_LOCATIONS.map((prov) => ({
      value: prov.id,
      label: `${prov.name} (${prov.nameKh})`,
    })),
  );

  const availableDistricts = computed<IDistrict[]>(() => {
    const province = CAMBODIA_LOCATIONS.find((p) => p.id === form.value.provinceId);
    return province ? province.districts : [];
  });

  const districtOptions = computed<DropdownOption[]>(() =>
    availableDistricts.value.map((dist) => ({
      value: dist.id,
      label: `${dist.name} (${dist.nameKh})`,
    })),
  );

  const availableCommunes = computed<ICommune[]>(() => {
    const district = availableDistricts.value.find((d) => d.id === form.value.districtId);
    return district ? district.communes : [];
  });

  const communeOptions = computed<DropdownOption[]>(() =>
    availableCommunes.value.map((com) => ({
      value: com.id,
      label: `${com.name} (${com.nameKh})`,
    })),
  );

  watch(
    () => form.value.provinceId,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        form.value.districtId = '';
        form.value.communeId = '';
      }
    },
  );

  watch(
    () => form.value.districtId,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        form.value.communeId = '';
      }
    },
  );

  const isFormValid = computed(() => {
    return (
      form.value.firstName.trim() !== '' &&
      form.value.lastName.trim() !== '' &&
      form.value.phoneNumber.trim() !== '' &&
      form.value.provinceId !== '' &&
      form.value.districtId !== '' &&
      form.value.communeId !== '' &&
      form.value.streetAddress.trim() !== ''
    );
  });

  const handleSave = () => {
    if (!isFormValid.value || addressStore.loading) return;
    emit('save', { ...form.value });
  };
  const handleDelete = () => {
    emit('delete');
  };
</script>

<template>
  <div 
    v-if="isOpen" 
    @click="handleBackdropClick"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="animate-slide-up w-full flex flex-col items-center justify-center pointer-events-auto">
      <!-- In AddressModal.vue -->
      <div v-if="props.isDeleteOpen" class="bg-white dark:bg-surface-800 rounded-lg p-6 w-full max-w-sm space-y-4 text-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Are you sure you want to delete this address?</h3>
        <div class="flex justify-center gap-3 pt-2">
          <!-- Emits close event so parent resets both isModalOpen and deleteOpen -->
          <button @click="emit('close')" class="w-full subCategory-button px-4 py-1.5 bg-white border border-black/10 text-red-600 text-sm">
            Cancel
          </button>
          <button @click="handleDelete" class="w-full subCategory-button px-4 py-1.5 text-sm">
            Delete
          </button>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-surface-800 rounded-lg p-7 w-full max-w-lg space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ initialData?.firstName ? 'Edit Address' : 'Add Address' }}
          </h3>
          <button @click="emit('close')" class="text-black/80 cursor-pointer hover:text-gray-600 text-2xl"> 
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div class="flex gap-2">
          <div class="animate-slide-up">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name <span class="text-red-600">*</span></label>
            <input
              v-model="form.lastName"
              type="text"
              placeholder="Enter first name"
              class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-surface-900 text-gray-900 dark:text-gray-100 outline-none text-sm"
            />
          </div>
          <div class="animate-slide-up">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name<span class="text-red-600">*</span></label>
            <input
              v-model="form.firstName"
              type="text"
              placeholder="Enter last name"
              class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-surface-900 text-gray-900 dark:text-gray-100 outline-none text-sm"
            />
          </div>
        </div>

        <div class="animate-slide-up">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile phone<span class="text-red-600">*</span></label>
          <input
            v-model="form.phoneNumber"
            type="text"
            placeholder="Enter phone number"
            class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-surface-900 text-gray-900 dark:text-gray-100 outline-none text-sm"
          />
        </div>

        <div class="animate-slide-up">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province / Capital<span class="text-red-600">*</span></label>
          <BaseDropdown
            v-model="form.provinceId"
            :options="provinceOptions"
            placeholder="Select Province"
          />
        </div>

        <div class="animate-slide-up">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District / Khan<span class="text-red-600">*</span></label>
          <BaseDropdown
            v-model="form.districtId"
            :options="districtOptions"
            :placeholder="form.provinceId ? 'Select District' : 'Select province first'"
          />
        </div>

        <div class="animate-slide-up">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commune / Sangkat<span class="text-red-600">*</span></label>
          <BaseDropdown
            v-model="form.communeId"
            :options="communeOptions"
            :placeholder="form.districtId ? 'Select Commune' : 'Select district first'"
          />
        </div>
        <div class="animate-slide-up">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address / House No.<span class="text-red-600">*</span></label>
          <input
            v-model="form.streetAddress"
            type="text"
            placeholder="House/Street info"
            class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-surface-900 text-gray-900 dark:text-gray-100 outline-none text-sm"
          />
        </div>

        <div class="animate-slide-up flex justify-center gap-4 items-center pt-2 w-full">
    
        <div class="flex-1">
          <button 
            @click="handleSave" 
            class="subCategory-button px-4 flex items-center justify-center gap-2 w-full py-1.5 text-md" 
            :disabled="!isFormValid || addressStore.loading"
          >
            <svg
              v-if="addressStore.loading"
              class="w-3 h-3 animate-spin"
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
            {{ addressStore.loading ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

