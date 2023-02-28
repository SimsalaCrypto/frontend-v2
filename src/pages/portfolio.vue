<script setup lang="ts">
import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import VeBalPoolTable from '@/components/contextual/pages/pools/VeBalPoolTable.vue';
import PortfolioPageHero from '@/components/heros/PortfolioPageHero.vue';
import { useLock } from '@/composables/useLock';
import StakingProvider from '@/providers/local/staking/staking.provider';
import PageHero from '@/components/heros/PageHero.vue';

// COMPOSABLES

const { lockPool, lock } = useLock();
</script>

<template>
  <StakingProvider>
    <PageHero
      :title="$t('myInvestments')"
      :subtitle="$t('portfolio')"
      :heroType="'secondary-column'"
    />

    <div class="divider" />
    <!-- <PortfolioPageHero /> -->
    <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
      <BalStack vertical>
        <div class="px-4 xl:px-0">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myLiquidityInBalancerPools') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="2xl">
          <UnstakedPoolsTable />
          <StakedPoolsTable />
          <VeBalPoolTable
            v-if="lockPool && Number(lock?.lockedAmount) > 0"
            :lock="lock"
            :lockPool="lockPool"
          />
        </BalStack>
      </BalStack>
    </div>
  </StakingProvider>
</template>

<style scoped>
.page-hero-wrapper {
  padding-right: 5rem;
  @apply flex justify-between items-center;
}

.divider {
  height: 1px;
  margin-bottom: 60px;
  max-width: calc(100% - 10rem);

  @apply mx-20 w-full bg-gray-650 dark:bg-gray-650;
}
</style>