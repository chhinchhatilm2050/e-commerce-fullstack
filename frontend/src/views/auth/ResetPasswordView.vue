<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useAuthStore } from '@/stores/authStore.js';
  import { useAlert } from '@/composables/useAlert.js';

  interface ResetPasswordForm {
    password: string,
    confirmPassword: string
  }
  interface FormErrors {
    password?: string,
    confirm?: string,
  }

  const resetPasswordForm = reactive<ResetPasswordForm>({
    password: '',
    confirmPassword: '',
  });

  const authStore = useAuthStore();
  const { showAlert } = useAlert();
  const errors = reactive<FormErrors>({});
  const showPass = ref<boolean>(false);
  const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const props = defineProps<{
    email: string
    resetToken: string
  }>();

  const emit = defineEmits<{
    'go-login': []
  }>();

  const handleResetPassword = async (): Promise<void> => {
    (Object.keys(errors) as (keyof FormErrors)[]).forEach((e) => delete errors[e]);
    let valid: boolean = true;

    if (!resetPasswordForm.password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (!passwordRegex.test(resetPasswordForm.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character.';
      valid = false;
    }
    if (!resetPasswordForm.confirmPassword) {
      errors.confirm = 'Confirm password is required';
    }
    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      errors.confirm = 'Passwords do not match';
      valid = false;
    }

    if (!valid) return;

    const result = await authStore.resetPassword(props.email, props.resetToken, resetPasswordForm.password);
    if (result.success) {
      showAlert(result.message, { type: 'success' });
      emit('go-login');
    } else {
      showAlert(result.message, { type: 'error' });
    }

  };
</script>

<template>
    <div class="relative w-full max-w-md animate-slide-up mt-2">
    <div class="w-full ">
      <form @submit.prevent class="mt-3
      ">
        <div>
            <label class="label">{{$t('register.password')}} <span class="text-red-700">*</span></label>
            <div class="relative">
            <input
                v-model="resetPasswordForm.password"
                :type="showPass ? 'text' : 'password'"
                class="input"
                :class="{'input-error': errors.password}"
                :placeholder="$t('register.enterPassword')"
                autocomplete="new-password"
            />
            <button type="button" @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <i v-if="!showPass" class="ri-eye-line"></i>
                <i v-else class="ri-eye-off-line"></i>
            </button>
            </div>
            <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
        </div>
        <div class="mt-4">
            <label class="label">{{$t('register.confirm')}} <span class="text-red-700">*</span></label>
            <input v-model="resetPasswordForm.confirmPassword" :type="showPass ? 'text' : 'password'" class="input" :class="{'input-error': errors.confirm}" :placeholder="$t('register.confirmPassword')" autocomplete="new-password" />
            <p v-if="errors.confirm" class="error-msg">{{ errors.confirm }}</p>
        </div>
        <button
          type="submit"
          @click="handleResetPassword"
          class="default-button w-full py-2 text-base flex items-center justify-center gap-2 mt-4"
        >
         <svg v-if="authStore.resetLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ authStore.resetLoading ? 'Resetting…' : 'Reset password' }}
        </button>
      </form>
    </div>
  </div>
</template>
