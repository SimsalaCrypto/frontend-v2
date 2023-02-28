<template>
  <div>
    <div :class="['bal-tab-container text-secondary', containerClasses]">
      <div
        v-for="(tab, i) in tabs"
        :key="i"
        :class="['bal-tab font-medium', stateClasses(tab)]"
        @click="onClick(tab)"
      >
        {{ tab.label }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

interface Tab {
  value: string | number;
  label: string;
}

export default defineComponent({
  name: 'BalTabs',

  props: {
    tabs: { type: Array as PropType<Tab[]>, required: true },
    modelValue: { type: [String, Number], default: '' },
    noPad: { type: Boolean, default: false },
  },

  emits: ['selected', 'update:modelValue'],

  setup(props, { emit }) {
    function isActiveTab(tab: Tab): boolean {
      return props.modelValue === tab.value;
    }

    function onClick(tab: Tab) {
      emit('selected', tab.value);
      emit('update:modelValue', tab.value);
    }

    const containerClasses = computed(() => {
      return {
        'px-4': !props.noPad,
      };
    });

    function stateClasses(tab: Tab): Record<string, boolean> {
      return {
        'dark:bg-gray-650 text-black dark:text-white rounded px-4 py-2 hover:text-blue-500 dark:border-blue-500 font-semibold':
          isActiveTab(tab),
        'hover:text-black dark:hover:text-white px-4 py-2 dark:border-gray-700 transition-colors':
          !isActiveTab(tab),
      };
    }

    return {
      onClick,
      containerClasses,
      stateClasses,
    };
  },
});
</script>

<style>
.bal-tab {
  @apply -mb-px mr-6 py-3 cursor-pointer;
}

.bal-tab:last-child {
  @apply mr-0;
}

.bal-tab-container {
  @apply flex p-2 rounded uppercase bg-gray-900;
}
</style>
