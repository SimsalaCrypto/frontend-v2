<script setup lang="ts">
import { PoolChartPeriod } from '@/components/contextual/pages/pool/PoolChart.vue';

/**
 * TYPES
 */
type Props = {
  options: PoolChartPeriod[];
  activeOption: PoolChartPeriod;
};

const emit = defineEmits<{
  (e: 'change-option', value: PoolChartPeriod): void;
}>();

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <div class="flex overflow-hidden gap-4 mt-4 rounded-none">
    <div
      v-for="(option, index) in options"
      :key="option.days"
      class="py-1 px-2 hover:bg-gray-650 dark:hover:bg-gray-650 rounded-sm cursor-pointer"
      :class="[
        activeOption.days === option.days
          ? 'dark:bg-gray-650 bg-gray-650 dark:text-white text-red-900'
          : 'dark:bg-transparent bg-transparent dark:text-gray-600 text-black',
      ]"
      @click="emit('change-option', option)"
    >
      <div class="flex items-center font-medium">
        {{ index < 3 ? option.days : 'ALL TIME' }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
