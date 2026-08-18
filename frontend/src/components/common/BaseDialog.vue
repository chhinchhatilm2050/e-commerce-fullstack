<script setup lang="ts">
  import { watchEffect } from 'vue';
  
  const props = withDefaults(defineProps<{
    modelValue: boolean,
    title?: string,
    size?: string,
    zIndex?: number,
    cancelText: string,
    confirmText: string,
    confirmDisabled: boolean,
    showFooter: boolean,
  }>(), {
    title: '',
    size: 'max-w-md',
    zIndex: 50,
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    confirmDisabled: false,
    showFooter: false,
  });

  defineEmits<{
    'update:modelValue': [value: boolean];
    'confirm' : [];
    'cancel': [];
  }>();

  watchEffect(() => {
    if (props.modelValue) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.removeProperty('--scrollbar-width');
    }
  });
</script>

<template>
  <Teleport to="body">
    <div v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
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

        <div v-if="showFooter" class="flex justify-end gap-2 mt-6">
          <slot name="footer">
            <button
              class="subCategory-button px-3 text-red-700"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              :disabled="confirmDisabled"
              class="subCategory-button px-3
                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </slot>
        </div>

      </div>
    </div>
  </Teleport>
</template>
