// import axios from 'axios';
// import { GWEI_UNIT } from '@/constants/units';
// import { GasPrice } from './types';

// type TxSpeedOptions = 'safeLow' | 'standard' | 'fast' | 'fast' | 'fastest';
// type BaobabEstimatedPrice = { maxPriorityFee: number; maxFee: number };

// interface BaobabGasStationResponse {
//   blockNumber: number;
//   blockTime: number;
//   estimatedBaseFee: number;
//   fast: BaobabEstimatedPrice;
//   safeLow: BaobabEstimatedPrice;
//   standard: BaobabEstimatedPrice;
// }

// export default class BaobabProvider {
//   public async getGasPrice(
//     txSpeed: TxSpeedOptions = 'standard'
//   ): Promise<GasPrice | null> {
//     try {
//       const { data } = await axios.get<BaobabGasStationResponse>(
//         'https://api.baobab.klaytn.net:8651'
//       );
//       return {
//         price: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
//         maxFeePerGas: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
//         maxPriorityFeePerGas: Math.floor(
//           data[txSpeed].maxPriorityFee * GWEI_UNIT
//         ),
//       };
//     } catch (error) {
//       console.log('[Baobab] Gas Platform Error', error);
//       return null;
//     }
//   }
// }

import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';

interface BaobabChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class BaobabChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchBaobabChainProvider('eth_gasPrice'),
        this.fetchBaobabChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Baobab-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchBaobabChainProvider(method: string) {
    const { data } = await axios.post<BaobabChainGasStationResponse>(
      configService.getNetworkRpc(Network.BAOBAB),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
