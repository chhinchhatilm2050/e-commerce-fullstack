<script setup lang="ts">
  import { useUserStore } from '@/stores/userStore.js';
  import { onMounted, reactive, ref } from 'vue';
  import { useAlert } from '@/composables/useAlert.js';
  import type { UpdateProfileRequest } from '@/types/user.js';

  interface FormErrors {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    gender?: string;
  }

  const emit = defineEmits<{ (e: 'close'): void }>();

  const errors = reactive<FormErrors>({});
  const userStore = useUserStore();
  const { showAlert } = useAlert();

  // Avatar Upload States
  const fileInput = ref<HTMLInputElement | null>(null);
  const previewUrl = ref<string | null>(null);
  const isUploadingAvatar = ref<boolean>(false);

  const phoneRegex: RegExp = /^(\+855|0)[1-9]\d{7,8}$/;
  const nameRegex: RegExp = /^[a-zA-Z\s]+$/;

  const updateProfile = reactive<UpdateProfileRequest>({
    gender: null,
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  onMounted(async () => {
    await userStore.fetchProfile();
    updateProfile.gender =
      (userStore.currentUser?.gender as 'male' | 'female' | 'other' | null) ??
      null;
    updateProfile.firstName = userStore.currentUser?.firstName ?? '';
    updateProfile.lastName = userStore.currentUser?.lastName ?? '';
    updateProfile.phoneNumber = userStore.currentUser?.phoneNumber ?? '';
  });

  // Trigger file input dialog
  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  // Immediately upload avatar when an image is selected
  const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || !target.files[0]) return;

    const file = target.files[0];

    // Image Validations
    if (!file.type.startsWith('image/')) {
      showAlert('Please select a valid image file', { type: 'error' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showAlert('Image size must be less than 2MB', { type: 'error' });
      return;
    }

    // Temporary local preview
    previewUrl.value = URL.createObjectURL(file);
    isUploadingAvatar.value = true;

    // Upload avatar directly to backend
    const avatarResult = await userStore.uploadAvatar(file);

    isUploadingAvatar.value = false;

    if (avatarResult.success) {
      showAlert(avatarResult.message || 'Avatar updated successfully!', { type: 'success' });
    } else {
      showAlert(avatarResult.message || 'Failed to upload avatar', { type: 'error' });
      previewUrl.value = null; // Reset preview on error
    }

    // Clear input so user can choose the same file again if needed
    if (fileInput.value) fileInput.value.value = '';
  };

  // Handle text-only profile updates
  const handleUpdateProfie = async (): Promise<void> => {
    (Object.keys(errors) as (keyof FormErrors)[]).forEach(
      (e) => delete errors[e],
    );

    let valid: boolean = true;
    if (!updateProfile.gender) {
      errors.gender = 'Gender is required';
      valid = false;
    }
    if (!updateProfile.firstName) {
      errors.firstName = 'First name is required';
      valid = false;
    } else if (!nameRegex.test(updateProfile.firstName)) {
      errors.firstName = 'First name can only contain letters';
      valid = false;
    } else if (
      updateProfile.firstName.length < 2 ||
      updateProfile.firstName.length > 30
    ) {
      errors.firstName = 'First name can be 2-30 characters';
      valid = false;
    }
    if (!updateProfile.lastName) {
      errors.lastName = 'Last name is required';
      valid = false;
    } else if (!nameRegex.test(updateProfile.lastName)) {
      errors.lastName = 'Last name can only contain letters';
      valid = false;
    } else if (
      updateProfile.lastName.length < 2 ||
      updateProfile.lastName.length > 30
    ) {
      errors.lastName = 'Last name can be 2-30 characters';
      valid = false;
    }
    if (!updateProfile.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone is required';
      valid = false;
    } else if (!phoneRegex.test(updateProfile.phoneNumber)) {
      errors.phoneNumber =
        'Invalid phone number. (e.g., 012345678 or +85512345678)';
      valid = false;
    }

    if (!valid) return;

    // Submit profile text fields
    const result = await userStore.updateMyProfile(updateProfile);
    showAlert(result.message || 'Profile updated successfully!', { type: 'success' });
    emit('close');
  };
</script>

<template>
  <hr class="border-gray-100 dark:border-surface-100 my-1" />
  <div class="relative w-full max-w-md animate-slide-up">
    <p
      v-if="userStore.userError"
      class="default-button cursor-default bg-red-50 w-full text-sm text-red-700 text-center"
    >
      {{ userStore.userError }}
    </p>

    <!-- Avatar Upload Section -->
    <div class="flex flex-col items-center justify-center my-4">
      <!-- Hidden Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- Avatar Container -->
      <div class="relative w-24 h-24">
        <!-- Main Avatar Image Frame -->
        <div class="w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-md bg-black/10 dark:bg-surface-700 flex items-center justify-center">
          <img
            v-if="previewUrl || userStore.currentUser?.avatar"
            :src="previewUrl || (userStore.currentUser?.avatar as string)"
            alt="Avatar"
            class="w-full h-full object-cover"
            :class="{ 'opacity-50': isUploadingAvatar }"
          />
          <i v-else class="ri-user-fill text-5xl text-black/60"></i>

          <!-- Avatar Loading Overlay -->
          <div v-if="isUploadingAvatar" class="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20">
            <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>

        <!-- Floating Camera Button Badge (Bottom-Right) -->
        <button
          type="button"
          @click="triggerFileInput"
          :disabled="isUploadingAvatar"
          class="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 border border-gray-100 dark:border-surface-600 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
        >
          <i class="ri-camera-switch-line text-lg text-black/60"></i>
        </button>
      </div>
    </div>

    <form @submit.prevent="handleUpdateProfie" class="space-y-4 mt-6">
      <div>
        <div class="flex gap-3">
          <label class="label">{{ $t("register.gender") }}</label>
          <div class="flex gap-4 items-center justify-center">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                value="male"
                v-model="updateProfile.gender"
                class="cursor-pointer w-4 h-4 accent-black dark:accent-white"
              />
              <span class="text-sm text-black dark:text-gray-200">{{
                $t("register.male")
              }}</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                value="female"
                v-model="updateProfile.gender"
                class="cursor-pointer w-4 h-4 accent-black dark:accent-white"
              />
              <span class="text-sm text-black dark:text-gray-200">{{
                $t("register.female")
              }}</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                value="other"
                v-model="updateProfile.gender"
                class="cursor-pointer w-4 h-4 accent-black dark:accent-white"
              />
              <span class="text-sm text-black dark:text-gray-200">{{
                $t("register.other")
              }}</span>
            </label>
          </div>
        </div>
        <p v-if="errors.gender" class="error-msg">{{ errors.gender }}</p>
      </div>

      <div>
        <div>
          <label class="label">{{ $t("register.firstName") }}</label>
          <input
            type="text"
            class="input"
            v-model="updateProfile.firstName"
            :placeholder="$t('register.enterFirstName')"
            :class="{ 'input-error': errors.firstName }"
            autocomplete="name"
          />
          <p v-if="errors.firstName" class="error-msg">
            {{ errors.firstName }}
          </p>
        </div>
        <div class="mt-3">
          <label class="label">{{ $t("register.lastName") }}</label>
          <input
            type="text"
            class="input"
            v-model="updateProfile.lastName"
            :placeholder="$t('register.enterlastName')"
            :class="{ 'input-error': errors.lastName }"
            autocomplete="name"
          />
          <p v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</p>
        </div>
      </div>

      <div>
        <label class="label">{{ $t("register.phoneNumber") }}</label>
        <input
          type="text"
          class="input"
          v-model="updateProfile.phoneNumber"
          :placeholder="$t('register.enterPhoneNumber')"
          :class="{ 'input-error': errors.phoneNumber }"
        />
        <p v-if="errors.phoneNumber" class="error-msg">
          {{ errors.phoneNumber }}
        </p>
      </div>

      <button
        type="submit"
        class="default-button font-medium w-full py-2 text-base flex items-center justify-center gap-2 mt-2"
      >
        <svg
          v-if="userStore.loading"
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
        {{ userStore.loading ? "Updating profile..." : "Update" }}
      </button>
    </form>
  </div>
</template>
