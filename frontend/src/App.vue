<script setup lang="ts">
  import AppNavbar from './components/common/AppNavbar.vue';
  import AppFooter from './components/common/AppFooter.vue';
</script>

<template>
  <app-navbar/>
  <router-view/>
  <app-footer/>
</template>

<style scoped></style>
