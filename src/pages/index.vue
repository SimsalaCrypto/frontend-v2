<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import HomePageHero from '@/components/heros/HomePageHero.vue';
import PageHero from '@/components/heros/PageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';
import usePools from '@/composables/pools/usePools';

// COMPOSABLES
const router = useRouter();
const { appNetworkConfig } = useWeb3();
const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const { pools, isLoading, poolsIsFetchingNextPage, loadMorePools } =
  usePools(selectedTokens);
const { upToMediumBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig } = useNetwork();

const isPaginated = computed(() => pools.value.length >= 10);

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool', params: { networkSlug } });
}
</script>

<template>
  <div>
    <!-- <HomePageHero /> -->
    <div class="">
      <!-- <BalStack vertical> -->
      <div class="">
        <div class="px-4 xl:px-0 bg-gray-50 dark:bg-gray-900">
          <PageHero
            :title="$t('investmentPools')"
            :subtitle="$t('pool')"
            :heroType="'button'"
            :buttonLabel="$t('createAPool.title')"
            :buttonAction="navigateToCreatePool"
          />
          <div class="divider" />
          <!-- <h3>
            {{ networkConfig.chainName }}
            <span class="lowercase">{{ $t('pools') }}</span>
          </h3> -->
        </div>

        <div
          class="flex flex-col md:flex-row justify-between items-end lg:items-center w-full"
        >
          <TokenSearchInput
            v-model="selectedTokens"
            class="w-full md:w-2/3"
            @add="addSelectedToken"
            @remove="removeSelectedToken"
          />
        </div>
      </div>
      <PoolsTable
        :data="pools"
        :noPoolsLabel="$t('noPoolsFound')"
        :isLoading="isLoading"
        :selectedTokens="selectedTokens"
        class="mb-8"
        :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
        :isLoadingMore="poolsIsFetchingNextPage"
        :isPaginated="isPaginated"
        skeletonClass="pools-table-loading-height"
        @load-more="loadMorePools"
      />
      <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
        <FeaturedProtocols />
      </div>
      <!-- </BalStack> -->
    </div>
  </div>
</template>

<style>
.pools-table-loading-height {
  height: 40rem;
}

.divider {
  height: 1px;
  margin-bottom: 60px;
  max-width: calc(100% - 10rem);

  @apply mx-20 w-full bg-gray-650 dark:bg-gray-650;
}
</style>
