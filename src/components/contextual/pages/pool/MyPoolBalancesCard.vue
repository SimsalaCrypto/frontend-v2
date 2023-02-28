<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';

import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
import useStaking from '@/composables/staking/useStaking';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { fiatValueOf, usePool } from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';
import useNetwork from '@/composables/useNetwork';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';

import PoolActionsCard from './PoolActionsCard.vue';
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { balanceFor, balances, getTokens, tokens } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { isWalletReady } = useWeb3();
const { isMigratablePool } = usePool(toRef(props, 'pool'));
const {
  userData: { stakedSharesForProvidedPool },
} = useStaking();
const { networkSlug } = useNetwork();
const router = useRouter();
const { isDesktop, isMobile } = useBreakpoints();
const { isStablePhantomPool } = usePool(toRef(props, 'pool'));

/**
 * SERVICES
 */
const poolCalculator = new PoolCalculator(
  toRef(props, 'pool'),
  tokens,
  balances,
  'exit',
  ref(false)
);

/**
 * COMPUTED
 */
const bptBalance = computed((): string =>
  bnum(balanceFor(props.pool.address))
    .plus(stakedSharesForProvidedPool.value)
    .toString()
);

const fiatValue = computed(() => fiatValueOf(props.pool, bptBalance.value));

const showMigrateButton = computed(
  () =>
    (bnum(bptBalance.value).gt(0) ||
      bnum(stakedSharesForProvidedPool.value).gt(0)) &&
    isMigratablePool(props.pool)
);

const tokenAddresses = computed((): string[] => {
  if (isStablePhantomPool.value) {
    // We're using mainToken balances for StablePhantom pools
    // so return mainTokens here so that fiat values are correct.
    return props.pool.mainTokens || [];
  }
  return props.pool.tokensList;
});

const poolTokens = computed(() =>
  Object.values(getTokens(props.pool.tokensList))
);

const propTokenAmounts = computed((): string[] => {
  const { receive } = poolCalculator.propAmountsGiven(
    bnum(bptBalance.value).plus(stakedSharesForProvidedPool.value).toString(),
    0,
    'send'
  );

  if (isStablePhantomPool.value) {
    // Return linear pool's main token balance using the price rate.
    // mainTokenBalance = linearPoolBPT * priceRate
    return props.pool.tokensList.map((address, i) => {
      if (!props.pool?.onchain?.linearPools) return '0';

      const priceRate = props.pool.onchain.linearPools[address].priceRate;

      return bnum(receive[i]).times(priceRate).toString();
    });
  }

  return receive;
});

/**
 * METHODS
 */
function navigateToPoolMigration(pool: Pool) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: POOL_MIGRATIONS_MAP[pool.id].toPoolId,
    },
    query: {
      returnRoute: 'pool',
      returnParams: JSON.stringify({ id: pool.id, networkSlug }),
    },
  });
}

function fiatLabelFor(index: number, address: string): string {
  const fiatValue = toFiat(propTokenAmounts.value[index], address);
  return fNum2(fiatValue, FNumFormats.fiat);
}
</script>

<template>
  <BalCard shadow="2xl" noPad square class="">
    <div
      :class="
        isDesktop ? 'balance-wrapper' : isMobile ? 'balance-wrapper-mobile' : ''
      "
    >
      <div class="balance-item">
        <div class="flex flex-col">
          <h5 class="uppercase balance-item-title">
            {{ $t('poolTransfer.myPoolBalancesCard.title') }}
          </h5>
          <h3 class="balance-item-value">
            <span class="money">$</span
            >{{
              isWalletReady ? fNum2(fiatValue, FNumFormats.fiat).slice(1) : '-'
            }}
          </h3>
          <h5 class="balance-item-text">
            {{ isWalletReady ? fNum2(fiatValue, FNumFormats.fiat) : '-' }}
          </h5>
        </div>
      </div>

      <div
        v-for="(address, index) in tokenAddresses"
        :key="address"
        class="balance-item"
      >
        <div class="flex flex-col">
          <div class="flex items-center">
            <div class="flex items-center">
              <BalAsset
                :address="poolTokens[index].address"
                :size="16"
                class="mr-1"
              />
              <h5 class="balance-item-title">{{ poolTokens[index].symbol }}</h5>
            </div>
          </div>

          <h5 class="balance-item-value">
            {{
              isWalletReady
                ? fNum2(propTokenAmounts[index], FNumFormats.token)
                : '-'
            }}
          </h5>

          <h5 class="balance-item-text">
            {{ isWalletReady ? fiatLabelFor(index, address) : '-' }}
          </h5>
        </div>
      </div>

      <div class="balance-item">
        <PoolActionsCard :pool="pool" :missingPrices="missingPrices" />
      </div>
    </div>
  </BalCard>
  <!-- <BalCard shadow="2xl" noPad square class="">
    <template #header>
      <div class="card-header">
        <h5>
          {{ $t('poolTransfer.myPoolBalancesCard.title') }}
        </h5>
        <h5 class="text-2xl">
          {{ isWalletReady ? fNum2(fiatValue, FNumFormats.fiat) : '-' }}
        </h5>
      </div>
    </template>
    <div v-if="showMigrateButton" class="py-2 px-4">
      <BalBtn
        color="blue"
        block
        @click.prevent="navigateToPoolMigration(props.pool)"
      >
        {{ $t('migratePool.migrateLiquidity') }}
      </BalBtn>
    </div>
    <template #footer>
      <PoolActionsCard :pool="pool" :missingPrices="missingPrices" />
    </template>
  </BalCard> -->
</template>

<style scoped>
.money {
  vertical-align: text-top;
  font-size: 14px;
}

.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}

.asset-row {
  @apply py-3 flex justify-between items-center text-lg;
}

.balance-wrapper {
  border-top: 1px solid #23262f;
  border-bottom: 1px solid #23262f;
  height: 128px;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  @apply grid;
}

.balance-wrapper-mobile {
  /* display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(4, 1fr); */
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
}

.balance-item {
  @apply relative flex flex-col justify-center lg:items-center;
  @apply lg:pl-0 pl-5 lg:pb-0 pb-5;
}

.balance-item:last-of-type {
  @apply pl-0;
}

.balance-item::before {
  content: '';
  width: 2px;
  height: 77px;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  @apply absolute dark:bg-gray-650 bg-gray-650 lg:block hidden;
}

.balance-item:last-of-type::before {
  content: unset;
}

.balance-item-divider {
  width: 2px;
  height: 77px;
  @apply dark:bg-gray-650 bg-black;
}

.balance-item-title {
  font-size: 12px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: 0.05em;
  @apply dark:text-gray-600 text-black;
}

.balance-item-value {
  font-size: 24px;
  line-height: 24px;
  font-weight: 700;
  @apply dark:text-white text-black;
}

.balance-item-text {
  font-size: 12px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: 0.05em;
  @apply uppercase dark:text-gray-600 text-black;
}
</style>

