<script setup lang="ts">
  import { useUserStore } from '@/stores/userStore.js';
  import { onMounted, reactive } from 'vue';
  import { useNotification } from '@/composables/useNotification.js';
  import type { UpdateProfileRequest } from '@/types/user.js';
  interface FormErrors {
    firstName?: string,
    lastName?: string,
    phoneNumber?: string,
    gender?: string
  }

  const errors = reactive<FormErrors>({});
  const userStore = useUserStore();
  const { showNotification } = useNotification();
  
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
    updateProfile.gender = userStore.currentUser?.gender as 'male' | 'female' | 'other' | null ?? null;
    updateProfile.firstName = userStore.currentUser?.firstName ?? '';
    updateProfile.lastName = userStore.currentUser?.lastName ?? '';
    updateProfile.phoneNumber = userStore.currentUser?.phoneNumber ?? '';
  });

  const handleUpdateProfie = async(): Promise<void> => {
    (Object.keys(errors) as (keyof FormErrors)[]).forEach(e => delete errors[e]);
    
    let valid: boolean = true;
    if (!updateProfile.gender) {
      errors.gender = 'Gender is required';
      valid = false;
    }
    if (!updateProfile.firstName) {
      errors.firstName = 'First name is required';
      valid = false;
    } else if (!nameRegex.test(updateProfile.firstName)) {
      errors.firstName = 'First name can only cotain letters';
      valid = false;
    } else if (updateProfile.firstName.length < 2 || updateProfile.firstName.length > 30 ) {
      errors.firstName = 'First name can be 2-50 characters';
      valid = false;
    }
    if (!updateProfile.lastName) {
      errors.lastName = 'Last name is required';
      valid = false;
    } else if (!nameRegex.test(updateProfile.lastName)) {
      errors.lastName = 'Last name can only cotain letters';
      valid = false;
    } else if (updateProfile.lastName.length < 2 || updateProfile.lastName.length > 30 ) {
      errors.lastName = 'First name can be 2-50 characters';
      valid = false;
    }
    if (!updateProfile.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone is required';
      valid = false;
    } else if (!phoneRegex.test(updateProfile.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number. (e.g., 012345678 or +85512345678)';
      valid = false;
    }
    if (!valid) return;
    const result = await userStore.updateMyProfile(updateProfile);
    showNotification(result.message, { type: 'success' });
  };

</script>

<template>
  <hr class="border-gray-100 dark:border-surface-100 my-1" />
  <div class="relative w-full max-w-md animate-slide-up">
    <p v-if="userStore.userError" class="default-button cursor-default bg-red-50 w-full text-sm text-red-700 text-center">
      {{ userStore.userError }}
    </p>
    <form @submit.prevent="handleUpdateProfie" class="space-y-4">
        <div >
          <div class="flex gap-3">
            <label class="label mt-2">{{ $t('register.gender') }}</label>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="gender" value="male" v-model="updateProfile.gender" class="cursor-pointer w-4 h-4 " />
                    <span class="text-sm text-black dark:text-gray-200">{{$t('register.male')}}</span>
                </label>
  
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="gender" value="female" v-model="updateProfile.gender"  class="cursor-pointer w-4 h-4" />
                    <span class="text-sm text-black dark:text-gray-200">{{$t('register.female')}}</span>
                </label>
  
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="gender" value="other" v-model="updateProfile.gender" class="cursor-pointer w-4 h-4" />
                    <span class="text-sm text-black dark:text-gray-200">{{$t('register.other')}}</span>
                </label>
            </div>

          </div>
          <p v-if="errors.gender" class="error-msg">{{ errors.gender }}</p>
          </div>
        <div>
            <div>
                <label class="label">{{ $t('register.firstName') }}</label>
                <input  type="text" class="input" v-model="updateProfile.firstName"  :placeholder="$t('register.enterFirstName')" :class="{'input-error': errors.firstName}" autocomplete="name" />
                <p v-if="errors.firstName" class="error-msg">{{ errors.firstName }}</p>
            </div>
            <div class="mt-3">
                <label class="label">{{ $t('register.lastName') }}</label>
                <input  type="text" class="input" v-model="updateProfile.lastName" :placeholder="$t('register.enterlastName')" :class="{'input-error': errors.lastName}" autocomplete="name" />
                <p v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</p>
            </div>
        </div>
        <div>
            <label class="label">{{ $t('register.phoneNumber') }}</label>
            <input  type="text" class="input" v-model="updateProfile.phoneNumber"  :placeholder="$t('register.enterPhoneNumber')" :class="{'input-error': errors.phoneNumber}"/>
           <p v-if="errors.phoneNumber" class="error-msg">{{ errors.phoneNumber }}</p>
        </div>
    
        <button 
            type="submit"
            class="default-button font-medium w-full py-2 text-base flex items-center justify-center gap-2 mt-2"
        >
          <svg v-if="userStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
            {{ userStore.loading ? 'Updating profile...' : 'Update' }}
        </button>
    </form>
  </div>
</template>
