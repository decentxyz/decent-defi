import { ActionType, TokenInfo } from "@decent.xyz/box-common";
import { UseBoxActionArgs } from "@decent.xyz/box-hooks";
import { parseUnits } from "viem";
import { usdcToken } from "./constants";

export const generateDecentAmountInParams = ({
  dstToken,
  srcAmount,
  srcToken = usdcToken,
  connectedAddress,
  toAddress,
}: {
  dstToken: TokenInfo;
  srcAmount?: string;
  srcToken?: TokenInfo;
  connectedAddress?: string;
  toAddress?: string;
}): UseBoxActionArgs => {
  if (!srcAmount || !Number(srcAmount)) {
    throw "no src amount inputted";
  }
  if (!connectedAddress) {
    throw "no connected address";
  }
  if (!toAddress) {
    throw "no to address";
  }
  if (!dstToken) {
    throw "no dst token";
  }
  return {
    actionType: ActionType.SwapAction,
    actionConfig: makeAmountInActionConfig(
      dstToken,
      toAddress,
      srcToken,
      srcAmount,
    ),
    srcToken: srcToken.address,
    dstToken: dstToken.address,
    srcChainId: srcToken.chainId,
    slippage: 1,
    dstChainId: dstToken.chainId,
    sender: connectedAddress,
  };
};

export const generateDecentAmountOutParams = ({
  dstToken,
  dstAmount,
  srcToken = usdcToken,
  connectedAddress,
  toAddress,
  signature,
  args
}: {
  dstToken: TokenInfo;
  dstAmount?: string;
  srcToken?: TokenInfo;
  connectedAddress?: string;
  toAddress?: string;
  signature?: string;
  args?: any;
}): UseBoxActionArgs | undefined => {
  let txConfig;
  if (!dstAmount || !Number(dstAmount)) {
    throw "no destination amount inputted";
  }
  if (!connectedAddress) {
    throw "no connected address";
  }
  if (!toAddress) {
    throw `no to address`;
  }
  if (signature) {
    txConfig = makeEvmActionConfig(dstToken, signature, args, dstAmount);
  } else {
    txConfig = makeActionConfig(dstToken, toAddress, dstAmount);
  }
  return {
    actionType: ActionType.NftMint,
    actionConfig: txConfig,
    srcToken: srcToken.address,
    dstToken: dstToken.address,
    srcChainId: srcToken.chainId,
    slippage: 1, // 1%
    dstChainId: dstToken.chainId,
    sender: connectedAddress,
  };
};

const makeActionConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  dstAmount: string,
) =>
  dstToken.isNative
    ? makeNativeTransferConfig(dstToken, toAddress, dstAmount)
    : makeTokenTransferConfig(dstToken, toAddress, dstAmount);

const makeTokenTransferConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  dstAmount: string,
) => {
  return {
    contractAddress: dstToken.address,
    chainId: dstToken.chainId,
    cost: {
      amount: parseUnits(dstAmount, dstToken.decimals),
      isNative: false,
      tokenAddress: dstToken.address,
    },
    signature: "function transfer(address to, uint256 amount)",
    args: [toAddress, parseUnits(dstAmount, dstToken.decimals)],
  };
};

const makeNativeTransferConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  dstAmount: string,
) => {
  return {
    contractAddress: toAddress,
    chainId: dstToken.chainId,
    cost: {
      amount: parseUnits(dstAmount, dstToken.decimals),
      isNative: true as true,
    },
    signature: "function transfer(uint256 amount)",
    args: [parseUnits(dstAmount, dstToken.decimals)],
  };
};

const makeEvmActionConfig = (
  dstToken: TokenInfo, 
  signature: string, 
  args: any, 
  dstAmount: string
) => {
  return {
    contractAddress: dstToken.address,
    chainId: dstToken.chainId,
    cost: {
      amount: parseUnits(dstAmount, dstToken.decimals),
      isNative: true as true,
    },
    signature,
    args,
  };
};

enum SwapDirection {
  EXACT_AMOUNT_IN = "exact-amount-in",
  EXACT_AMOUNT_OUT = "exact-amount-out",
}

const makeAmountInActionConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  srcToken: TokenInfo,
  srcAmount: string,
) => {
  return {
    chainId: dstToken.chainId,
    swapDirection: SwapDirection.EXACT_AMOUNT_IN,
    amount: parseUnits(srcAmount, srcToken.decimals),
    receiverAddress: toAddress,
  };
};
