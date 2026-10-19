<script setup lang="ts">
  import { ref } from 'vue';
  import ProductSpecSuggestionsModal from './ProductSpecSuggestionsModal.vue';
  interface ISpecificationItem {
    key: string;
    value: string;
  }

  const specifications = defineModel<ISpecificationItem[]>({ default: () => [] });
  const isSuggestionsOpen = ref(false);

  const addSpec = () => {
    if (specifications.value.length < 10) {
      specifications.value.push({ key: '', value: '' });
    }
  };

  const removeSpec = (index: number) => {
    specifications.value.splice(index, 1);
  };

  // Replaces or appends preset specifications safely
  const applyPresetSpecs = (presetSpecs: { key: string; value: string }[]) => {
    // Option A: Overwrite empty array OR append preset items
    const existing = specifications.value.filter((s) => s.key.trim() || s.value.trim());
    const combined = [...existing, ...presetSpecs];
  
    // Cap at max 10 specifications
    specifications.value = combined.slice(0, 10);
  };
</script>

<template>
  <div class="space-y-3">
    <!-- Header Controls -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">
        Specifications ({{ specifications.length }}/10)
      </span>
      <div class="flex items-center gap-3">
        <!-- Suggestion Button -->
        <button
          type="button"
          @click="isSuggestionsOpen = true"
          class="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
        >
          <i class="ri-lightbulb-line"></i> Suggest Specs
        </button>

        <!-- Add Spec Button -->
        <button
          type="button"
          @click="addSpec"
          :disabled="specifications.length >= 10"
          class="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer disabled:opacity-40"
        >
          + Add spec
        </button>
      </div>
    </div>

    <!-- Inputs List -->
    <div
      v-for="(spec, index) in specifications"
      :key="index"
      class="flex items-center gap-2"
    >
      <input
        v-model="spec.key"
        placeholder="Key (e.g. Size)"[cite: 14]
        class="flex-1 px-3 py-2 border rounded-sm text-sm"
      />
      <input
        v-model="spec.value"
        placeholder="Value (e.g. S, M, L)"[cite: 14]
        class="flex-1 px-3 py-2 border rounded-sm text-sm"
      />
      <button
        type="button"
        @click="removeSpec(index)"
        class="text-red-500 hover:text-red-700"
      >
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>

    <!-- Suggestions Modal -->
    <ProductSpecSuggestionsModal
      v-model="isSuggestionsOpen"
      @apply-preset="applyPresetSpecs"
    />
  </div>
</template>
