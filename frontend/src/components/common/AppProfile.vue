<script setup lang="ts">
  import BaseDialog from './BaseDialog.vue';
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: boolean
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>();

  const open = computed<boolean>({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  });
</script>

<template>
    <BaseDialog v-model="open" :title="$t('register.verifyEmail')" size="max-w-lg" :z-index="60">
    </BaseDialog>
</template>
