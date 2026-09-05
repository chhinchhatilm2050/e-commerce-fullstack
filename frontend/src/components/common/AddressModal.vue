<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { CAMBODIA_LOCATIONS, type IDistrict, type ICommune } from '@/data/cambodiaLocations';

  export interface AddressData {
    fullName: string;
    phone: string;
    provinceId: string;
    districtId: string;
    communeId: string;
    streetAddress: string;
  }

  const props = defineProps<{
    isOpen: boolean;
    initialData?: AddressData | null;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', address: AddressData): void;
    (e: 'delete'): void;
  }>();

  const isConfirmingDelete = ref(false);

  const form = ref<AddressData>({
    fullName: '',
    phone: '',
    provinceId: '',
    districtId: '',
    communeId: '',
    streetAddress: '',
  });

  // Sync form data when editing or opening
  watch(
    () => props.initialData,
    (newData) => {
      if (newData) {
        form.value = { ...newData };
      } else {
        form.value = {
          fullName: '',
          phone: '',
          provinceId: '',
          districtId: '',
          communeId: '',
          streetAddress: '',
        };
      }
    },
    { immediate: true },
  );

  // Cascading selectors logic
  const availableDistricts = computed<IDistrict[]>(() => {
    const province = CAMBODIA_LOCATIONS.find((p) => p.id === form.value.provinceId);
    return province ? province.districts : [];
  });

  const availableCommunes = computed<ICommune[]>(() => {
    const district = availableDistricts.value.find((d) => d.id === form.value.districtId);
    return district ? district.communes : [];
  });

  const onProvinceChange = () => {
    form.value.districtId = '';
    form.value.communeId = '';
  };

  const onDistrictChange = () => {
    form.value.communeId = '';
  };

  const handleSave = () => {
    if (!form.value.fullName || !form.value.phone || !form.value.provinceId) {
      return;
    }
    emit('save', { ...form.value });
    emit('close');
  };

  const handleDelete = () => {
    emit('delete');
    isConfirmingDelete.value = false;
    emit('close');
  };
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
  >
    <!-- Delete Confirmation Popup -->
    <div v-if="isConfirmingDelete" class="bg-white rounded-lg p-6 w-full max-w-sm space-y-4 text-center">
      <h3 class="text-lg font-bold text-gray-900">Delete Address?</h3>
      <p class="text-sm text-gray-600">Are you sure you want to remove this delivery address?</p>
      <div class="flex justify-center gap-3 pt-2">
        <button 
          @click="isConfirmingDelete = false" 
          class="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="handleDelete" 
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Main Address Form Popup -->
    <div v-else class="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900">
          {{ initialData ? 'Edit Shipping Address' : 'Add Delivery Address' }}
        </h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </div>

      <!-- Full Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Full Name</label>
        <input 
          v-model="form.fullName" 
          type="text" 
          placeholder="Enter full name"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <!-- Phone Number -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Phone Number</label>
        <input 
          v-model="form.phone" 
          type="text" 
          placeholder="Enter phone number"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <!-- Province Dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Province / Capital</label>
        <select 
          v-model="form.provinceId" 
          @change="onProvinceChange" 
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="" disabled>Select Province</option>
          <option v-for="prov in CAMBODIA_LOCATIONS" :key="prov.id" :value="prov.id">
            {{ prov.name }} ({{ prov.nameKh }})
          </option>
        </select>
      </div>

      <!-- District Dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700">District / Khan</label>
        <select 
          v-model="form.districtId" 
          @change="onDistrictChange" 
          :disabled="!form.provinceId"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        >
          <option value="" disabled>
            {{ form.provinceId ? 'Select District' : 'Select province first' }}
          </option>
          <option v-for="dist in availableDistricts" :key="dist.id" :value="dist.id">
            {{ dist.name }} ({{ dist.nameKh }})
          </option>
        </select>
      </div>

      <!-- Commune Dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Commune / Sangkat</label>
        <select 
          v-model="form.communeId" 
          :disabled="!form.districtId"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        >
          <option value="" disabled>
            {{ form.districtId ? 'Select Commune' : 'Select district first' }}
          </option>
          <option v-for="com in availableCommunes" :key="com.id" :value="com.id">
            {{ com.name }} ({{ com.nameKh }})
          </option>
        </select>
      </div>

      <!-- Street / House Address -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Street Address / House No.</label>
        <input 
          v-model="form.streetAddress" 
          type="text" 
          placeholder="House/Street info"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center pt-2">
        <div>
          <button 
            v-if="initialData" 
            @click="isConfirmingDelete = true" 
            class="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
        <div class="flex gap-2">
          <button 
            @click="emit('close')" 
            class="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="handleSave" 
            class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

