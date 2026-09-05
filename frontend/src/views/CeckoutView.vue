<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { CAMBODIA_LOCATIONS } from '@/data/cambodiaLocations';
  import AddressModal from '@/components/common/AddressModal.vue';
  import type { AddressData } from '@/components/common/AddressModal.vue';

  // Simulated logged-in user profile
  const currentUser = ref({
    fullName: 'John Doe',
    phone: '012345678',
  });

  // Saved address state (null by default)
  const activeAddress = ref<AddressData | null>(null);

  // Modal state
  const isModalOpen = ref(false);

  // Address data passed to the modal
  const modalInitialData = computed<AddressData | null>(() => {
    if (activeAddress.value) {
      return activeAddress.value;
    }
    // If no saved address, pre-fill user profile info
    return {
      fullName: currentUser.value.fullName,
      phone: currentUser.value.phone,
      provinceId: '',
      districtId: '',
      communeId: '',
      streetAddress: '',
    };
  });

  // Format IDs to full display string
  const formattedAddressString = computed(() => {
    if (!activeAddress.value) return '';

    const { provinceId, districtId, communeId } = activeAddress.value;
    const province = CAMBODIA_LOCATIONS.find((p) => p.id === provinceId);
    const district = province?.districts.find((d) => d.id === districtId);
    const commune = district?.communes.find((c) => c.id === communeId);

    const parts = ['Cambodia'];
    if (province) parts.push(`${province.name}, ${province.nameKh}`);
    if (district) parts.push(`${district.name}, ${district.nameKh}`);
    if (commune) parts.push(`${commune.name}, ${commune.nameKh}`);

    return parts.join(' / ');
  });

  const handleSaveAddress = (newAddress: AddressData) => {
    activeAddress.value = newAddress;
  };

  const handleDeleteAddress = () => {
    activeAddress.value = null;
  };
</script>

<template>
    <RouterLink to="/" class="cursor-pointer flex items-center justify-center mt-3" >
        <img
        class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] block dark:hidden"
        src="../assets/image/torilogo.png"
        alt=""
        />
        <img
        class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] hidden dark:block"
        src="../assets/image/torilogowhite.png"
        alt=""
        />
    </RouterLink>
  <div class="max-w-xl mx-auto p-4 mt-8">
    <h2 class="text-lg font-bold mb-3">Shipping Address</h2>

    <!-- State 1: Active Saved Address (Matches Zando style) -->
    <div 
      v-if="activeAddress" 
      class="bg-gray-100 p-4 rounded-md flex justify-between items-start"
    >
      <div class="space-y-1 text-sm text-gray-800">
        <p class="font-bold text-base">{{ activeAddress.fullName }}</p>
        <p class="text-gray-600">{{ formattedAddressString }}</p>
        <p class="text-gray-600">Tel : {{ activeAddress.phone }}</p>
        <p class="text-gray-600" v-if="activeAddress.streetAddress">
          {{ activeAddress.streetAddress }}
        </p>
      </div>

      <button 
        @click="isModalOpen = true" 
        class="text-sm font-semibold text-gray-700 hover:underline flex items-center gap-1"
      >
        Change &gt;
      </button>
    </div>

    <!-- State 2: No Address Present -->
    <div 
      v-else 
      class="border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-gray-50 space-y-3"
    >
      <p class="text-gray-600 text-sm">No delivery address selected yet.</p>
      <button 
        @click="isModalOpen = true" 
        class="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
      >
        + Add Address
      </button>
    </div>

    <!-- Reusable Modal Component -->
    <AddressModal 
      :is-open="isModalOpen"
      :initial-data="modalInitialData"
      @close="isModalOpen = false"
      @save="handleSaveAddress"
      @delete="handleDeleteAddress"
    />
  </div>
</template>
