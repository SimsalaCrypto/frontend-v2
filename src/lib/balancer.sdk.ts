// import { Network } from '@/constants/network';
import { isTestMode } from '@/plugins/modes';
import { configService } from '@/services/config/config.service';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { ref } from 'vue';

const network = ((): Network => {
  switch (configService.network.key) {
    case '8217':
      return Network.KLAYTN;
    case '1001':
      return Network.BAOBAB;
    case '1':
      return Network.MAINNET;
    case '5':
      return Network.GOERLI;
    case '137':
      return Network.POLYGON;
    case '42161':
      return Network.ARBITRUM;
    default:
      return Network.KLAYTN;
  }
})();

export const balancer = new BalancerSDK({
  network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
});

export const hasFetchedPoolsForSor = ref(false);

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor.value) return;

  console.time('fetchPoolsForSor');
  await balancer.swaps.fetchPools();
  hasFetchedPoolsForSor.value = true;
  console.timeEnd('fetchPoolsForSor');
}

if (!isTestMode()) fetchPoolsForSor();
