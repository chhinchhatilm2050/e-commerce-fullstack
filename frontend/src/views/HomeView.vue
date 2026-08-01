<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useCategoryStore } from '@/stores/categoryStore';

  const categoryStore = useCategoryStore();

  onMounted(() => {
    if (categoryStore.topLevelCategories.length === 0) {
      categoryStore.fetchTopLevelCategories();
    }
  });

  interface States {
    title: string,
    icon: string
  };
  const feature: States[] = [
    { icon: '<i class="ri-truck-fill"></i>', title: 'home.free_shipping' },
    { icon: '<i class="ri-git-repository-private-fill"></i>', title: 'home.secure_payment' },
    { icon: '<i class="ri-arrow-go-back-line"></i>', title: 'home.easy_returns' },
    { icon: '<i class="ri-cloud-fill"></i>', title: 'home.support' },
  ];
</script>

<template>
    <section>
        <div class="top-banner max-w-[1316px] mx-auto fixed right-0 left-0 z-40 h-7 bg-surface-100 dark:bg-gray-100 flex items-center justify-center">
            <p class="text-white text-sm dark:text-black">{{ $t('home.shopping') }}</p>
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
    <section class="py-5 container-xl">
      <h2 class="section-title mb-5"><i class="ri-chat-smile-ai-line"></i>  {{ $t('home.categories_title') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <RouterLink
          v-for="cat in categoryStore.topLevelCategories"
          :key="cat._id" :to="`/category/${cat.slug}`"
          class="group relative overflow-hidden aspect-[3/3] block"
        >
          <img :src="cat.image" :alt="cat.name" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <p class="text-white font-display font-bold text-lg">{{ $t(cat.name).toUpperCase() }}</p>
          </div>
      </RouterLink>
    </div>
  </section>
  <section class="py-10 bg-surface-50 dark:bg-surface-900">
    <div class="container-xl">
      <div class="flex items-end justify-between mb-10">
        <div>
          <h2 class="section-title mb-1"><i class="ri-emotion-line"></i> {{ $t('home.featured_title') }}</h2>
  
        </div>
        <RouterLink to="/products" class="default-button px-4 text-sm hidden sm:inline-flex">
           {{ $t('home.view_all') }}
        </RouterLink>
      </div>
      <!-- <LoadingSpinner v-if="productStore.loading" :message="$t('products.loading')"/>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in productStore.featuredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
          @open-review="$emit('open-review', $event)"
        />
      </div> -->
    </div>
  </section>
</template>
