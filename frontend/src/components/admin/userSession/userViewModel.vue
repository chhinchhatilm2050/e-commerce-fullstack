<script setup lang="ts">
  import type { User } from '@/types/user';
  import { watchEffect } from 'vue';

  const props = defineProps<{
    isOpen: boolean;
    user: User | null;
    loading: boolean;
    promoteLoading: boolean;
    error: string | null;
  }>();

  const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'promote', userId: string): void;
  }>();

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? 'N/A'
      : parsedDate.toLocaleDateString('en-US', { dateStyle: 'long' });
  };

  watchEffect(() => {
    if (props.isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      role="presentation"
      @click.self="emit('close')"
    >
      <section
        class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-detail-title"
      >
        <header class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#cdd0d5]/70 ">
          <div>
            <h2 id="user-detail-title" class="text-base font-bold text-black/90">User Details</h2>
            <p v-if="user" class="text-xs text-black/60 mt-0.5">{{ user.email }}</p>
          </div>
          <button
            type="button"
            aria-label="Close user details"
            class="text-black/50 bg-white/70 rounded-md hover:text-slate-600 transition p-1 cursor-pointer"
            @click="emit('close')"
          >
            <i class="ri-close-line text-xl"></i>
          </button>
        </header>

        <div class="p-6 overflow-y-auto text-sm">
          <div v-if="loading" class="py-12 text-center text-black/70" role="status">
            <i class="ri-refresh-line text-xl inline-block animate-spin"></i>
            <p class="mt-2">Loading user details...</p>
          </div>

          <div v-else-if="error" class="rounded-md bg-red-50 p-4 text-red-700" role="alert">
            {{ error }}
          </div>

          <div v-else-if="user" class="space-y-5">
            <div class="flex items-center flex-col justify-center gap-1 animate-slide-up">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="`${user.firstName} ${user.lastName}`"
                class="w-16 h-16 rounded-full object-cover bg-slate-100"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold"
                aria-hidden="true"
              >
                {{ user.firstName?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div>
                <h3 class="text-lg font-semibold capitalize text-black/90">
                  {{ user.firstName }} {{ user.lastName }}
                </h3>
                <p class="text-xs text-black/60 capitalize text-center">{{ user.role }}</p>
              </div>
            </div>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md bg-[#cdd0d5]/30 p-4">
              <div>
                <dt class="text-xs text-black/60">Email</dt>
                <dd class="mt-1 break-all text-black/90">{{ user.email }}</dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Phone</dt>
                <dd class="mt-1 text-black/90">{{ user.phoneNumber || 'Not provided' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Gender</dt>
                <dd class="mt-1 capitalize text-black/90">{{ user.gender || 'Not provided' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Status</dt>
                <dd class="mt-1 capitalize text-black/90">{{ user.status }}</dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Email verification</dt>
                <dd class="mt-1 text-black/90">
                  {{ user.isVerified === undefined ? 'Unknown' : user.isVerified ? 'Verified' : 'Not verified' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Joined</dt>
                <dd class="mt-1 text-black/90">{{ formatDate(user.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Orders</dt>
                <dd class="mt-1 text-black/90">{{ user.orderCount ?? 0 }}</dd>
              </div>
              <div>
                <dt class="text-xs text-black/60">Total spent</dt>
                <dd class="mt-1 text-red-600">${{ (user.totalSpent ?? 0).toFixed(2) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <footer class="px-6 py-3 border-t border-slate-200 flex justify-between bg-[#cdd0d5]/70">
          <button
            v-if="user && user.role !== 'admin'"
            type="button"
            class="inline-flex items-center gap-1.5 subCategory-button text-sm py-1.5 bg-[#cdd0d5] text-black cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="promoteLoading"
            @click="emit('promote', user._id)"
          >
            <i v-if="promoteLoading" class="ri-refresh-line animate-spin"></i>
            <i v-else class="ri-shield-user-line"></i>
            {{ promoteLoading ? 'Promoting...' : 'Promote to Admin' }}
          </button>
          <span v-else></span>
          <button
            type="button"
            class="subCategory-button text-sm py-1.5 bg-[#cdd0d5] text-black cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
