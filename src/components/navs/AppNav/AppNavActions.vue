<script lang="ts" setup>
import { computed } from 'vue';

import DarkModeToggle from '@/components/btns/DarkModeToggle.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useSidebar } from '@/composables/useSidebar';
import useWeb3 from '@/services/web3/useWeb3';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavActivityBtn from './AppNavActivityBtn/AppNavActivityBtn.vue';
import AppNavNetworkSelect from './AppNavNetworkSelect.vue';
import { Goals, trackGoal } from '@/composables/useFathom';

/**
 * COMPOSABLES
 */
const { isMobile, isDesktop } = useBreakpoints();
const { account, connector, startConnectWithInjectedProvider } = useWeb3();
const { setSidebarOpen } = useSidebar();

/**
 * COMPUTED
 */
const hideNetworkSelect = computed(() => connector.value?.id === 'gnosis');

/**
 * METHODS
 */
</script>

<template>
  <div :class="isMobile ? 'actions-mobile' : 'actions-desktop'">
    <AppNavNetworkSelect v-if="!hideNetworkSelect" />

    <AppNavAccountBtn v-if="account" />

    <div v-else>
      <p v-if="isDesktop" class="label">Wallet</p>
      <BalBtn
        color="white"
        :size="isMobile ? 'md' : 'sm'"
        :center="false"
        @click="startConnectWithInjectedProvider"
      >
        <WalletIcon class="mr-2" :style="{ marginLeft: '8px' }" />
        <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
        <span class="lg:hidden" v-text="$t('connect')" />
      </BalBtn>
    </div>

    <BalBtn
      v-if="isMobile"
      color="white"
      flat
      circle
      :center="false"
      :style="{ marginLeft: '12px' }"
      @click="setSidebarOpen(true)"
    >
      <BalIcon name="menu" size="lg" />
    </BalBtn>
  </div>
</template>

<style scoped>
.actions-mobile {
  @apply flex items-center gap-2;
}

.actions-desktop {
  @apply flex flex-col flex-1 w-full;
}

.app-nav-actions {
  flex: 1;
}

.label {
  color: #666c81;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 4px;
  margin-top: 24px;
  letter-spacing: 0.05em;
}
</style>