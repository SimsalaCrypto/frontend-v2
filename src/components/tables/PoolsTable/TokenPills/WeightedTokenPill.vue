<script setup lang="ts">
import { PoolToken } from '@/services/pool/types';
import BalanceTooltip from './BalanceTooltip.vue';
import { isAddress } from '@ethersproject/address';

const emit = defineEmits(['click', 'submit']);

type Props = {
  hasBalance: boolean;
  symbol: string;
  weight: string;
  isSelected: boolean;
  isPicked: boolean;
  token: PoolToken;
};

withDefaults(defineProps<Props>(), {
  hasBalance: false,
  isSelected: false,
  isPicked: false,
});

function assetAttrsFor(addressOrURI: string) {
  return isAddress(addressOrURI)
    ? { address: addressOrURI }
    : { iconURI: addressOrURI };
}
</script>

<template>
  <BalTooltip
    :disabled="!hasBalance"
    class="leading-normal cursor-pointer pill-container"
    textAlign="left"
    :delayMs="50"
  >
    <template #activator>
      <div
        :class="[
          'pill',
          {
            'pill-selected': isSelected,
            'pill-picked': isPicked,
            'pill-hoverable': hasBalance,
          },
        ]"
      >
        <BalAsset
          v-bind="{ ...assetAttrsFor(token.address) }"
          :size="18"
          :class="['pill-icon']"
          @click="emit('click', token.address)"
        />
        <div v-if="hasBalance" class="balance-indicator" />
        <div class="flex flex-col items-start">
          <span
            :class="[
              {
                'font-medium': isSelected,
              },
            ]"
          >
            {{ symbol }}
          </span>
          <span class="pill-weight">
            {{ weight }}
          </span>
        </div>
      </div>
    </template>
    <BalanceTooltip :token="token" :symbol="symbol" />
  </BalTooltip>
</template>

<style scoped>
.pill {
  @apply flex items-center relative h-full;

  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  background: rgb(35 36 43);
}

.pill-selected {
  @apply ring-2 ring-blue-500 dark:ring-blue-400;
}

.pill-picked {
  @apply bg-blue-50 dark:bg-blue-500 dark:bg-opacity-20;
}

.pill-weight {
  @apply font-medium text-gray-600 dark:text-gray-600 text-xs;
  @apply mt-px ml-1;
}

.balance-indicator {
  @apply w-3 h-3;
  @apply rounded-full border-2 border-white dark:border-gray-850 group-hover:border-gray-50
    dark:group-hover:border-gray-800;
  @apply bg-green-400 dark:bg-green-500;
  @apply absolute top-0 right-0 -mt-1 -mr-1;
}

.pill-hoverable:hover,
.pill-hoverable:focus {
  @apply bg-gray-200 dark:bg-gray-900;
}
</style>
