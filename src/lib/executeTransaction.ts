import { Chain, Hex } from "viem";
import { ChainId, TokenInfo, EvmTransaction, BoxActionResponse } from "@decent.xyz/box-common";
import { toast } from "react-toastify";
import { 
  generateDecentAmountInParams,
  generateDecentAmountOutParams 
} from "./generateDecentParams";
import { sendTransaction } from "@wagmi/core";

export const confirmRoute = async ({
  srcChain,
  srcToken,
  dstToken,
  setBoxActionArgs,
  updateRouteVars,
  connectedAddress,
  recipient,
  chain,
  srcInputVal,
  dstInputVal,
  privyWallet,
  continueDisabled,
  setSubmitting,
  setShowContinue,
  srcDisplay,
  signature,
  args,
}: {
  srcChain: ChainId,
  srcToken: TokenInfo,
  dstToken: TokenInfo,
  setBoxActionArgs: any,
  updateRouteVars: any,
  connectedAddress: string,
  recipient?: string,
  chain?: Chain,
  srcInputVal?: string,
  dstInputVal?: string,
  privyWallet?: any,
  continueDisabled?: boolean,
  setSubmitting?: (submitting: boolean) => void,
  setShowContinue?: (showContinue: boolean) => void,
  srcDisplay?: string,
  signature?: string,
  args?: any
}) => {
  const toAddress = recipient || connectedAddress;
  const amtOutConfig = signature ? 
    { 
      srcToken,
      dstToken: dstToken,
      dstAmount: dstInputVal,
      connectedAddress,
      toAddress,
      signature,
      args
     } : 
    { 
      srcToken,
      dstToken: dstToken,
      dstAmount: dstInputVal,
      connectedAddress,
      toAddress,
    };
 
  setBoxActionArgs(undefined);
  if (chain?.id !== srcChain) {
    toast.warning('Please switch networks.', {
      position: toast.POSITION.BOTTOM_CENTER
    })
    await privyWallet?.switchChain(srcChain)
    return;
  }
  if (continueDisabled) return;
  setSubmitting?.(true);
  updateRouteVars({
    purchaseName: `${Number(srcDisplay).toPrecision(2)} ${dstToken.symbol}`,
  }); 
  if (srcInputVal) {
    const actionArgs = generateDecentAmountInParams({
      srcToken,
      dstToken: dstToken,
      srcAmount: srcInputVal,
      connectedAddress,
      toAddress,
    });
    setBoxActionArgs(actionArgs);
    setShowContinue?.(false);
    setSubmitting?.(false);
  } else if (dstInputVal) {
    const actionArgs = generateDecentAmountOutParams(amtOutConfig);
    setBoxActionArgs(actionArgs);
    setShowContinue?.(false);
    setSubmitting?.(false);
  } else {
    setSubmitting?.(false);
    throw "Can't submit!";
  }
};

export const executeTransaction = async ({
  actionResponse,
  setSubmitting,
  setHash,
  setShowContinue
}: {
  actionResponse: BoxActionResponse | undefined,
  setSubmitting?: (submitting: boolean) => void,
  setHash?: (hash: Hex) => void,
  setShowContinue?: (showContinue: boolean) => void,
}) => {
  if (!actionResponse) {
    toast.error('Failed to fetch routes', {
      position: toast.POSITION.BOTTOM_CENTER
    });
  } else {
    setSubmitting?.(true);
    try {
      const tx = actionResponse.tx as EvmTransaction;
      const { hash } = await sendTransaction(tx);
      setSubmitting?.(false);
      setHash?.(hash);
    } catch (e) {
      toast.error('Error sending transaction.', {
        position: toast.POSITION.BOTTOM_CENTER
      });
      console.log("Error sending tx.", e);
      setShowContinue?.(true);
      setSubmitting?.(false);
    }
  }
};