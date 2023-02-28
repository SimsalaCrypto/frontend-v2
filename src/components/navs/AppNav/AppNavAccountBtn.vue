<script setup lang="ts">
import { computed } from 'vue';

import Avatar from '@/components/images/Avatar.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import { shorten } from '@/lib/utils';

import AppNavSettings from './AppNavSettings.vue';

const { bp, upToLargeBreakpoint, isDesktop, isMobile } = useBreakpoints();
const { isLoadingProfile, profile, account } = useWeb3();

const avatarSize = computed(() => {
  if (bp.value === 'sm') {
    return 35;
  } else if (['md', 'lg'].includes(bp.value)) {
    return 40;
  } else {
    return 20;
  }
});
</script>

<template>
  <p v-if="isDesktop" class="label">Wallet</p>
  <div>
    <BalPopover
      noPad
      :align="isDesktop ? 'left' : 'left'"
      :detached="isDesktop ? false : true"
      :position="isDesktop ? 'above' : 'below'"
    >
      <template #activator>
        <BalBtn
          class="text-base"
          :loading="isLoadingProfile"
          :loadingLabel="upToLargeBreakpoint ? '' : $t('connecting')"
          color="white"
          :size="upToLargeBreakpoint ? 'md' : 'sm'"
          :circle="upToLargeBreakpoint"
          :center="false"
          :style="{ background: 'transparent' }"
        >
          <Avatar
            v-if="isMobile"
            :iconURI="profile?.avatar || ''"
            :address="account"
            :size="avatarSize"
          />
          <span
            v-if="profile && profile.ens"
            class="hidden lg:inline-block pl-2"
            v-text="profile && profile.ens"
          />
          <span
            v-else
            class="hidden lg:inline-block pl-2 eth-address"
            v-text="shorten(account)"
          />
        </BalBtn>
      </template>
      <AppNavSettings />
    </BalPopover>
  </div>
</template>

<style scoped>
.label {
  color: #666c81;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 4px;
  margin-top: 24px;
  letter-spacing: 0.05em;
}

.eth-address {
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: 0.05em;

  @apply capitalize dark:text-white;
}
</style>
