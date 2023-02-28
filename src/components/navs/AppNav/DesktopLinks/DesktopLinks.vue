<script lang="ts" setup>
import { useRoute } from 'vue-router';
import useWeb3 from '@/services/web3/useWeb3';
import DesktopLinkItem from './DesktopLinkItem.vue';
import useNetwork from '@/composables/useNetwork';
import { Goals, trackGoal } from '@/composables/useFathom';

const { isGoerli } = useWeb3();

/**
 * COMPOSABLES
 */
const route = useRoute();
const { networkSlug } = useNetwork();

/**
 * METHODS
 */
function isActive(page: string): boolean {
  if (route.name === page) return true;
  return false;
}
</script>

<template>
  <div class="desktop-links">
    <DesktopLinkItem
      :to="{ name: 'home', params: { networkSlug } }"
      :active="isActive('home')"
      @click="trackGoal(Goals.ClickNavPools)"
    >
      {{ $t('pool') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'trade', params: { networkSlug } }"
      :active="isActive('trade')"
      @click="trackGoal(Goals.ClickNavSwap)"
    >
      {{ $t('trade') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'claim', params: { networkSlug } }"
      :active="isActive('claim')"
      @click="trackGoal(Goals.ClickNavClaim)"
    >
      {{ $t('claim') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isGoerli"
      :to="{ name: 'faucet', params: { networkSlug } }"
      :active="isActive('faucet')"
    >
      Faucet
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'portfolio', params: { networkSlug } }"
      :active="isActive('portfolio')"
      @click="trackGoal(Goals.ClickNavPortfolio)"
    >
      {{ $t('portfolio') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'vebal', params: { networkSlug } }"
      :active="isActive('vebal')"
      @click="trackGoal(Goals.ClickNavVebal)"
    >
      veMSTRL
    </DesktopLinkItem>
  </div>
</template>

<style scoped>
.desktop-links {
  @apply flex flex-col gap-6;

  text-align: center;
}
</style>
