<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';

const { isDesktop } = useBreakpoints();

type Props = {
  title: string;
  subtitle: string;
  heroType: 'default' | 'button' | 'secondary-column';
  buttonLabel?: string;
  buttonAction?: () => void;
  secondaryColumnTitle?: string;
  secondaryColumnFiat?: boolean;
  secondaryColumnSubtitle?: string;
  noPaddingLeft?: boolean;
};

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  heroType: 'default',
  buttonLabel: '',
  buttonAction() {
    console.log('no buttonAction added in PageHero');
  },
  secondaryColumnTitle: '',
  secondaryColumnFiat: false,
  secondaryColumnSubtitle: '',
  noPaddingLeft: false,
});
</script>

<template>
  <div
    class="flex justify-between items-end py-10 page-hero"
    :class="[isDesktop ? (noPaddingLeft ? 'pr-20' : 'px-20') : 'px-5']"
  >
    <div class="flex flex-col">
      <h2 class="sub-title">
        {{ subtitle }}
      </h2>
      <h1 class="title">
        {{ title }}
      </h1>
    </div>

    <div v-if="heroType === 'button'" class="w-36">
      <BalBtn color="red" size="sm" @click="buttonAction">
        {{ buttonLabel }}
      </BalBtn>
    </div>

    <div v-if="heroType === 'secondary-column'" class="flex flex-col">
      <h2 class="text-right sub-title">
        {{ secondaryColumnSubtitle }}
      </h2>
      <h1 class="title">
        <span class="">{{ secondaryColumnFiat ? '$' : '' }}</span
        ><span>{{ secondaryColumnTitle }}</span>
      </h1>
    </div>
  </div>
</template>

<style scoped>
.page-hero {
  /* // background; */
}

.money {
  vertical-align: text-top;
  font-size: 14px;
}

.sub-title {
  font-family: 'DM Sans', sans-serif;
  @apply text-xs font-bold text-red-900 capitalize text-left;
}

.title {
  font-family: good-times, sans-serif;
  font-size: 24px;
  line-height: 24px;
  @apply font-bold dark:text-white text-black uppercase;
}
</style>