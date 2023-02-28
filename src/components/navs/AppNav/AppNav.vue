<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import AppIcon from '@/components/images/AppIcon.vue';
import AppLogo from '@/components/images/AppLogo.vue';
import useAlerts from '@/composables/useAlerts';
import useBreakpoints from '@/composables/useBreakpoints';
import useFathom from '@/composables/useFathom';
import useNetwork from '@/composables/useNetwork';

import AppNavActions from './AppNavActions.vue';
import AppNavAlert from './AppNavAlert.vue';
import DesktopLinks from './DesktopLinks/DesktopLinks.vue';

/**
 * STATE
 */
const appNav = ref<HTMLDivElement>();

/**
 * COMPOSABLES
 */
const { bp, isDesktop, isMobile } = useBreakpoints();
const { trackGoal, Goals } = useFathom();
const { currentAlert } = useAlerts();
const { networkSlug } = useNetwork();

/**
 * METHODS
 */
function handleScroll() {
  if (!appNav.value) return;

  if (window.scrollY === 0) {
    appNav.value.classList.remove('shadow-lg');
  } else {
    appNav.value.classList.add('shadow-lg');
  }
}

/**
 * LIFECYCLE
 */
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <AppNavAlert v-if="currentAlert" :alert="currentAlert" />
  <nav v-if="isDesktop" id="app-nav" ref="appNav" class="sticky top-0 h-20">
    <div class="flex flex-col justify-between items-center h-full">
      <div class="flex flex-col items-center h-full">
        <router-link
          :to="{ name: 'home', params: { networkSlug } }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppIcon v-if="['xs', 'sm'].includes(bp)" />
          <AppLogo v-else />
        </router-link>

        <DesktopLinks v-if="isDesktop" class="font-medium" />
      </div>

      <AppNavActions />
    </div>
  </nav>

  <nav v-if="isMobile" id="app-nav-mobile" ref="appNavMobile">
    <div class="flex justify-between align-center">
      <div class="flex flex-col items-center h-full">
        <router-link
          :to="{ name: 'home' }"
          @click="trackGoal(Goals.ClickNavLogo)"
        >
          <AppLogo />
        </router-link>
      </div>

      <AppNavActions />
    </div>
  </nav>
</template>

<style scoped>
#app-nav {
  /* transition: all 0.2s ease-in-out; */
  height: 100vh;
  padding: 0 24px 48px;
  border-right: 2px solid;

  @apply w-full z-30;
  @apply bg-white dark:bg-gray-800;
  @apply dark:border-gray-650 border-transparent;
}

#app-nav-mobile {
  @apply dark:bg-gray-900 py-3 px-4 sticky top-0;

  z-index: 20;
}
</style>
