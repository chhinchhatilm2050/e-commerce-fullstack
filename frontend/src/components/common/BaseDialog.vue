<script setup lang="ts">
  import { watchEffect } from 'vue';
  
  const props = withDefaults(defineProps<{
    modelValue: boolean,
    title?: string,
    size?: string,
    zIndex?: number,
  }>(), {
    title: '',
    size: 'max-w-md',
    zIndex: 50,
  });

  defineEmits<{
    'update:modelValue': [value: boolean]
  }>();

  watchEffect(() => {
    if (props.modelValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
</script>

<template>
  <Teleport to="body">
    <div v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      :style="{ zIndex: props.zIndex }"
      @click.self="$emit('update:modelValue', false)"
    >
      <div :class="`bg-white dark:bg-surface-800 rounded-xl shadow-xl  overflow-y-auto max-h-[100vh] w-full ${props.size} mx-4 p-10`">
        <div class="flex items-center justify-between mb-4">
        <h3 v-if="title" class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {{ title }}
        </h3>
        <span v-else class="flex-1" />
        <button
          class="ml-auto text-gray-400 hover:text-gray-600 transition-colors w-10 h-10 rounded-full bg-gray-100 cursor-pointer dark:bg-surface-100"
          @click="$emit('update:modelValue', false)"
        >
          <i class="ri-close-line text-xl"></i>
        </button>
        </div>

        <div class="text-gray-600 text-sm">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
