<script setup lang="ts">
  import { useCategoryStore } from '@/stores/categoryStore';
  import { getCategoryIcon } from '@/utils/categoryIcon';
  import { ref, onMounted } from 'vue';
  interface Social {
    name: string,
    href: string,
    icon: string
  };

  interface Customer {
    to: string,
    label: string,
    icon: string
  }

  const categoryStore = useCategoryStore();
  const email = ref<string>('');
  const subscribed = ref<boolean>(false);

  onMounted(() => {
    if (categoryStore.topLevelCategories.length === 0) {
      categoryStore.fetchTopLevelCategories();
    }
  });

  const customerService: Customer[] = [
    { to: '/', label: 'footer.online', icon: '<i class="ri-cloud-fill"></i>' },
    { to: '/clothes', label: 'footer.policy', icon: '<i class="ri-spy-fill"></i>' },
    { to: '/electornic', label: 'footer.faq', icon: '<i class="ri-questionnaire-fill"></i>' },
    { to: '/book', label: 'footer.find', icon: '<i class="ri-map-pin-2-fill"></i>' },
  ];

  const socials : Social[] = [
    { name: 'Twitter', href: '#', icon: '<i class="ri-twitter-x-fill"></i>' },
    { name: 'GitHub', href: '#', icon: '<i class="ri-github-fill"></i>' },
    { name: 'Instagram', href: '#', icon: '<i class="ri-instagram-line"></i>' },
  ];

  const contactUs : Social[] = [
    { name: 'hhatstorekh@gmail.com', href: '#', icon: '<i class="ri-mail-fill"></i>' },
    { name: '(+855) 060 600 705', href: '#', icon: '<i class="ri-phone-fill"></i>' },
    { name: 'Telegram', href: '#', icon: '<i class="ri-telegram-fill"></i>' },
  ];

  const subscribe = (): void => {
    const emailRegex : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email.value)) {
      subscribed.value = true;
      email.value = '';
      setTimeout(() => { subscribed.value = false;}, 4000);
    }
  };
</script>

<template>
    <footer class="bg-white-900 text-gray-300 mt-auto ">
        <div class="container-xl px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                <div class="lg:col-span-1">
                    <RouterLink to="/" class="flex items-center group">
                        <img class="w-[90px] h-[20px]  sm:w-[140px] sm:h-[25px] block dark:hidden" src="../../assets/image/torilogo.png" alt="">
                        <img class="w-[90px] h-[20px] sm:w-[140px] sm:h-[25px] hidden dark:block" src="../../assets/image/torilogowhite.png" alt="">
                    </RouterLink>
                    <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mt-3 mb-5">
                        {{ $t('footer.tagline') }}
                    </p>
                    <div class="flex gap-3">
                        <a v-for="social in socials" :key="social.name" :href="social.href" target="_blank"
                            class="w-9 h-9 rounded-sm bg-gray-200 shadow-sm flex items-center justify-center dark:bg-surface-100  hover:text-white hover:bg-gray-400 transition-all duration-200"
                            >
                        <span v-html="social.icon" class="w-4 h-4 flex justify-center items-center dark:text-gray-200  text-gray-600"></span>
                        </a>
                    </div>
                </div>

                <div>
                    <h3 class="text-[17px] font-semibold text-gray-800 mb-4 dark:text-white">{{ $t('footer.quick_links') }}</h3>
                    <ul class="space-y-2.5">
                        <li>
                        <RouterLink to="/"
                            class="text-sm cursor-pointer flex gap-2 hover:underline dark:text-gray-200 text-gray-700 hover:text-gray-500 transition-colors"
                        >
                            <i class="ri-home-wifi-fill"></i> HOME
                        </RouterLink>
                    </li>
                        <li v-for="cat in categoryStore.topLevelCategories" :key="cat._id">
                            <RouterLink :to="`/category/${cat.slug}`" class="text-sm cursor-pointer flex gap-2 hover:underline dark:text-gray-200 text-gray-700 hover:text-gray-500 transition-colors">
                            <i :class="getCategoryIcon(cat.slug)"></i>
                            <span>{{ cat.name }}</span>
                            </RouterLink>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 class="text-[17px] font-semibold text-gray-800 mb-4 dark:text-white">{{ $t('footer.customer') }}</h3>
                    <ul class="space-y-2.5">
                    <li v-for="cus in customerService" :key="cus.label">
                        <RouterLink :to="cus.to" class="text-sm text-gray-700 cursor-pointer flex gap-2  hover:underline dark:text-gray-200 hover:text-gray-500 transition-colors"
                        >
                        <span v-html="cus.icon"></span>{{ $t(cus.label) }}
                        </RouterLink>
                    </li>
                    </ul>
                </div>

                <div>
                    <h3 class="text-[17px] font-semibold text-gray-800 mb-4 dark:text-white">{{ $t('footer.contact') }}</h3>
                    <div class="space-y-2.5">
                        <a v-for="con in contactUs" :href="con.href" :key="con.name" target="_blank" class="flex gap-2 text-gray-700 dark:text-gray-200">
                            <span v-html="con.icon"></span> <span> {{ $t(con.name) }}</span>
                        </a>
                    </div>
                </div>

                <div>
                    <h3 class="text-[17px] font-semibold text-gray-800 mb-4 dark:text-white">{{ $t('footer.newsletter') }}</h3>
                    <p class="text-sm text-gray-700 mb-4 dark:text-gray-200">{{ $t('footer.newsletter_desc') }}</p>
                    <div class="flex gap-1">
                    <input
                        v-model="email"
                        type="email"
                        :placeholder="$t('footer.email_placeholder')"
                        class= " input flex-1 "
                    />
                    <button @click="subscribe" class="default-button">
                        {{ $t('footer.subscribe') }}
                    </button>
                </div>
                <p v-if="subscribed" class="text-green-400 text-xs mt-2">✓ Subscribed successfully!</p>
                </div>

                <div>
                    <h3 class="text-[17px] font-semibold text-gray-800 mb-4 dark:text-white">{{ $t('footer.accept') }}</h3>
                    <img class="w-auto" src="https://zandokh.com/image/catalog/logo/web-footer/We-accept-payment%E2%80%93for-web-footer-2.png" alt="">
                </div>
            </div>
            <div class="border-t border-t-gray-300 dark:border-t-surface-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 dark:text-gray-200">
                <p class="text-xs text-gray-500 dark:text-gray-200">
                <i class="ri-copyright-line dark:text-gray-200"></i> {{ new Date().getFullYear() }} {{ $t('footer.rights') }} CHHATStore. 
                </p>
                <div class="flex gap-4">
                <a href="#" class="text-xs text-gray-500 dark:text-gray-200 hover:text-gray-300 transition-colors">{{ $t('footer.privacy') }}</a>
                <a href="#" class="text-xs text-gray-500 dark:text-gray-200 hover:text-gray-300 transition-colors">{{ $t('footer.terms') }}</a>
                </div>
            </div>
        </div>
    </footer>
</template>
