<script setup lang="ts">
  interface States {
    title: string,
    icon: string
  };
  const feature: States[] = [
    { icon: '<i class="ri-truck-fill"></i>', title: 'home.free_shipping' },
    { icon: '<i class="ri-git-repository-private-fill"></i>', title: 'home.secure_payment' },
    { icon: '<i class="ri-arrow-go-back-line"></i>', title: 'home.easy_returns' },
    { icon: '<i class="ri-cloud-fill"></i>', title: 'home.support' },
  ]
</script>

<template>
    <section>
        <div class="max-w-[1322px] mx-auto fixed  right-0 left-0 z-40  h-7 bg-surface-100 dark:bg-gray-100 flex items-center justify-center">
            <p class="text-white text-sm dark:text-black">{{$t('home.shopping')}}</p>
        </div>
        <div class="container-xl relative py-12 lg:py-18 flex md:py-15 lg:flex-row items-center flex-col">
            <div class="max-w-3xl">
                <h1 class="font-home text-surface-800 text-4xl md:text-[43px] font-bold leading-tight  lg:text-7xl mb-6 dark:text-gray-200 " style="animation-delay:0.1s">
                {{ $t('home.hero_title') }}
                </h1>
                <p class="hidden sm:block text-xl text-gray-800 mb-10 max-w-xl leading-relaxed animate-slide-up dark:text-gray-200" style="animation-delay:0.2s">
                {{ $t('home.hero_subtitle') }}
                </p>
                <div class="hidden lg:flex flex-wrap gap-4 animate-bounce-sm" style="animation-delay:0.3s">
                <RouterLink to="/products" class="default-button px-4 inline-block">
                    {{ $t('home.hero_cta') }}
                </RouterLink>
                </div>
                <div class="hidden lg:flex gap-10 mt-14 animate-slide-up" style="animation-delay:0.4s">
                    <div v-for="fea in feature" :key="fea.icon" class="flex flex-col justify-center items-center">
                        <p class="font-display text-[20px] text-gray-70 dark:text-gray-200" v-html="fea.icon"></p>
                        <p class="text-[17px] underline">{{ $t(fea.title) }}</p>
                    </div>
                </div>
            </div>
            <div class="">
                <img class="w-xl shadow-lg rounded-2xl md:w-[700px] " style="animation-delay:0.1s"
                src="https://i.pinimg.com/736x/f6/84/e4/f684e4c7793ace0258a165a38a1e86f5.jpg"
                >
            </div>
        </div>
    </section>
</template>
