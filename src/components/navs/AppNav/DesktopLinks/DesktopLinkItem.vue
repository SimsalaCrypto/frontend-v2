<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLinkProps } from 'vue-router';

interface Props extends RouterLinkProps {
  active: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
});

const classes = computed(() => ({
  'border-white dark:border-gray-900': !props.active,
  'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400':
    props.active,
}));
</script>

<template>
  <router-link v-bind="props" :class="['desktop-link-item', classes]">
    <slot />
  </router-link>
</template>

<style scoped>
.desktop-link-item {
  @apply h-full flex-col justify-center cursor-pointer text-black dark:text-white hover:text-red-900 dark:hover:text-red-900 flex relative overflow-hidden p-0 transition-all ease-in-out duration-500;

  font-weight: 700;
}

.desktop-link-item.router-link-active {
  @apply text-red-900 dark:text-red-900 transition-colors;
}

.desktop-link-item:hover::before {
  transform: translate3d(0, 0, 0);
}
</style>
