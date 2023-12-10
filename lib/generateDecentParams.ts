import { ActionType, ChainId, TokenInfo } from '@decent.xyz/box-common';
import { UseBoxActionArgs } from '@decent.xyz/box-hooks';
import { parseUnits, zeroAddress } from 'viem';
import { usdcToken, USDC_OPTIMISM } from './constants';

export const generateBoxAmountInParams = ({
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
    throw 'no src amount inputted';
  }
  if (!connectedAddress) {
    throw 'no connected address';
  }
  if (!toAddress) {
    throw 'no to address';
  }
  if (!dstToken) {
    throw 'no dst token';
  }
  return {
    actionType: ActionType.SwapAction,
    actionConfig: makeAmountInActionConfig(
      dstToken,
      toAddress,
      srcToken,
      srcAmount
    ),
    srcToken: srcToken.address,
    dstToken: dstToken.address,
    srcChainId: srcToken.chainId,
    slippage: 1,
    dstChainId: dstToken.chainId,
    sender: connectedAddress,
  };
};

export const generateBoxAmountOutParams = ({
  dstToken,
  dstAmount,
  srcToken = usdcToken,
  connectedAddress,
  toAddress,
}: {
  dstToken: TokenInfo;
  dstAmount?: string;
  srcToken?: TokenInfo;
  connectedAddress?: string;
  toAddress?: string;
}): UseBoxActionArgs | undefined => {
  if (!dstAmount || !Number(dstAmount)) {
    throw 'no destination amount inputted';
  }
  if (!connectedAddress) {
    throw 'no connected address';
  }
  if (!toAddress) {
    throw `no to address`;
  }
  return {
    actionType: ActionType.NftMint,
    actionConfig: makeActionConfig(dstToken, toAddress, dstAmount),
    srcToken: srcToken.address,
    dstToken: dstToken.address,
    srcChainId: srcToken.chainId,
    slippage: 1, // 1%
    dstChainId: dstToken.chainId,
    sender: connectedAddress,
  };
};

export type NftDetails = {
  dstChain: ChainId;
  dstToken: string;
  address: string;
  tokenId: string;
};

export const generateSecondaryParams = (
  connectedAddress?: string,
  recipient?: string,
  nftDetails?: NftDetails
): UseBoxActionArgs | undefined => {
  const nftAddress = nftDetails?.address;
  const nftChainId = nftDetails?.dstChain;
  const tokenId = nftDetails?.tokenId;
  const nftPaymentAddress = nftDetails?.dstToken;

  if (!connectedAddress) {
    console.log('no privy address!');
    return;
  }
  if (!recipient) {
    console.log('no recipient!');
    return;
  }
  if (!nftAddress || !nftChainId) {
    console.log('no nft address w chainId inputted!');
    return;
  }
  return {
    actionType: ActionType.NftFillAsk,
    actionConfig: {
      contractAddress: nftAddress,
      chainId: nftChainId,
      recipient: recipient,
      tokenId: tokenId,
    },
    srcChainId: ChainId.OPTIMISM,
    srcToken: USDC_OPTIMISM,
    slippage: 1,
    sender: connectedAddress,
    dstChainId: nftChainId,
    dstToken: nftPaymentAddress || zeroAddress,
  };
};

const makeActionConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  dstAmount: string
) =>
  dstToken.isNative
    ? makeNativeTransferConfig(dstToken, toAddress, dstAmount)
    : makeTokenTransferConfig(dstToken, toAddress, dstAmount);

const makeTokenTransferConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  dstAmount: string
) => {
  return {
    contractAddress: dstToken.address,
    chainId: dstToken.chainId,
    cost: {
      amount: parseUnits(dstAmount, dstToken.decimals),
      isNative: false,
      tokenAddress: dstToken.address,
    },
    signature: 'function transfer(address to, uint256 amount)',
    args: [toAddress, parseUnits(dstAmount, dstToken.decimals)],
  };
};

const makeNativeTransferConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  dstAmount: string
) => {
  return {
    contractAddress: toAddress,
    chainId: dstToken.chainId,
    cost: {
      amount: parseUnits(dstAmount, dstToken.decimals),
      isNative: true as true,
    },
    signature: 'function transfer(uint256 amount)',
    args: [parseUnits(dstAmount, dstToken.decimals)],
  };
};

declare enum SwapDirection {
  EXACT_AMOUNT_IN = 'exact-amount-in',
  EXACT_AMOUNT_OUT = 'exact-amount-out',
}

const makeAmountInActionConfig = (
  dstToken: TokenInfo,
  toAddress: string,
  srcToken: TokenInfo,
  srcAmount: string
) => {
  return {
    chainId: dstToken.chainId,
    swapDirection: SwapDirection.EXACT_AMOUNT_IN,
    amount: parseUnits(srcAmount, srcToken.decimals),
    receiverAddress: toAddress,
  };
};
