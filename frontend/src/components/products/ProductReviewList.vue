<script setup lang="ts">
  import { watch, ref, computed } from 'vue';
  import { useReviewStore } from '@/stores/reviewStore.js';
  import TopLoader from '@/components/common/TopLoader.vue';
  import { useAuthStore } from '@/stores/authStore';
  import type { IReview } from '@/types/review';

  const props = defineProps<{
    productId: string;
  }>();

  const emit = defineEmits<{
    (e: 'open-review-modal'): void;
    (e: 'edit-review', review: IReview): void; 
  }>();

  const reviewStore = useReviewStore();
  const authStore = useAuthStore();
  const currentUser = computed(() => authStore.currentUser?._id);
  const page = ref<number>(1);
  const isOwnReview = (review: IReview) => {
    if (!currentUser.value) return false;

    const reviewUserId = typeof review.userId === 'object' 
      ? (review.userId?._id) 
      : review.userId;

    return reviewUserId === currentUser.value;
  };
  const deletingId = ref<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    deletingId.value = reviewId;
    const success = await reviewStore.deleteReview(reviewId);
    deletingId.value = null;

    if (success) {
      reviewStore.fetchReview(props.productId, page.value);
    }
  };
  watch(
    () => props.productId,
    (newId) => {
      if (newId) {
        reviewStore.fetchReview(newId, page.value);
      }
    },
    { immediate: true },
  );
  const changePage = (page: number) => {
    reviewStore.fetchReview(`${props.productId}`, page);
  };
</script>

<template>
  <div class="container-xl px-8 py-10 border-black/10 dark:border-white/20">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="section-title"><i class="ri-star-half-line"></i> Customer Reviews</h2>
        <p class="text-sm text-black/60 dark:text-white/60 mt-1">
          Based on {{ reviewStore.reviewPagination?.total || 0 }} reviews
        </p>
      </div>
      <button 
        @click="emit('open-review-modal')" 
        class="subCategory-button gap-2 cursor-pointer"
      >
        <i class="ri-edit-line"></i> Write a Review
      </button>
    </div>

    <div v-if="reviewStore.loading" class="py-10 text-center">
      <TopLoader :isLoading="reviewStore.loading" />
    </div>

    <div v-else-if="!reviewStore.reviews.length" class="text-center py-12 dark:bg-white/5 bg-black/5  rounded-sm">
      <i class="ri-chat-1-line text-4xl text-black/50 dark:text-white/50"></i>
      <p class="mt-2 text-sm text-black/50 dark:text-white/50">No reviews yet. Be the first to review this product!</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-6">
      <div 
        v-for="review in reviewStore.reviews" 
        :key="review._id" 
        class="p-6 bg-black/5 dark:bg-white/5 rounded-sm space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-sm uppercase">
              {{ review.userId?.avatar || review.userId?.firstName?.charAt(0) || 'U' }}
            </div>
            
            <div>
              <p class="font-semibold text-sm">
                {{ review.userId?.firstName }} {{ review.userId?.lastName }}
              </p>
              <span class="text-xs text-black/50 dark:text-white/50">
                {{ new Date(review.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>

          <!-- Star Rating -->
           <div class="flex">
               <div class="flex text-yellow-600 text-sm">
                 <i 
                   v-for="star in 5" 
                   :key="star" 
                   :class="star <= review.rating ? 'ri-star-fill' : 'ri-star-line text-gray-300 dark:text-gray-600'"
                 ></i>
               </div>
               
               <div 
                 v-if="currentUser && isOwnReview(review)" 
                 class="flex items-center gap-2 border-l border-black/10 dark:border-white/20 pl-3 ml-2"
               >
                 <!-- Edit -->
                 <button 
                     @click="emit('edit-review', review)"
                     class="text-xs font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
                 >
                     <i class="ri-edit-line"></i> Edit
                 </button>
     
                 <!-- Delete -->
                 <button 
                     @click="handleDelete(review._id)"
                     :disabled="deletingId === review._id"
                     class="text-xs font-medium text-red-600/80 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-400 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                 >
                     <i :class="deletingId === review._id ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'"></i>
                     {{ deletingId === review._id ? 'Deleting...' : 'Delete' }}
                 </button>
            </div>
           </div>
        </div>

        <p class="text-sm text-black/80 dark:text-white/80 leading-relaxed">
          {{ review.comment }}
        </p>
        <div v-if="review.images && review.images.length > 0" class="flex flex-wrap gap-3 pt-2">
            <div v-for="(img, index) in review.images" :key="index" class="shrink-0">
                <img 
                :src="img.url" 
                :alt="`Review image ${index + 1}`" 
                class="w-20 h-20 object-cover rounded-sm border border-black/10 dark:border-white/10"
                />
            </div>
            </div>
       </div>
       
      <!-- Pagination -->
      <div 
        v-if="reviewStore.reviewPagination && reviewStore.reviewPagination.total > 1" 
        class="flex items-center justify-center gap-4 pt-6"
      >
        <button 
          class="w-9 h-9 subCategory-button flex items-center justify-center rounded disabled:opacity-40"
          :disabled="!reviewStore.reviewPagination.hasPrevPage"
          @click="changePage(reviewStore.reviewPagination.page - 1)"
        >
          <i class="ri-arrow-left-s-line"></i>
        </button>
        <span class="text-sm font-medium">
          Page {{ reviewStore.reviewPagination.page }} of {{ reviewStore.reviewPagination.totalPage }}
        </span>
        <button 
          class="w-9 h-9 subCategory-button flex items-center justify-center rounded disabled:opacity-40"
          :disabled="!reviewStore.reviewPagination.hasNextPage"
          @click="changePage(reviewStore.reviewPagination.page + 1)"
        >
          <i class="ri-arrow-right-s-line"></i>
        </button>
      </div>
    </div>
  </div>
</template>

