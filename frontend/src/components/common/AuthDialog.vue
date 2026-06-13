<script setup lang="ts">
  import BaseDialog from './BaseDialog.vue'
  import { computed, ref, watch } from 'vue'
  import RegisterView from '@/views/auth/RegisterView.vue'
  import LoginView from '@/views/auth/LoginView.vue'

  const props = withDefaults(defineProps<{
    modelValue: boolean
    startRegister: boolean
  }>(), {
    startRegister: false,
  }) 

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const open = computed<boolean>({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  })

  const isLogin = ref<boolean>(true)
  watch(() => props.modelValue, (val) => {
    if (val) {
      isLogin.value = !props.startRegister
    }
  })
</script>

<template>
  <BaseDialog v-model="open" :title="isLogin ? $t('login.login') : $t('register.siginup')" size="max-w-lg">
    <LoginView
      v-if="isLogin"
      @go-reginster="isLogin = false"
    />
    <RegisterView
      v-else
      @go-login="isLogin = true"
    />
  </BaseDialog>
</template>
