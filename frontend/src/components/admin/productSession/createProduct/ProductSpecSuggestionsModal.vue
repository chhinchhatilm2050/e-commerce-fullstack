<script setup lang="ts">
  import { CATEGORY_SPEC_PRESETS } from '@/utils/specificationPresets';
  import type { ISpecificationPreset } from '@/utils/specificationPresets';

  defineProps<{
    modelValue: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'apply-preset', specs: { key: string; value: string }[]): void;
  }>();

  const close = () => emit('update:modelValue', false);

  const selectPreset = (preset: ISpecificationPreset) => {
    emit('apply-preset', preset.specs);
    close();
  };
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/30 z-[80] flex items-center justify-center p-4"
        @click.self="close"
      >
        <div class="bg-white  animate-slide-up w-full max-w-lg rounded-lg shadow-xl p-6 relative">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-black/10 ">
            <h3 class="text-lg font-semibold text-black flex items-center gap-2">
              <i class="ri-lightbulb-line text-amber-500"></i> Specification Suggestions
            </h3>
            <button
              @click="close"
              class="text-black/50 hover:text-gray-600  cursor-pointer"
            >
              <i class="ri-close-line text-xl"></i>
            </button>
          </div>

          <p class="text-sm text-black/80 my-4">
            Select a category template below to auto-fill common specification fields.
          </p>

          <!-- Category Presets Grid -->
          <div class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            <button
              v-for="preset in CATEGORY_SPEC_PRESETS"
              :key="preset.category"
              @click="selectPreset(preset)"
              class="flex flex-col items-start p-4 border border-gray-200  rounded-md hover:border-black  transition cursor-pointer text-left group"
            >
              <div class="flex items-center gap-2 font-medium text-black group-hover:text-amber-600">
                <i :class="[preset.icon, 'text-lg']"></i>
                <span>{{ preset.category }}</span>
              </div>
              <span class="text-xs text-black/50 mt-2">
                {{ preset.specs.length }} default fields
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
