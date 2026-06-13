<script setup lang="ts">
  const emit = defineEmits<{
    'openRegister': [],
    'openLogin': []
  }>() 
</script>

<template>
    <button @click="emit('openRegister')" class="hidden lg:block rounded-sm text-[17px] hover:underline font-semibold transition-all duration-200 cursor-pointer">{{$t('nav.register')}}</button>
    <button @click="emit('openLogin')" class="hidden lg:block rounded-sm text-[17px] hover:underline font-semibold transition-all duration-200 cursor-pointer">{{$t('nav.login')}}</button>
</template>
