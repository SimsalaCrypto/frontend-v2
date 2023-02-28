<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { totalAprLabel } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/pools';
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';

/**
 * TYPES
 */
type Props = {
  pool?: Pool | null;
  poolApr: AprBreakdown | null;
  loading?: boolean;
  loadingApr?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pool: null,
  poolApr: null,
});

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const aprLabel = computed((): string => {
  const poolAPRs = props.poolApr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, props.pool?.boost);
});

const stats = computed(() => {
  return [
    {
      id: 'poolValue',
      label: t('poolValue'),
      value: fNum2(props.pool?.totalLiquidity || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'volumeTime',
      label: t('volumeTime', ['24h']),
      value: fNum2(props.pool?.volumeSnapshot || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'feesTime',
      label: t('feesTime', ['24h']),
      value: fNum2(props.pool?.feesSnapshot || '0', FNumFormats.fiat),
      loading: props.loading,
    },
    {
      id: 'apr',
      label: 'APR',
      value:
        Number(props.poolApr?.min || '0') > APR_THRESHOLD
          ? '-'
          : aprLabel.value,
      loading: props.loadingApr,
    },
  ];
});
</script>

<template>
  <div class="flex flex-col justify-between h-full">
    <template v-for="stat in stats" :key="stat.id">
      <BalLoadingBlock v-if="stat.loading || !pool" class="h-24" />
      <BalCard
        v-else
        darkBgColor="900"
        class="bg-transparent dark:bg-transparent pool-stat-card"
      >
        <div class="flex mb-2 text-sm font-medium uppercase text-secondary">
          <span>{{ stat.label }}</span>
          <APRTooltip
            v-if="stat.id === 'apr' && poolApr"
            :pool="pool"
            :poolApr="poolApr"
            hideIcon
          />
        </div>

        <p class="value">
          <span v-if="stat.value[0] === '$'" class="money">$</span
          >{{ stat.value[0] === '$' ? stat.value.slice(1) : stat.value }}
        </p>
      </BalCard>
      <div class="pool-stat-divider" />
    </template>
  </div>
</template>

<style scoped>
.money {
  vertical-align: text-top;
  font-size: 14px;
  font-weight: bold;
}

.value {
  font-size: 24px;
  font-weight: bold;
}

.pool-stat-card {
  /* background: */
}

.pool-stat-divider {
  height: 1px;
  background-color: #23262f;

  /* border-bottom: 1px solid #23262f; */
}
</style>