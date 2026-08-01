<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/authStore.js';
  import { useAlert } from '@/composables/useAlert.js';

  interface RegisterForm {
    gender: 'male' | 'female' | 'other' | null,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    password: string,
    confirmPassword: string
  }
  interface FormErrors {
    firstName?: string,
    lastName?: string,
    phoneNumber?: string,
    email?: string,
    password?: string,
    confirm?: string,
    gender?: string,
    term?: string
  }

  const registerForm = reactive<RegisterForm>({
    gender: null,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const agreedToTerms = ref<boolean>(false);
  const errors = reactive<FormErrors>({});
  const showPass = ref<boolean>(false);
  const authStore = useAuthStore();
  const emailRegx: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex: RegExp = /^(\+855|0)[1-9]\d{7,8}$/;
  const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const nameRegex: RegExp = /^[a-zA-Z\s]+$/;
  const { showAlert } = useAlert();
  
  const emit = defineEmits<{
    'go-login': [],
    'go-verify': [email: string]
  }>();
  
  onMounted(() => {
    authStore.authError = '';
  });
  const handleRegister = async(): Promise<void> => {
    (Object.keys(errors) as (keyof FormErrors)[]).forEach(e => delete errors[e]);

    let valid: boolean = true;
    if (!registerForm.gender) {
      errors.gender = 'Gender is required';
      valid = false;
    }
    if (!registerForm.firstName) {
      errors.firstName = 'First name is required';
      valid = false;
    } else if (!nameRegex.test(registerForm.firstName)) {
      errors.firstName = 'First name can only cotain letters';
      valid = false;
    } else if (registerForm.firstName.length < 2 || registerForm.firstName.length > 30 ) {
      errors.firstName = 'First name can be 2-50 characters';
      valid = false;
    }
    if (!registerForm.lastName) {
      errors.lastName = 'Last name is required';
      valid = false;
    } else if (!nameRegex.test(registerForm.lastName)) {
      errors.lastName = 'Last name can only cotain letters';
      valid = false;
    } else if (registerForm.lastName.length < 2 || registerForm.lastName.length > 30 ) {
      errors.lastName = 'First name can be 2-50 characters';
      valid = false;
    }
    if (!registerForm.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone is required';
      valid = false;
    } else if (!phoneRegex.test(registerForm.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number. (e.g., 012345678 or +85512345678)';
      valid = false;
    }
    if (!registerForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegx.test(registerForm.email)) {
      errors.email = 'Invalid email';
    }
    if (!registerForm.password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (!passwordRegex.test(registerForm.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character.';
      valid = false;
    }
    if (!registerForm.confirmPassword) {
      errors.confirm = 'Confirm password is required';
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirm = 'Passwords do not match';
      valid = false;
    }
    if (!agreedToTerms.value) {
      errors.term = 'You must agree to the terms';
      valid = false;
    }
    if (!valid) return;

    const result = await authStore.register(registerForm);
    if (result.success) {
      emit('go-verify', registerForm.email);
    } else {
      showAlert(result.message, { type: 'error' });
    }
  };
  const handleLogin = (): void => {
    emit('go-login');
  };
</script>

<template>
    <div>
        <div class="relative w-full max-w-md animate-slide-up">
            <div class="bg-white dark:bg-surface-800 rounded-3xl">
              
                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div class="flex flex-col">
                      <div class="flex gap-3">
                        <label class="label flex items-center">{{ $t('register.gender') }} <span class="text-red-700">*</span></label>
                        <div class="flex gap-4 items-center">
                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="gender" value="male" v-model="registerForm.gender" class="cursor-pointer w-4 h-4 " />
                                <span class="text-sm text-black dark:text-gray-200">{{$t('register.male')}}</span>
                            </label>

                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="gender" value="female" v-model="registerForm.gender" class="cursor-pointer w-4 h-4" />
                                <span class="text-sm text-black dark:text-gray-200">{{$t('register.female')}}</span>
                            </label>

                            <label class="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="gender" value="other" v-model="registerForm.gender" class="cursor-pointer w-4 h-4" />
                                <span class="text-sm text-black dark:text-gray-200">{{$t('register.other')}}</span>
                            </label>
                        </div>
                      </div>
                      <p v-if="errors.gender" class="error-msg">{{ errors.gender }}</p>
                    </div>
                    <div class="flex gap-2">
                        <div>
                            <label class="label">{{ $t('register.firstName') }} <span class="text-red-700">*</span></label>
                            <input v-model="registerForm.firstName" type="text" class="input" :class="{'input-error': errors.firstName}" :placeholder="$t('register.enterFirstName')" autocomplete="name" />
                            <p v-if="errors.firstName" class="error-msg">{{ errors.firstName }}</p>
                        </div>
                        <div>
                            <label class="label">{{ $t('register.lastName') }} <span class="text-red-700">*</span></label>
                            <input v-model="registerForm.lastName" type="text" class="input" :class="{'input-error': errors.firstName}" :placeholder="$t('register.enterlastName')" autocomplete="name" />
                            <p v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</p>
                        </div>
                    </div>
                    <div>
                        <label class="label">{{ $t('register.phoneNumber') }} <span class="text-red-700">*</span></label>
                        <input v-model="registerForm.phoneNumber" type="text" class="input" :class="{'input-error': errors.phoneNumber}" :placeholder="$t('register.enterPhoneNumber')" />
                        <p v-if="errors.phoneNumber" class="error-msg">{{ errors.phoneNumber }}</p>
                    </div>
                     <div>
                        <label class="label">{{ $t('register.email') }} <span class="text-red-700">*</span></label>
                        <input v-model="registerForm.email" type="email" class="input" :class="{'input-error': errors.email}" :placeholder="$t('register.enterEmail')" autocomplete="email" />
                        <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
                    </div>
                    <div>
                        <label class="label">{{$t('register.password')}} <span class="text-red-700">*</span></label>
                        <div class="relative">
                        <input
                            v-model="registerForm.password"
                            :type="showPass ? 'text' : 'password'"
                            class="input"
                            :class="{'input-error': errors.password}"
                            :placeholder="$t('register.enterPassword')"
                            autocomplete="new-password"
                        />
                        <button type="button" @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i v-if="!showPass" class="ri-eye-line"></i>
                            <i v-else class="ri-eye-off-line"></i>
                        </button>
                        </div>
                        <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
                    </div>
                    <div>
                        <label class="label">{{$t('register.confirm')}} <span class="text-red-700">*</span></label>
                        <input v-model="registerForm.confirmPassword" :type="showPass ? 'text' : 'password'" class="input" :class="{'input-error': errors.confirm}" :placeholder="$t('register.confirmPassword')" autocomplete="new-password" />
                        <p v-if="errors.confirm" class="error-msg">{{ errors.confirm }}</p>
                    </div>
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input v-model="agreedToTerms" type="checkbox" class="mt-0.5 w-4 h-4 rounded accent-primary-600 " />
                        <span class="text-sm text-gray-600">
                        {{$t('register.agree')}} <a href="#" class="text-black hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400 font-medium">Terms of Service</a> {{$t('register.and')}}
                        <a href="#" class=" hover:text-gray-900 text-black dark:text-gray-300 dark:hover:text-gray-400 font-medium">Privacy Policy</a>
                        </span>
                    </label>
                    <p v-if="errors.term" class="error-msg">{{ errors.term }}</p>
                    <button 
                        type="submit"
                        class="default-button w-full py-2 text-base flex items-center justify-center gap-2 mt-2"
                    >
                      <svg v-if="authStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                        {{ authStore.loading ? 'Creating account...' : $t('register.siginup') }}
                    </button>
                </form>
                <p class="text-center text-sm text-gray-500 mt-6">
                    {{ $t('register.accoutn') }}
                <button @click="handleLogin" type="button" class="text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400 font-semibold cursor-pointer">
                    {{ $t('register.signIn') }}
                </button>
                </p>
            </div>
        </div>
    </div>
</template>
