<script setup lang="ts">
    import { watchEffect } from 'vue'
    interface NavLink {
        to: string,
        label: string,
        icon: string
    }
    const props = withDefaults(defineProps<{
        modelValue: boolean;
    }>(), {
        modelValue: false
    })

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
    }>();
    const close = () => emit('update:modelValue', false);

    const navLinks: NavLink[] = [
        { to: '/', label: 'nav.home', icon: '<i class="ri-home-wifi-fill"></i>'},
        { to: '/clothes', label: 'nav.clothes', icon: '<i class="ri-shirt-fill"></i>'},
        { to: '/electornic', label: 'nav.electronic', icon: '<i class="ri-tools-fill"></i>'},
        { to: '/book', label: 'nav.book', icon: '<i class="ri-book-3-fill"></i>'}
    ]
    watchEffect(() => {
        if (props.modelValue) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    })
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="props.modelValue" class="fixed inset-0 bg-black/40 z-40 lg:hidden" @click="close"/>
        </Transition>
        <Transition name="slide-left">
            <div v-if="props.modelValue" class="fixed top-0 left-0 h-full w-65 md:w-105 bg-white dark:bg-surface-800 z-50 lg:hidden shadow-2xl flex flex-col">
                <div class="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-surface-700">
                    <RouterLink to="/" @click="close">
                        <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] block dark:hidden cursor-pointer" src="../../assets/image/torilogo.png" alt="">
                        <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] hidden dark:block cursor-pointer" src="../../assets/image/torilogowhite.png" alt="">
                    </RouterLink>
                    <button @click="close" class="cursor-pointer hover:bg-gray-200 dark:hover:bg-surface-100 w-8 h-8 flex items-center justify-center rounded-full">
                        <i class="ri-close-large-line dark:text-gray-200"></i>
                    </button>
                </div>

                <ul class="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
                    <li v-for="link in navLinks" :key="link.to">
                       <RouterLink :to="link.to" @click="close"
                            class="flex items-center gap-2  px-4 py-3 rounded-sm font-medium hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-surface-100 transition-colors cursor-pointer"
                            active-class="bg-gray-200 dark:bg-surface-100"
                        >
                         <span v-html="link.icon"></span>   {{ $t(link.label) }}
                       </RouterLink>
                    </li>
                </ul>

                <div class="p-4 border-t border-gray-100 dark:border-surface-700">
                    <div class="flex flex-col gap-2">
                        <button @click="close"
                            class="w-full py-2.5 rounded-sm font-semibold border border-gray-300 dark:border-surface-600 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-100 transition-colors">
                            {{ $t('nav.login') }}
                        </button>
                        <button @click="close()"
                            class="w-full py-2.5 rounded-sm font-semibold default-button transition-colors cursor-pointer">
                            {{ $t('nav.register') }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
    .fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }
    .slide-left-enter-active, .slide-left-leave-active { transition: transform 0.3s ease; }
    .slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }
</style>