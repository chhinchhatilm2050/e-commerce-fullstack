<script setup lang="ts">
  import { ref } from 'vue';

  const MAX_IMAGES = 6;

  const selectedFiles = defineModel<File[]>('files', { default: () => [] });
  const previewUrls = defineModel<string[]>('previews', { default: () => [] });

  defineProps<{
    error?: string;
  }>();

  const emit = defineEmits<{
    (e: 'clear-error'): void;
  }>();

  const fileInputRef = ref<HTMLInputElement | null>(null);

  const triggerFileSelect = () => {
    if (selectedFiles.value.length < MAX_IMAGES) {
      fileInputRef.value?.click();
    }
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;

    const incomingFiles = Array.from(target.files);
    const remainingSlots = MAX_IMAGES - selectedFiles.value.length;

    if (remainingSlots <= 0) return;

    const allowedFiles = incomingFiles.slice(0, remainingSlots);
    selectedFiles.value.push(...allowedFiles);

    const newPreviews = allowedFiles.map((file) => URL.createObjectURL(file));
    previewUrls.value.push(...newPreviews);

    emit('clear-error');
    target.value = '';
  };

  const removeLocalImage = (index: number) => {
    const urlToRevoke = previewUrls.value[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    selectedFiles.value.splice(index, 1);
    previewUrls.value.splice(index, 1);
  };
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <label class="block label dark:text-black/80">
        Product Images <span class="text-red-600">*</span>
      </label>
      <span class="text-[11px] text-gray-500 dark:text-gray-400">
        ({{ previewUrls.length }}/{{ MAX_IMAGES }})
      </span>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <div class="flex flex-wrap items-center gap-3">
      <!-- Camera Add Tile -->
      <button
        v-if="previewUrls.length < MAX_IMAGES"
        type="button"
        @click="triggerFileSelect"
        class="w-18 h-18 rounded-md border-2 border-dashed border-gray-300 dark:border-surface-600 hover:border-gray-400 dark:hover:border-surface-500 bg-gray-50/50 flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer shrink-0"
        :class="{ 'border-red-500': error }"
      >
        <i class="ri-camera-line text-lg leading-none"></i>
        <span class="text-[11px] font-medium">Add</span>
      </button>

      <!-- Thumbnail Tiles -->
      <div
        v-for="(url, index) in previewUrls"
        :key="index"
        class="relative w-18 h-18 rounded-md border border-gray-200 dark:border-surface-600 overflow-hidden group shrink-0 bg-gray-100 dark:bg-surface-700"
      >
        <img :src="url" class="w-full h-full object-cover" />
        <span
          v-if="index === 0"
          class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 font-medium"
        >
          Primary
        </span>
        <button
          type="button"
          @click="removeLocalImage(index)"
          class="absolute top-1 right-1 text-red-600 hover:text-red-700 bg-white/80 dark:bg-surface-800/80 hover:bg-red-500/10 hover:backdrop-blur-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-xs border border-red-200/50 dark:border-red-500/30"
          title="Remove image"
        >
          <i class="ri-delete-bin-line text-sm"></i>
        </button>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-[11px] text-red-600">
      {{ error }}
    </p>
  </div>
</template>
