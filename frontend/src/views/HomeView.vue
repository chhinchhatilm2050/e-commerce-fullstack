<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useCategoryStore } from '@/stores/categoryStore';
  import { useProductsStore } from '@/stores/productsStore';
  import ProductSlider from '@/components/products/ProductSlider.vue';
  import { useRouter } from 'vue-router';

  const categoryStore = useCategoryStore();
  const productStore = useProductsStore();
  const router = useRouter();

  onMounted(() => {
    if (categoryStore.topLevelCategories.length === 0) {
      categoryStore.fetchTopLevelCategories();
    }
    if (productStore.featureProducts.length === 0) {
      productStore.fetchFeaturedProducts();
    }

    productStore.fetchProductSection('expensive', { sort: 'price_high', limit: '20' });
    productStore.fetchProductSection('newest', { sort: 'newest', limit: '20' });
    productStore.fetchProductSection('cheap', { sort: 'price_low', limit: '20' });
    productStore.fetchProductSection('discount_high', { sort: 'discount_high', limit: '20' });
    productStore.fetchProductSection('discount_low', { sort: 'discount_low', limit: '20' });
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

  const goToCustomerService = () => {
    router.push('/support');
  };
</script>

<template>
    <section>
        <div class="top-banner max-w-[1316px] mx-auto fixed right-0 left-0 z-40 h-7
            bg-gradient-to-r from-gray-500 via-surface-800 to-gray-500
            dark:from-surface-800 dark:via-gray-300 dark:to-surface-800
            flex items-center justify-center">
          <p class="text-white text-sm dark:text-black">{{ $t('home.shopping') }}</p>
        </div>
        <div class="container-xl relative py-12 lg:py-18 flex md:py-15 lg:flex-row items-center flex-col">
            <div class="max-w-3xl">
                <h1 class="font-home text-4xl md:text-[43px] font-bold leading-tight  lg:text-7xl mb-6 animate-slide-up bg-gradient-to-r from-surface-800 via-gray-500 to-surface-800
                  bg-clip-text text-transparent" style="animation-delay:0.3s">
                  {{ $t('home.hero_title') }}
                </h1>
                <p class="hidden sm:block text-xl text-gray-800 mb-10 max-w-xl leading-relaxed animate-slide-up dark:text-gray-200" style="animation-delay:0.5s">
                {{ $t('home.hero_subtitle') }}
                </p>
                <div class="hidden lg:flex flex-wrap gap-4 animate-slide-up" style="animation-delay:0.5s">
                <RouterLink to="/category/books" class="default-button text-sm px-4 inline-block">
                    {{ $t('home.hero_cta') }}
                </RouterLink>
                </div>
                <div class="hidden lg:flex gap-10 mt-14 animate-slide-up" style="animation-delay:0.5s">
                    <div @click="goToCustomerService" v-for="fea in feature" :key="fea.icon" class="flex flex-col justify-center items-center cursor-pointer">
                        <p class="font-display text-[20px] text-gray-70 dark:text-gray-200" v-html="fea.icon"></p>
                        <p class="text-[17px] shadow-lg">{{ $t(fea.title) }}</p>
                    </div>
                </div>
            </div>
            <div class="">
                <img class="w-xl shadow-lg rounded-2xl md:w-[700px] animate-slide-up" style="animation-delay:0.5s"
                src="https://i.pinimg.com/736x/f6/84/e4/f684e4c7793ace0258a165a38a1e86f5.jpg"
                >
            </div>
        </div>
    </section>
    <section class="py-5 px-8 container-xl">
      <h2 class="section-title mb-5"><i class="ri-chat-smile-ai-line"></i>  {{ $t('home.categories_title') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style="animation-delay:0.5s">
        <RouterLink
          v-for="cat in categoryStore.topLevelCategories"
          :key="cat._id" :to="`/products/category/${cat.slug}`"
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
  <section class="mt-5">
    <ProductSlider
      :products="productStore.featureProducts"
      title="Top Rating"
      icon="ri-star-fill"
      see-more-link="/products/category/books?sort=recommend&page=1"
    />
  </section>
  <section>
    <ProductSlider
      :products="productStore.homeSections.expensive || []"
      title="Premium Picks"
      icon="ri-vip-crown-line"
      see-more-link="/products/category/books?sort=price_high&page=1"
    />
  </section>
  <section>
    <ProductSlider
    :products="productStore.homeSections.newest || []"
    title="New Arrivals"
    icon="ri-sparkling-2-line"
    see-more-link="/products/category/books?sort=newest&page=1"
  />
  </section>
  <section>
    <ProductSlider
    :products="productStore.homeSections.cheap || []"
    title="Low Price"
    icon="ri-coin-line"
    see-more-link="/products/category/books?sort=price_low&page=1"
  />
  </section>
  <section>
    <ProductSlider
    :products="productStore.homeSections.discount_high || []"
    title="High Discount"
    icon="ri-discount-percent-fill"
    see-more-link="/products/category/books?sort=discount_high&page=1"
  />
  </section>
  <section>
    <ProductSlider
    :products="productStore.homeSections.discount_low || []"
    title="Low Discount"
    icon="ri-price-tag-3-line"
    see-more-link="/products/category/books?sort=discount_low&page=1"
  />
  </section>
</template>
