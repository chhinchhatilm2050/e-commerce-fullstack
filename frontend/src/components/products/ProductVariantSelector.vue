<script setup lang="ts">
  import type { IProductImage } from '@/types/product';

  defineProps<{
    availableColors: string[];
    availableSizes: string[];
    productImages: IProductImage[];
  }>();

  const selectedColor = defineModel<string | null>('color', { default: null });
  const selectedSize = defineModel<string | null>('size', { default: null });
</script>

<template>
  <div>
    <!-- Color Selector -->
    <div v-if="availableColors.length > 0" class="mt-6">
      <span class="text-sm font-medium block mb-2">
        Color:
        <span class="font-normal capitalize">{{ selectedColor }}</span>
      </span>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="color in availableColors"
          :key="color"
          class="flex flex-col items-center gap-1.5"
        >
          <button
            class="w-24 h-32 border overflow-hidden transition cursor-pointer"
            :class="
              color === selectedColor
                ? 'border-black dark:border-white'
                : 'border-transparent'
            "
            @click="selectedColor = color"
          >
            <img
              v-if="productImages[0]"
              :src="productImages[0].url"
              class="w-full h-full object-cover"
            />
          </button>
          <p class="text-black/90 dark:text-white/90 text-sm capitalize">
            {{ color }}
          </p>
        </div>
      </div>
    </div>

    <!-- Size Selector -->
    <div v-if="availableSizes.length > 0" class="mt-6">
      <span class="text-sm font-medium block mb-2">Size</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in availableSizes"
          :key="size"
          class="w-[70px] px-3 h-8 border border-black/20 dark:border-white/20 rounded-sm cursor-pointer whitespace-nowrap flex items-center justify-center text-sm transition"
          :class="size === selectedSize ? 'subCategory-button' : ''"
          @click="selectedSize = size"
        >
          {{ size }}
        </button>
      </div>
    </div>
  </div>
</template>
