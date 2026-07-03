<script setup lang="ts">
  import { useAuthStore } from '@/stores/authStore.js';
  import { useAlert } from '@/composables/useAlert.js';
  import { ref, reactive } from 'vue';
  import BaseDialog from '@/components/common/BaseDialog.vue';
  import VerifyResetCodeView from '@/views/auth/VerifyResetCodeView.vue';
  import ResetPasswordView from '@/views/auth/ResetPasswordView.vue';
  import { useRouter } from 'vue-router';

  const authStore = useAuthStore();
  const { showAlert } = useAlert();
  const router = useRouter();

  const email = ref<string>('');
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = reactive<{ email?: string }>({});

  const showVerifyReset = ref<boolean>(false);
  const showResetPassword = ref<boolean>(false);
  const resetToken = ref<string>('');

  const handleSubmit = async (): Promise<void> => {
    (Object.keys(errors) as (keyof typeof errors)[]).forEach(
      (e) => delete errors[e],
    );

    if (!email.value.trim()) {
      errors.email = 'Email is required';
      return;
    }
    if (!emailRegex.test(email.value)) {
      errors.email = 'Enter a valid email';
      return;
    }

    const result = await authStore.forgetPasword(email.value);
    if (result.success) {
      showAlert(result.message, { type: 'success' });
      showVerifyReset.value = true; 
    } else {
      showAlert(result.message, { type: 'error' });
    }
  };

  const handleGoReset = (token: string): void => {
    resetToken.value = token;
    showVerifyReset.value = false;
    showResetPassword.value = true;
  };
  const handleResetSuccess = (): void => {
    showResetPassword.value = false;
    router.push({ path: '/', query: { openAuth: 'login' } });
  };
</script>

<template>
  <div
    class="relative flex items-center justify-self-center justify-center w-full max-w-2xl animate-slide-up"
  >
    <div class="flex flex-col gap-2 w-sm sm:w-full">
      <h1 class="text-2xl sm:text-4xl font-bold text-center mt-10">
        FORGOT PASSWORD
      </h1>
      <form @submit.prevent="handleSubmit" class="mt-3">
        <label class="label"
          >{{ $t("login.email") }}<span class="text-red-700">*</span></label
        >
        <input
          type="text"
          v-model="email"
          class="input"
          :class="{ 'input-error': errors.email }"
          :placeholder="$t('login.enterEmail')"
          autocomplete="email"
        />
        <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
        <button
          type="submit"
          class="default-button w-full py-2 text-base flex items-center justify-center gap-2 mt-5"
        >
          <svg
            v-if="authStore.loading"
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
          {{ authStore.loading ? "Sending..." : "SUBMIT" }}
        </button>
      </form>
    </div>
  </div>

  <BaseDialog
    v-model="showVerifyReset"
    @close="showVerifyReset = false"
    :title="$t('register.verifyResetCode')"
    size="max-w-lg"
    :z-index="60"
  >
    <VerifyResetCodeView
      :email="email"
      @go-reset-password="(resetToken: string) => handleGoReset(resetToken)"
      @close="showVerifyReset = false"
    />
  </BaseDialog>

  <BaseDialog
    v-model="showResetPassword"
    :title="$t('login.resetPassword')"
    size="max-w-lg"
    :z-index="60"
  >
    <ResetPasswordView
      :email="email"
      :reset-token="resetToken"
      @go-login="handleResetSuccess"
    />
  </BaseDialog>
</template>
