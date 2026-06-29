<script setup lang="ts">
  import { ref, onUnmounted, onMounted, watch } from 'vue';
  import { useAuthStore } from '@/stores/authStore.js';
  import { useNotification } from '@/composables/useNotification.js';

  const authStore = useAuthStore();
  
  const props = defineProps<{
    email: string
  }>();
  const emit = defineEmits<{
    close: [],
    'go-login': []
  }>();
  
  const email = props.email ?? '';
  const code = ref<string>('');
  const cooldownTime = ref<number>(0);
  const { showNotification } = useNotification();

  let cooldownTimer: ReturnType<typeof setInterval> | undefined;

  const startCooldown = (seconds: number = 60): void => {
    cooldownTime.value = seconds;
    cooldownTimer = setInterval(() => {
      cooldownTime.value -= 1;
      if (cooldownTime.value <= 0 && cooldownTimer) clearInterval(cooldownTimer);
    }, 1000);
  };
  onMounted(() => {
    startCooldown();
    authStore.authError = '';
  });

  onUnmounted(() => {
    if (cooldownTimer) clearInterval(cooldownTimer);
  });

  watch(cooldownTime, (val) => {
    if (val <= 0) {
      setTimeout(() => emit('close'), 100);
    }
  });

  const handleVerify = async(): Promise<void> => {
    const result = await authStore.verifiEmail(props.email, code.value );
    if (result.success) {
      showNotification(result.message, { type: 'success' });
      if (cooldownTimer) clearInterval(cooldownTimer);
      emit('close'); 
      emit('go-login');
    }
  };
</script>

<template>
  <div class="relative w-full max-w-md animate-slide-up mt-2">
    <div class="w-full text-center">
      <p v-if="authStore.verifyErro" class="default-button cursor-default bg-red-50 w-full text-sm text-red-700">
        {{ authStore.verifyErro }}
      </p>
      <form @submit.prevent class="mt-3
      ">
        <div>
          <input
            type="text"
            maxlength="6"
            class="input text-center"
            v-model="code"
            :disabled="cooldownTime <= 0"
          />
          <p class="text-end mt-1 dark:text-gray-300 text-surface-800">
            <p v-if="cooldownTime > 0">Code expires in 00:{{ cooldownTime }} s</p>
          </p>
        </div>
        <button
          type="submit"
          class="default-button w-full py-2 text-base flex items-center justify-center gap-2 mt-4"
          @click="handleVerify"
        >
         <svg v-if="authStore.emailLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ authStore.emailLoading ? 'Verifying...': $t('register.verify') }}
        </button>
      </form>
      <p class="w-full text-start mt-4 dark:text-gray-300 text-surface-800">
        We sent a 6-digit code vai <<<span class="text-surface-800 dark:text-gray-200">{{ email }}</span>>>
      </p>
    </div>
  </div>
</template>
