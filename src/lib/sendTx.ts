import { ChainId, EvmTransaction } from "@decent.xyz/box-common";
import {
  getPublicClient,
  sendTransaction,
  waitForTransaction,
} from "@wagmi/core";
import { EstimateGasParameters, Hex, TransactionReceipt, Chain } from "viem";

export const sendTx = async ({
  account,
  activeChainId,
  srcChainId,
  actionResponseTx,
  setSrcTxReceipt,
  setHash,
  switchNetworkAsync,
}: {
  account: any;
  activeChainId: ChainId;
  srcChainId: ChainId;
  actionResponseTx: EvmTransaction;
  setSrcTxReceipt: (receipt: TransactionReceipt) => void;
  setHash: (hash: Hex) => void;
  switchNetworkAsync?: (chainId?: number) => Promise<Chain>;
}) => {
  try {
    const publicClient = getPublicClient();
    if (activeChainId !== srcChainId) {
      await switchNetworkAsync?.(srcChainId);
    }

    const tx = actionResponseTx;
    const gas = await publicClient.estimateGas({
      account,
      ...tx,
    } as unknown as EstimateGasParameters);
    const { hash } = await sendTransaction({
      ...tx,
      gas,
    });
    setHash(hash);
    // catch viem polygon error
    try {
      const receipt = await waitForTransaction({ hash });
      setSrcTxReceipt(receipt);
    } catch (e) {}
  } catch (e) {
    console.error(e);
  }
};
