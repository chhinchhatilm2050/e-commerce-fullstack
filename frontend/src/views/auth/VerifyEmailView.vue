<script setup lang="ts">
  import { ref, onUnmounted, onMounted, watch } from 'vue';
  import { useAuthStore } from '@/stores/authStore';

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
  const successMessage = ref<string>('');
  const cooldownTime = ref<number>(0);

  let cooldownTimer: ReturnType<typeof setInterval> | undefined;

  const startCooldown = (seconds: number = 120): void => {
    cooldownTime.value = seconds;
    cooldownTimer = setInterval(() => {
      cooldownTime.value -= 1;
      if (cooldownTime.value <= 0 && cooldownTimer) clearInterval(cooldownTimer);
    }, 1000);
  };
  onMounted(() => {
    startCooldown();
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
    successMessage.value = '';
    const result = await authStore.verifiEmail(props.email, code.value );
    if (result.success) {
      successMessage.value = 'Email verified!';
      if (cooldownTimer) clearInterval(cooldownTimer);
      setTimeout(() => { emit('close'); emit('go-login'); }, 1500);
    }
  };
</script>

<template>
  <div class="relative w-full max-w-md animate-slide-up mt-2">
    <div class="w-full text-center">
      <p v-if="authStore.verifyErro" class="default-button w-full text-sm text-red-700">
        {{ authStore.verifyErro }}
      </p>
      <p v-if="successMessage" class="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        {{ successMessage }}
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
            <p v-if="cooldownTime > 0">Code expires in: {{ cooldownTime }} s</p>
          </p>
        </div>
        <button
          type="submit"
          class="default-button w-full py-2 text-base flex items-center justify-center gap-2 mt-4"
          @click="handleVerify"
        >
          {{ authStore.loading ? 'Verifying...': $t('register.verify') }}
        </button>
      </form>
      <p class="w-full text-start mt-4 dark:text-gray-300 text-surface-800">
        We sent a 6-digit code vai <<<span class="text-surface-800 dark:text-gray-200">{{ email }}</span>>>
      </p>
    </div>
  </div>
</template>
