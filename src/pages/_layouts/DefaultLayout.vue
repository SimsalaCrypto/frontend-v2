<script setup lang="ts">
import Footer from '@/components/footer/Footer.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';
const { isMobile } = useBreakpoints();
</script>

<template>
  <div>
    <div class="app-body" :style="isMobile ? { display: 'block' } : {}">
      <AppNav />
      <div class="bg-gray-50 dark:bg-gray-900">
        <router-view v-slot="{ Component }" :key="$route.path">
          <transition appear name="appear">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    <!-- <Footer /> -->
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

.app-body {
  @apply mb-8;

  min-height: calc(100vh - 2rem);
  display: grid;
  grid-template-columns: 240px 1fr;
}
</style>
