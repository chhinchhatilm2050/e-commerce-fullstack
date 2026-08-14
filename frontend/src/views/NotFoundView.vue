<script setup lang="ts">
</script>
<template>
  <div class="mt-25 flex flex-col items-center justify-center p-4 text-center font-sansn animate-slide-up">
    
    <div class="flex gap-1 items-center justify-center font-black text-8xl md:text-9xl tracking-tight select-none mb-4">
      <span class="text-black/80 dark:text-white/60">4</span>
      
      <div class="relative w-[0.8em] h-[0.8em] mx-1 flex flex-col justify-between">
        <div class="w-full h-[45%] bg-gradient-to-r from-surface-800 via-gray-500 to-surface-800 rounded-t-full"></div>
        <div class="w-full h-[45%] bg-gradient-to-r from-surface-800 via-gray-500 to-surface-800 rounded-b-full"></div>
      </div>
      
      <span class="text-black/80 dark:text-white/60">4</span>
    </div>

    <h1 class="text-3xl md:text-4xl font-bold text-black/80 dark:text-white/60 mb-3">
      Oops! <span class="bg-gradient-to-r from-surface-800 via-gray-500 to-surface-800 px-1 bg-clip-text text-transparent italic font-semibold">Page not Found</span>
    </h1>

    <p class="text-black/60 dark:text-white/60 text-sm md:text-base max-w-sm leading-relaxed mb-8">
      The page you are looking for cannot be found. Take a break before trying again.
    </p>

    <router-link
      to="/"
      class="subCategory-button"
    >
      Go to Home Page
    </router-link>

  </div>
</template>

