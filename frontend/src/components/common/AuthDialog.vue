<script setup lang="ts">
  import BaseDialog from './BaseDialog.vue';
  import { computed, ref, watch } from 'vue';
  import RegisterView from '@/views/auth/RegisterView.vue';
  import LoginView from '@/views/auth/LoginView.vue';
  import VerifyEmailView from '@/views/auth/VerifyEmailView.vue';
  import { useRoute, useRouter } from 'vue-router';

  const props = withDefaults(defineProps<{
    modelValue: boolean
    startRegister: boolean
  }>(), {
    startRegister: false,
  }); 

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>();

  const open = computed<boolean>({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  });

  const isLogin = ref<boolean>(true);
  const showVerify = ref<boolean>(false);
  const pendingEmail = ref<string>('');
  const route = useRoute();
  const router = useRouter();

  watch(() => props.modelValue, (val) => {
    if (val) {
      isLogin.value = !props.startRegister;
      showVerify.value = false;
    }
  });

  watch(() => route.query.openAuth, (val) => {
    if (val === 'login') {
      isLogin.value = false;
      open.value = true; 
      router.replace({ query: {} }); 
    }
  }, { immediate: true });
</script>
<template>
  <BaseDialog v-model="open" :title="isLogin ? $t('login.login') : $t('register.siginup')" size="max-w-lg" cancel-text="" confirm-disabled confirm-text="" :show-footer="false">
    <LoginView
      v-if="isLogin"
      @go-reginster="isLogin = false"
      @successLogin="open = false"
      @close="open = false"

    />
    <RegisterView
      v-else
      @go-login="isLogin = true"
      @go-verify="(email) => { pendingEmail = email; showVerify = true}" 
    />
  </BaseDialog>
  <BaseDialog v-model="showVerify" :title="$t('register.verifyEmail')" size="max-w-lg" :z-index="60" cancel-text="" confirm-disabled confirm-text="" :show-footer="false">
    <VerifyEmailView :email = "pendingEmail" @close="showVerify = false" @go-login="isLogin = true"/>
  </BaseDialog>
</template>
