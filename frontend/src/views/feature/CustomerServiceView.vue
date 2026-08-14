<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const feature = [
    { icon: '<i class="ri-truck-fill"></i>', title: 'home.free_shipping', id:'#shipping' },
    { icon: '<i class="ri-git-repository-private-fill"></i>', title: 'home.secure_payment', id:'#payment' },
    { icon: '<i class="ri-arrow-go-back-line"></i>', title: 'home.easy_returns', id:'#returns' },
    { icon: '<i class="ri-cloud-fill"></i>', title: 'home.support', id:'#support' },
  ];

  const goToShop = () => {
    router.push('/products/category/books');
  };
</script>
<template>
  <div class="container-xl px-8 py-8 animate-slide-up">
    <div class="text-center mb-16">
      <h1 class="text-4xl font-extrabold text-black/80 dark:text-white/80 tracking-tight">HOW CAN I HELP YOU?</h1>
      <p class="text-black/60 dark:text-white/60 mt-2 text-lg">Everything you need to know about shopping with CHHATStore.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      <a v-for="fea in feature" :key="fea.icon" :href="fea.id" class="p-4 border border-slate-200 dark:border-white/30 rounded-sm text-center dark:hover:border-white/70 hover:shadow-lg transition">
        <span class="block text-2xl mb-1" v-html="fea.icon"></span>
        <span class="font-semibold text-black/80 dark:text-white/80 text-sm">{{ $t(fea.title) }}</span>
      </a>
    </div>

    <div class="space-y-20">
      <section id="shipping" class="scroll-mt-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="text-black/80 dark:text-white/80">
            <i class="ri-truck-fill text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-black/80 dark:text-white/80">Free Shipping Policy</h2>
        </div>

        <div class="bg-gradient-to-r from-black/70 via-black/30 to-black/70 text-white rounded-sm p-6 mb-6 shadow-md flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">Free Delivery on Orders Over $50</h3>
            <p class="text-white/60 text-sm mt-1">Automatic threshold applied at checkout.</p>
          </div>
          <button @click="goToShop" class="mt-4 md:mt-0 subCategory-button">
            Shop Now
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="border border-slate-200 rounded-sm p-5 shadow-xl dark:border-white/30 ">
            <h4 class="font-semibold text-black/80 dark:text-white/80">Standard Delivery (3–5 Days)</h4>
            <p class="text-sm mt-1 text-black/60 dark:text-white/60">Free for orders over $50. Flat rate $4.99 otherwise.</p>
          </div>
          <div class="border border-slate-200 rounded-sm p-5 shadow-xl dark:border-white/30 ">
            <h4 class="font-semibold text-black/80 dark:text-white/80">Express Delivery (1–2 Days)</h4>
            <p class="text-sm mt-1 text-black/60 dark:text-white/60">Flat rate $12.99 at checkout.</p>
          </div>
        </div>
      </section>

      <section id="payment" class="scroll-mt-6">
        <div class="flex items-center  gap-3 mb-6">
          <div class="text-black/80 dark:text-white/80">
            <i class="ri-git-repository-private-fill text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-black/80 dark:text-white/80">Secure Payment</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-4 mb-6">
          <div class="border border-slate-200  p-5 shadow-xl dark:border-white/30  rounded-sm text-center">
            <div class="text-black/80 dark:text-white/80 font-bold mb-1">256-bit SSL</div>
            <p class="text-black/60 dark:text-white/60 text-xs">Bank-grade encryption protecting your data.</p>
          </div>
          <div class="border border-slate-200  p-5 shadow-xl dark:border-white/30  rounded-sm text-center">
            <div class="text-black/80 dark:text-white/80 font-bold mb-1">PCI-DSS Compliant</div>
            <p class="text-black/60 dark:text-white/60 text-xs">Highest payment processing standards.</p>
          </div>
          <div class="border border-slate-200  p-5 shadow-xl dark:border-white/30  rounded-sm text-center">
            <div class="text-black/80 dark:text-white/80 font-bold mb-1">Buyer Guarantee</div>
            <p class="text-black/60 dark:text-white/60 text-xs">Full refund if item isn't received.</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 items-center text-sm font-medium text-slate-600 bg-gradient-to-r from-black/70 via-black/30 to-black/70 p-4 rounded-sm">
          <span class="text-xs uppercase tracking-wider text-white/80  font-bold mr-2">Accepted Cards & Payments:</span>
          <span class="subCategory-button py-1">Visa</span>
          <span class="subCategory-button py-1">Mastercard</span>
          <span class="subCategory-button py-1">PayPal</span>
          <span class="subCategory-button py-1">Apple Pay</span>
        </div>
      </section>

      <section id="returns" class="scroll-mt-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="text-black/80 dark:text-white/80">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-black/80 dark:text-white/80">Easy Returns (30 Days)</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="p-5 shadow-xl border border-slate-200 dark:border-white/30  rounded-sm">
            <span class="inline-block w-6 h-6 rounded-full bg-black/80 dark:bg-white/80 text-white dark:text-black font-bold text-center text-xs leading-6 mb-2">1</span>
            <h4 class="font-semibold text-black/80 dark:text-white/80">Request Online</h4>
            <p class="text-black/60 dark:text-white/60 text-xs mt-1">Submit a return request from your account dashboard.</p>
          </div>
          <div class="p-5 shadow-xl border border-slate-200 dark:border-white/30  rounded-sm">
            <span class="inline-block w-6 h-6 rounded-full bg-black/80 dark:bg-white/80 text-white dark:text-black font-bold text-center text-xs leading-6 mb-2">2</span>
            <h4 class="font-semibold text-black/80 dark:text-white/80">Print Free Label</h4>
            <p class="text-black/60 dark:text-white/60 text-xs mt-1">Attach the pre-paid shipping label to your package.</p>
          </div>
          <div class="p-5 shadow-xl border border-slate-200 dark:border-white/30  rounded-sm">
            <span class="inline-block w-6 h-6 rounded-full bg-black/80 dark:bg-white/80 text-white dark:text-black font-bold text-center text-xs leading-6 mb-2">3</span>
            <h4 class="font-semibold text-black/80 dark:text-white/80">Get Refunded</h4>
            <p class="text-black/60 dark:text-white/60 text-xs mt-1">Drop off package; refunds issue within 3–5 days.</p>
          </div>
        </div>
      </section>

      <section id="support" class="scroll-mt-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="text-black/80 dark:text-white/80">
           <i class="ri-cloud-fill text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-black/80 dark:text-white/80">24/7 Customer Support</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="p-5 shadow-xl border border-slate-200 dark:border-white/30  rounded-sm text-center">
            <h4 class="font-bold text-black/80 dark:text-white/80">Live Chat</h4>
            <p class="text-black/60 dark:text-white/60 text-xs mb-3">2 min response time</p>
            <button class="block w-full subCategory-button text-sm py-1">
              Start Chat
            </button>
          </div>
          <div class="p-5 shadow-xl border border-slate-200 dark:border-white/30  rounded-sm text-center">
            <h4 class="font-bold text-black/80 dark:text-white/80">Email</h4>
            <p class="text-black/60 dark:text-white/60 text-xs mb-3">support@chhatstore.com</p>
            <a href="mailto:support@chhatstore.com" class="block w-full subCategory-button text-sm py-1">
              Send Email
            </a>
          </div>
          <div class="p-5 shadow-xl border border-slate-200 dark:border-white/30  rounded-sm text-center">
            <h4 class="font-bold text-black/80 dark:text-white/80">Phone / WhatsApp</h4>
            <p class="text-black/60 dark:text-white/60 text-xs mb-3">+91-8800-347-003</p>
            <a href="tel:+918800347003" class="block w-full subCategory-button text-sm py-1">
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
