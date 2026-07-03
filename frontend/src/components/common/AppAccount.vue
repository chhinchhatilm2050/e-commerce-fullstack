<script setup lang="ts">
  import BaseDialog from './BaseDialog.vue';
  import { computed, ref } from 'vue';
  import { useAuthStore } from '@/stores/authStore.js';
  import { useRouter } from 'vue-router';
  import { useAlert } from '@/composables/useAlert.js';
  import ProfileView from '@/views/profile/ProfileView.vue';
  import EditeProfileView from '@/views/profile/EditeProfileView.vue';
  const props = defineProps<{ modelValue: boolean }>();
  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
  const showProfile = ref<boolean>(false);
  const showEditProfile = ref<boolean>(false);

  const open = computed<boolean>({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  });

  const authStore = useAuthStore();
  const { showAlert } = useAlert();
  const router = useRouter();

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
    router.push('/dashboard');
    close();
  };
</script>

<template>
  <BaseDialog
    v-model="open"
    :title="$t('profile.account')"
    size="max-w-md"
    :z-index="60"
  >
    <hr class="border-gray-100 dark:border-surface-100 my-1" />
    <div class="relative w-full max-w-md animate-slide-up">
      <div class="flex items-center gap-4 py-3">
        <div
          class="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-100 flex items-center justify-center flex-shrink-0"
        >
          <i class="ri-user-fill text-2xl text-gray-500 dark:text-gray-200"></i>
        </div>
        <div>
          <p
            class="font-semibold text-gray-800 dark:text-gray-100"
            style="text-transform: capitalize"
          >
            {{ authStore.currentUser?.role }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-300">
            {{ authStore.currentUser?.email }}
          </p>
        </div>
      </div>

      <hr class="border-gray-100 dark:border-surface-100 my-1" />

      <div class="flex flex-col justify-center">
        <button
          v-if="authStore.currentUser!.role === 'admin'"
          @click="handleToDashboard"
          class="flex items-center gap-3 py-3 cursor-pointer transition-colors text-left"
        >
          <i
            class="ri-settings-3-line text-lg text-gray-500 dark:text-gray-300"
          ></i>
          <span class="text-sm text-gray-700 dark:text-gray-200"
            >Admin Dashboard</span
          >
          <i class="ri-arrow-right-s-line ml-auto text-gray-400"></i>
        </button>
        <button
          @click="handleOpenProfile"
          class="flex items-center gap-3 py-3 cursor-pointer transition-colors text-left"
        >
          <i
            class="ri-account-circle-line text-lg text-gray-500 dark:text-gray-300"
          ></i>
          <span class="text-sm text-gray-700 dark:text-gray-200">{{
            $t("profile.myProfile")
          }}</span>
          <i class="ri-arrow-right-s-line ml-auto text-gray-400"></i>
        </button>

        <button
          @click="handleOpenEditeProfile"
          ;
          class="flex items-center gap-3 py-3 cursor-pointer transition-colors text-left"
        >
          <i
            class="ri-edit-box-line text-lg text-gray-500 dark:text-gray-300"
          ></i>
          <span class="text-sm text-gray-700 dark:text-gray-200">{{
            $t("profile.editProfile")
          }}</span>
          <i class="ri-arrow-right-s-line ml-auto text-gray-400"></i>
        </button>

        <button
          class="flex items-center gap-3 py-3 cursor-pointer transition-colors text-left"
        >
          <i
            class="ri-shopping-bag-line text-lg text-gray-500 dark:text-gray-300"
          ></i>
          <span class="text-sm text-gray-700 dark:text-gray-200">{{
            $t("profile.myOrders")
          }}</span>
          <i class="ri-arrow-right-s-line ml-auto text-gray-400"></i>
        </button>

        <hr class="border-gray-100 dark:border-surface-100 my-1" />

        <button
          class="flex items-center gap-3 py-3 cursor-pointer transition-colors text-left"
          @click="handleLogout"
        >
          <i
            :class="authStore.loading ? 'hidden' : 'block'"
            class="ri-logout-box-line text-lg text-red-400"
          ></i>
          <svg
            v-if="authStore.loading"
            class="w-4 h-4 animate-spin text-red-400"
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
          <span class="text-sm text-red-400">{{
            authStore.loading ? "Logout" : $t("profile.logout")
          }}</span>
        </button>
      </div>
    </div>
  </BaseDialog>
  <BaseDialog
    v-model="showProfile"
    :title="$t('profile.myProfile')"
    size="max-w-md"
    :z-index="60"
  >
    <ProfileView @close="showProfile = false" />
  </BaseDialog>
  <BaseDialog
    v-model="showEditProfile"
    :title="$t('profile.myProfile')"
    size="max-w-md"
    :z-index="60"
  >
    <EditeProfileView @close="showEditProfile = false" />
  </BaseDialog>
</template>
