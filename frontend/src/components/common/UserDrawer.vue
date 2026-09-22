<script setup lang="ts">
  import { computed, ref, onMounted, watchEffect } from 'vue';
  import { useAuthStore } from '@/stores/authStore.js';
  import { useRouter } from 'vue-router';
  import { useAlert } from '@/composables/useAlert.js';
  import { useUserStore } from '@/stores/userStore.ts';
  import ProfileView from '@/views/profile/ProfileView.vue';
  import EditeProfileView from '@/views/profile/EditeProfileView.vue';
  import BaseDialog from './BaseDialog.vue';

  const props = defineProps<{ modelValue: boolean }>();
  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

  const showProfile = ref<boolean>(false);
  const showEditProfile = ref<boolean>(false);

  const open = computed<boolean>({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  });

  const authStore = useAuthStore();
  const userStore = useUserStore();
  const { showAlert } = useAlert();
  const router = useRouter();

  onMounted(() => {
    userStore.fetchProfile();
  });

  // Watch open state to lock/unlock body scroll
  watchEffect(() => {
    if (props.modelValue) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  });

  const close = () => {
    open.value = false;
  };

  const handleLogout = async (): Promise<void> => {
    const result = await authStore.logout();
    close();
    router.push('/');
    showAlert(result.message, { type: 'success' });
  };

  const handleOpenProfile = (): void => {
    showProfile.value = true;
  };

  const handleOpenEditeProfile = (): void => {
    showEditProfile.value = true;
  };

  const handleToDashboard = (): void => {
    router.push('/admin/dashboard');
    close();
  };

  const handleToOrders = (): void => {
    router.push('/my-orders');
    close();
  };
</script>
<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 z-[60] transition-opacity"
        @click="close"
      ></div>
    </Transition>

    <!-- Side Drawer Panel -->
    <div
      class="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-surface-800 z-[61] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Drawer Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-surface-100">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">
          {{ $t('profile.account') }}
        </h2>
        <button
            @click="close"
            class="cursor-pointer hover:bg-gray-200 dark:hover:bg-surface-700 w-7 h-7 flex items-center justify-center rounded-sm"
          >
            <i class="ri-sidebar-fold-line dark:text-gray-200 text-xl"></i>
          </button>
      </div>

      <!-- User Profile Header -->
      <div class="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-surface-100 bg-gray-50/50 dark:bg-surface-900/50">
        <div
          class="w-12 h-12 rounded-full bg-gray-200 dark:bg-surface-100 flex items-center justify-center flex-shrink-0"
        >
          <img class="w-full h-full object-cover rounded-full" v-if="userStore.currentUser?.avatar"
            :src="userStore.currentUser.avatar" alt="">
            <i v-else class="ri-user-fill text-2xl text-gray-500 dark:text-gray-200"></i>
        </div>
        <div class="overflow-hidden">
          <p class="font-semibold text-gray-800 dark:text-gray-100 capitalize truncate">
            {{ authStore.currentUser?.role }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ authStore.currentUser?.email }}
          </p>
        </div>
      </div>

      <!-- Menu Items List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-1">
        <button
          v-if="authStore.currentUser?.role === 'admin'"
          @click="handleToDashboard"
          class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
        >
          <i class="ri-settings-3-line text-lg text-black/80 dark:text-white/80"></i>
          <span class="text-sm font-medium text-black/80 dark:text-white/80">Admin Dashboard</span>
          <i class="ri-arrow-right-s-line ml-auto text-black/60 dark:text-white/60"></i>
        </button>

        <button
          @click="handleOpenProfile"
          class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
        >
          <i class="ri-account-circle-line text-lg text-black/80 dark:text-white/80"></i>
          <span class="text-sm font-medium text-black/80 dark:text-white/80">
            {{ $t("profile.myProfile") }}
          </span>
          <i class="ri-arrow-right-s-line ml-auto text-black/60 dark:text-white/60"></i>
        </button>

        <button
          @click="handleOpenEditeProfile"
          class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
        >
          <i class="ri-edit-box-line text-lg text-black/80 dark:text-white/80"></i>
          <span class="text-sm font-medium text-black/80 dark:text-white/80">
            {{ $t("profile.editProfile") }}
          </span>
          <i class="ri-arrow-right-s-line ml-auto text-black/60 dark:text-white/60"></i>
        </button>

        <button
          @click="handleToOrders"
          class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors text-left cursor-pointer"
        >
          <i class="ri-shopping-bag-line text-lg text-black/80 dark:text-white/80"></i>
          <span class="text-sm font-medium text-black/80 dark:text-white/80">
            {{ $t("profile.myOrders") }}
          </span>
          <i class="ri-arrow-right-s-line ml-auto text-black/60 dark:text-white/60"></i>
        </button>
      </div>

      <!-- Drawer Footer -->
      <div class="p-4 border-t border-gray-100 dark:border-surface-100">
        <button
          class="w-full flex gap-2 text-red-600 items-center justify-center subCategory-button"
          @click="handleLogout"
        >
          <i
            :class="authStore.loading ? 'hidden' : 'block'"
            class="ri-logout-box-line text-lg"
          ></i>
          <svg
            v-if="authStore.loading"
            class="w-4 h-4 animate-spin text-red-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{{ authStore.loading ? "Logout" : $t("profile.logout") }}</span>
        </button>
      </div>
    </div>

    <!-- Modals for child profile sub-views -->
    <BaseDialog
      v-model="showProfile"
      :title="$t('profile.myProfile')"
      size="max-w-md"
      :z-index="70"
      cancel-text=""
      confirm-disabled
      confirm-text=""
      :show-footer="false"
    >
      <ProfileView @close="showProfile = false" />
    </BaseDialog>

    <BaseDialog
      v-model="showEditProfile"
      :title="$t('profile.myProfile')"
      size="max-w-md"
      :z-index="70"
      cancel-text=""
      confirm-disabled
      confirm-text=""
      :show-footer="false"
    >
      <EditeProfileView @close="showEditProfile = false" />
    </BaseDialog>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
