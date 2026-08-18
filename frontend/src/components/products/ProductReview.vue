<script setup lang="ts">
  import type { IProduct } from '@/types/product.ts';
  import BaseDialog from '../common/BaseDialog.vue';
  import { reactive, ref, computed, watch } from 'vue';

  const props = defineProps<{
    product: IProduct;
    modelValue: boolean;
  }>();

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'submit-review': [
      payload: {
        productId: string | undefined;
        rating: number;
        comment: string;
        images: File[];
      }
    ];
      
  }>();

  const hoverRating = ref<number>(0);
  const imagePreview = ref<string[]>([]);

  interface ICommentForm {
    rating: number;
    comment: string;
    images: File[];
  }

  const form = reactive<ICommentForm>({
    rating: 0,
    comment: '',
    images: [],
  });

  const ratingLabel = computed<string>(() => {
    const activeRating = hoverRating.value || form.rating;
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[activeRating] ?? '';
  });

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    const availableSlots = 3 - form.images.length;
    const filesToProcess = files.slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        form.images.push(file);
        imagePreview.value.push(URL.createObjectURL(file));
      }
    });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreview.value[index] || '');
    imagePreview.value.splice(index, 1);
    form.images.splice(index, 1);
  };

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        form.rating = 0;
        form.comment = '';
        form.images = [];
        imagePreview.value.forEach((url) => URL.revokeObjectURL(url));
        imagePreview.value = [];
        hoverRating.value = 0;
      }
    },
  );

  const submitReview = () => {
    if (!form.rating || !form.comment.trim()) return;

    emit('submit-review', {
      productId: props.product?._id,
      rating: form.rating,
      comment: form.comment.trim(),
      images: form.images,
    });

    emit('update:modelValue', false);
  };
</script>

<template>
  <BaseDialog
    v-model="isOpen"
    :title="$t('review.review') || 'Write a Review'"
    size="max-w-lg"
    :show-footer="true"
    :cancel-text="$t('review.cancel') || 'Cancel'"
    :confirm-text="$t('review.submit') || 'Submit Review'"
    :confirm-disabled="!form.rating || !form.comment.trim()"
    @confirm="submitReview"
    @cancel="$emit('update:modelValue', false)"
  >
    <div class="animate-slide-up">
      <div class="flex items-center gap-3 input mb-5">
        <div class="w-22 h-30 shrink-0 overflow-hidden rounded-xs bg-gray-200 dark:bg-gray-700">
          <img
            :src="product?.images[0]?.url"
            :alt="product?.name"
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          >
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
            {{ product?.name }}
          </h4>
          <p v-if="product?.price" class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            US ${{ product?.price?.toFixed(2) }}
          </p>
        </div>
      </div>
  
      <div class="mb-5">
        <label class="label mb-1 uppercase">
          {{ $t('review.rating') || 'Overall Rating' }} <span class="text-rose-500">*</span>
        </label>
        <div class="flex items-center gap-1.5">
          <div class="flex gap-1" @mouseleave="hoverRating = 0">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="p-0.5 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
              @mouseenter="hoverRating = star"
              @click="form.rating = star"
            >
              <i
                class="text-2xl transition-colors duration-150"
                :class="[
                  star <= (hoverRating || form.rating)
                    ? 'ri-star-fill text-amber-600 dark:text-amber-600'
                    : 'ri-star-line text-black/50 dark:text-white/50'
                ]"
              />
            </button>
          </div>
  
          <span
            v-if="ratingLabel"
            class="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 dark:text-white/70 text-black/70 transition-all duration-200"
          >
            {{ ratingLabel }}
          </span>
        </div>
      </div>
  
      <div class="mb-5">
        <label class="label mb-1 uppercase">
          {{ $t('review.comment') || 'Your Review' }} <span class="text-rose-500">*</span>
        </label>
        <textarea
          v-model="form.comment"
          rows="4"
          maxlength="500"
          :placeholder="$t('review.placeholder') || 'What did you like or dislike about this product? Share your experience...'"
          class="input"
        />
      </div>
  
      <div class="mb-2">
        <label class="label uppercase mb-2">
          Add Photos <span class="text-black/50 dark:text-white/50 font-normal lowercase">(optional, max 3)</span>
        </label>
  
        <div class="flex flex-wrap gap-3">
          <div
            v-for="(img, index) in imagePreview"
            :key="index"
            class="relative w-16 h-16 rounded-sm overflow-hidden border border-gray-200 dark:border-white/10 group "
          >
            <img :src="img" class="w-full h-full object-cover" />
            <button
              type="button"
              class="absolute inset-0 cursor-pointer  bg-black/50  text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              @click="removeImage(index)"
            >
              <i class="ri-delete-bin-line text-base"></i>
            </button>
          </div>
  
          <label
            v-if="form.images.length < 3"
            class="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed input cursor-pointer transition-colors bg-gray-50 dark:bg-gray-800/40 group"
          >
            <i class="ri-camera-4-line text-lg text-black/50 dark:text-white/50 transition-colors"></i>
            <span class="text-[10px] text-black/50 dark:text-white/50 mt-0.5 font-medium">Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
        </div>
      </div>
    </div>
  </BaseDialog>
</template>

