<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useRouter } from 'vue-router';

  import { API_URL } from '@/composables/useFetch.js';

  interface Errors {
    email?: string,
    password?: string,
  }
  
  const email = ref<string>('');
  const password = ref<string>('');
  const showPass = ref<boolean>(false);
  const errors = reactive<Errors>({});
  const authStore = useAuthStore();
  const router = useRouter();

  const emailRegex : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emit = defineEmits<{
    'successLogin': [],
    'go-reginster': [],
  }>();

  const handleGoogleLogin = (): void => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleGithubLoign = (): void => {
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleFacebookLogin = (): void => {
    window.location.href = `${API_URL}/auth/facebook`;
  };
  
  const handleLogin = async ( ): Promise<void> => {
    (Object.keys(errors) as (keyof Errors)[]).forEach(e => delete errors[e]);

    if (!email.value.trim()) {
      errors.email = 'Email is required';
      return;
    }
    if (!emailRegex.test(email.value)) {
      errors.email = 'Enter a valid email';
      return;
    }
    if (!password.value.trim()) {
      errors.password = 'Password is required';
      return;
    }

    const result = await authStore.login( email.value , password.value);
    if (authStore.loading) {
      setTimeout(() => authStore.loading = false, 1000);
    }
    if (result.success) {
      setTimeout(() => {router.push('/'); emit('successLogin');}, 1500);
    }
  };

  const handleGoRegister = (): void => {
    emit('go-reginster');
  };
</script>

<template>
    <div>
        <div class="relative w-full max-w-md animate-slide-up">
            <div class="bg-white dark:bg-surface-800 rounded-3xl">
                <p v-if="authStore.authError" class="default-button w-full cursor-default bg-red-50 text-sm text-red-700 mb-2 text-center">
                  {{ authStore.authError }}
                </p>
                <form @submit.prevent="handleLogin">
                    <div>
                        <label class="label">{{$t('login.email')}} <span class="text-red-700">*</span></label>
                        <input type="text" v-model="email" class="input" :class="{'input-error': errors.email}" :placeholder="$t('login.enterEmail')" autocomplete="email"/>
                        <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
                    </div>
                    <div>
                        <div class="flex mt-3 items-center justify-between mb-1.5">
                            <label class="label mb-0">{{ $t('login.password') }} <span class="text-red-700">*</span></label>
                            <a href="#" class="text-xs text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400 font-medium">{{$t('login.forgetPassword')}}</a>
                        </div>
                        <div class="relative">
                            <input v-model="password" :type="showPass ? 'text' : 'password'" :class="{'input-error': errors.password}"
                                :placeholder="$t('login.enterPassword')" autocomplete="current-password" class="input"
                            />
                            <button type="button" @click="showPass = !showPass"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <i v-if="!showPass" class="ri-eye-line"></i>
                                <i v-else class="ri-eye-off-line"></i>
                            </button>
                        </div>
                        <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
                    </div>
                    <button
                        type="submit"
                        class="default-button w-full py-2 mt-4 text-base flex items-center justify-center gap-2"
                    >
                        <svg v-if="authStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        {{ authStore.loading ? 'Loading...' : $t('login.signIn') }}
                    </button>
                </form>
                <div class="flex items-center gap-3 my-5">
                    <div class="flex-1 h-px bg-gray-200 dark:bg-surface-700"></div>
                    <span class="text-xs text-gray-400 font-medium">{{ $t('login.continous') }}</span>
                    <div class="flex-1 h-px bg-gray-200 dark:bg-surface-700"></div>
                </div>
                <div class="flex justify-center items-center flex-col gap-3">
                   <button
                        @click="handleGoogleLogin"
                        type="button"
                        class="cursor-pointer flex items-center w-full justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-surface-700 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </button> 
                    <button
                        @click="handleFacebookLogin"
                        type="button"
                        class="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-surface-700 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
                    >
                        <svg class="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.118 4.388 23.118 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.118 24 18.118 24 12.073z"/>
                        </svg>
                        Facebook
                    </button>
                    <button
                        @click="handleGithubLoign"
                        type="button"
                        class="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-surface-700 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                        </svg>
                        GitHub
                    </button>
                </div>
                <p class="text-center text-sm text-gray-500 mt-6">
                    {{ $t('login.notHave') }}
                <button type="button" class="text-gray-800 font-semibold hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400 cursor-pointer"
                    @click="handleGoRegister">
                    {{ $t('login.signUp') }}
                </button>
                </p>
            </div>
        </div>
    </div>
</template>
