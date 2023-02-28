<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import {
  PoolChart,
  PoolStatCards,
  PoolTransactionsCard,
  MyPoolBalancesCard,
  PoolCompositionCard,
  PoolContractDetails,
} from '@/components/contextual/pages/pool';
import StakingIncentivesCard from '@/components/contextual/pages/pool/StakingIncentivesCard/StakingIncentivesCard.vue';
import PoolLockingCard from '@/components/contextual/pages/pool/PoolLockingCard/PoolLockingCard.vue';
import ApyVisionPoolLink from '@/components/links/ApyVisionPoolLink.vue';
import PoolPageHeader from '@/components/pool/PoolPageHeader.vue';
import usePoolAprQuery from '@/composables/queries/usePoolAprQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import {
  isVeBalPool,
  preMintedBptIndex,
  removeBptFrom,
  usePool,
  tokensListExclBpt,
} from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';
import { POOLS } from '@/constants/pools';
import { getAddressFromPoolId, includesAddress } from '@/lib/utils';
import StakingProvider from '@/providers/local/staking/staking.provider';
import useHistoricalPricesQuery from '@/composables/queries/useHistoricalPricesQuery';
import { PoolToken } from '@/services/pool/types';
import InvestmentTransactions from '@/components/contextual/pages/pool/PoolTransactionsCard/InvestmentTransactions/InvestmentTransactions.vue';
import TradeTransactions from '@/components/contextual/pages/pool/PoolTransactionsCard/TradeTransactions/TradeTransactions.vue';

interface PoolPageData {
  id: string;
  activeTab: number;
  setActiveTab: any;
}

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();
const data = reactive<PoolPageData>({
  id: route.params.id as string,
  activeTab: 1,
  setActiveTab(tab) {
    this.activeTab = tab;
  },
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const { prices } = useTokens();
const { addAlert, removeAlert } = useAlerts();
const _isVeBalPool = isVeBalPool(poolId);

//#region pool query
const poolQuery = usePoolQuery(poolId, undefined, undefined);
const pool = computed(() => poolQuery.data.value);
const poolQueryLoading = computed(
  () =>
    poolQuery.isLoading.value ||
    poolQuery.isIdle.value ||
    Boolean(poolQuery.error.value)
);
const loadingPool = computed(() => poolQueryLoading.value || !pool.value);

const {
  isDeepPool,
  isStableLikePool,
  isLiquidityBootstrappingPool,
  isComposableStableLikePool,
  isStablePhantomPool,
} = usePool(poolQuery.data);
//#endregion

//#region pool snapshot query
const poolSnapshotsQuery = usePoolSnapshotsQuery(poolId, undefined, {
  refetchOnWindowFocus: false,
});
const isLoadingSnapshots = computed(
  () => poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
);

const snapshots = computed(() => poolSnapshotsQuery.data.value);
//#endregion

//#region historical prices query
const historicalPricesQuery = useHistoricalPricesQuery(
  poolId,
  undefined,
  // in order to prevent multiple coingecko requests
  { refetchOnWindowFocus: false }
);
const historicalPrices = computed(() => historicalPricesQuery.data.value);
//#endregion

//#region APR query
const aprQuery = usePoolAprQuery(poolId);
const loadingApr = computed(
  () =>
    aprQuery.isLoading.value ||
    aprQuery.isIdle.value ||
    Boolean(aprQuery.error.value)
);
const poolApr = computed(() => aprQuery.data.value);
//#endregion

//#region Intersection Observer
const intersectionSentinel = ref<HTMLDivElement | null>(null);
const isSentinelIntersected = ref(false);
let observer: IntersectionObserver | undefined;

function addIntersectionObserver(): void {
  if (
    !('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !intersectionSentinel.value
  ) {
    isSentinelIntersected.value = true;
    return;
  }

  const options = {
    rootMargin: '-100px',
  };

  const callback = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isSentinelIntersected.value = true;
      }
    });
  };
  observer = new IntersectionObserver(callback, options);
  observer.observe(intersectionSentinel.value);
}
onMounted(() => {
  addIntersectionObserver();
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
//#endregion

const noInitLiquidity = computed(
  () =>
    !loadingPool.value &&
    pool.value &&
    Number(pool.value?.totalShares || '0') === 0
);

const missingPrices = computed(() => {
  if (pool.value) {
    const tokensWithPrice = Object.keys(prices.value);

    const tokens =
      isComposableStableLikePool.value && pool.value.mainTokens
        ? pool.value.mainTokens
        : tokensListExclBpt(pool.value);

    return !tokens.every(token => includesAddress(tokensWithPrice, token));
  }
  return false;
});

const titleTokens = computed<PoolToken[]>(() => {
  if (!pool.value || !pool.value.tokens) return [];
  const { tokens } = removeBptFrom(pool.value);
  if (!tokens) return [];

  return [...tokens].sort((a, b) => Number(b.weight) - Number(a.weight));
});

const isStakablePool = computed((): boolean =>
  POOLS.Stakable.AllowList.includes(poolId)
);

const poolPremintedBptIndex = computed(() => {
  if (!pool.value) return null;
  return preMintedBptIndex(pool.value) ?? null;
});

/**
 * WATCHERS
 */
watch(poolQuery.error, () => {
  if (poolQuery.error.value) {
    addAlert({
      id: 'pool-fetch-error',
      label: t('alerts.pool-fetch-error'),
      type: AlertType.ERROR,
      persistent: true,
      action: poolQuery.refetch.value,
      actionLabel: t('alerts.retry-label'),
      priority: AlertPriority.MEDIUM,
    });
  } else {
    removeAlert('pool-fetch-error');
  }
});
</script>

<template>
  <div class="xl:container dark:text-white">
    <StakingProvider :poolAddress="getAddressFromPoolId(poolId)">
      <div class="">
        <PoolPageHeader
          class="mb-4"
          :loadingPool="loadingPool"
          :loadingApr="loadingApr"
          :pool="pool"
          :poolApr="poolApr"
          :isStableLikePool="isStableLikePool"
          :noInitLiquidity="noInitLiquidity"
          :titleTokens="titleTokens"
          :missingPrices="missingPrices"
          :isLiquidityBootstrappingPool="isLiquidityBootstrappingPool"
          :isComposableStableLikePool="isComposableStableLikePool"
        />

        <div class="hidden lg:block" />

        <div
          v-if="!isLiquidityBootstrappingPool"
          class="order-1 lg:order-2 px-4 lg:px-0"
        >
          <BalStack vertical>
            <BalLoadingBlock
              v-if="loadingPool || !pool"
              class="mb-4 h-60 pool-actions-card"
            />
            <MyPoolBalancesCard
              v-else-if="!noInitLiquidity"
              :pool="pool"
              :missingPrices="missingPrices"
              class="mb-4"
            />
          </BalStack>
        </div>

        <div class="pool-container">
          <div class="details-container">
            <div class="col-span-7 px-4 lg:px-0">
              <PoolChart
                :historicalPrices="historicalPrices"
                :snapshots="snapshots"
                :loading="isLoadingSnapshots"
                :totalLiquidity="pool?.totalLiquidity"
                :tokensList="pool ? tokensListExclBpt(pool) : []"
                :poolType="pool?.poolType"
                :poolPremintedBptIndex="poolPremintedBptIndex"
              />
            </div>

            <div class="pool-stats-cards">
              <PoolStatCards
                :pool="pool"
                :poolApr="poolApr"
                :loading="loadingPool"
                :loadingApr="loadingApr"
              />
              <!-- <ApyVisionPoolLink
                v-if="!loadingPool && pool"
                :poolId="pool.id"
                :tokens="titleTokens"
              /> -->
            </div>
          </div>

          <div id="tabs" class="id-container">
            <div class="tabs">
              <a
                :class="[data.activeTab === 1 ? 'active' : '']"
                @click="data.setActiveTab(1)"
                >Pool Composition</a
              >
              <a
                :class="[data.activeTab === 2 ? 'active' : '']"
                @click="data.setActiveTab(2)"
                >Investments</a
              >
              <a
                :class="[data.activeTab === 3 ? 'active' : '']"
                @click="data.setActiveTab(3)"
                >Trades</a
              >
            </div>

            <div class="content">
              <div v-if="data.activeTab === 1" class="">
                <BalLoadingBlock v-if="loadingPool" class="h-64" />
                <PoolCompositionCard v-else-if="pool" :pool="pool" />
              </div>
              <div v-if="data.activeTab === 2" class="">
                <div ref="intersectionSentinel" />
                <template v-if="isSentinelIntersected && pool">
                  <InvestmentTransactions :pool="pool" :loading="loadingPool" />
                </template>
              </div>
              <div v-if="data.activeTab === 3" class="">
                <BalLoadingBlock
                  v-if="loadingPool"
                  class="h-40 pool-actions-card"
                />
                <TradeTransactions
                  v-if="pool && !isStablePhantomPool && !isDeepPool"
                  :pool="pool"
                  :loading="loadingPool"
                />
                <!-- <StakingIncentivesCard
                  v-if="isStakablePool && !loadingPool && pool"
                  :pool="pool"
                  class="staking-incentives"
                />
                <PoolLockingCard
                  v-if="_isVeBalPool && !loadingPool && pool"
                  :pool="pool"
                  class="pool-locking"
                /> -->
              </div>
            </div>
          </div>

          <!-- <div class="mb-4">
              <h4 class="px-4 lg:px-0 mb-4" v-text="$t('poolComposition')" />
              <BalLoadingBlock v-if="loadingPool" class="h-64" />
              <PoolCompositionCard v-else-if="pool" :pool="pool" />
            </div> -->

          <!-- <div ref="intersectionSentinel" />

            <template v-if="isSentinelIntersected && pool">
              <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
              <PoolContractDetails :pool="pool" />
            </template> -->
        </div>

        <!-- <div v-if="!isLiquidityBootstrappingPool" class="">
            <BalLoadingBlock
              v-if="loadingPool"
              class="h-40 pool-actions-card"
            />
            <StakingIncentivesCard
              v-if="isStakablePool && !loadingPool && pool"
              :pool="pool"
              class="staking-incentives"
            />
            <PoolLockingCard
              v-if="_isVeBalPool && !loadingPool && pool"
              :pool="pool"
              class="pool-locking"
            />
          </div> -->
      </div>
    </StakingProvider>
  </div>
</template>

<style scoped>
.pool-container {
  max-width: 950px;
  @apply lg:pl-20 lg:pt-20 px-5 pt-5;
}

.pool-actions-card {
  @apply relative;
}

@media (min-width: 768px) and (min-height: 600px) {
  .pool-actions-card {
    @apply sticky top-24;
  }
}

.staking-incentives :deep(.active-section) {
  @apply border-transparent;
}

/* STYLING */
.id-container {
  @apply mt-16 lg:mb-0 mb-5;
}

.details-container {
  @apply lg:grid lg:grid-cols-10 lg:gap-6 block;
}

.pool-stats-cards {
  @apply col-span-3 px-4 lg:px-0 mb-4 h-full;
}

/* Style the tabs */
.tabs {
  @apply flex;
}

.tabs a {
  cursor: pointer;
  padding: 12px 16px;
  transition: background-color 0.2s;
  border-top: 1px solid #23262f;
  font-weight: 700;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.05em;

  @apply dark:bg-gray-900 bg-gray-900 dark:text-gray-600 text-gray-600 uppercase;
}

.tabs a:first-of-type {
  border-left: 1px solid #23262f;
  border-right: 1px solid #23262f;
  border-radius: 4px 0 0;
}

.tabs a:nth-of-type(2) {
  /* background-color: orange !important; */
  border-radius: 0;
  border-right: 1px solid #23262f;
}

.tabs a:last-child {
  border-right: 1px solid #23262f;
  border-radius: 0 4px 0 0;
}

/* Change background color of tabs on hover */
.tabs a:hover {
  @apply dark:bg-gray-650 bg-gray-650 dark:text-white text-black;
}

/* Styling for active tab */
.tabs a.active {
  /* border-bottom: 2px solid #fff; */
  cursor: default;

  @apply dark:bg-gray-650 bg-gray-650 dark:text-white text-black;
}

/* Style the tab content */
.content {
  border: 1px solid #23262f;
  @apply dark:bg-gray-800 bg-gray-800;
}
</style>