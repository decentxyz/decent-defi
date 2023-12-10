import { TokenInfo, ChainId } from "@decent.xyz/box-common";
import { useDecentAmountOutQuote, useDecentAmountInQuote } from "./useDecentQuotes";
import { formatFees } from "../formatFees";
import { formatUnits } from "viem";

export function useAmtOutQuote(
  dstInput: string | null,
  dstToken: TokenInfo,
  srcToken: TokenInfo,
  srcChain: ChainId
) {
  const { actionResponse, isLoading, error } = useDecentAmountOutQuote(
    dstToken,
    dstInput ?? undefined,
    srcToken
  );

  const appFee = actionResponse?.applicationFee?.amount || 0n;
  const bridgeFee = actionResponse?.bridgeFee?.amount || 0n;
  const fees = formatFees(appFee, bridgeFee, srcChain);
  const tx = actionResponse?.tx;
  const amountIn = actionResponse?.tokenPayment?.amount || undefined;

  const srcCalcedVal = amountIn
    ? parseFloat(formatUnits(amountIn, srcToken.decimals)).toPrecision(8)
    : undefined;

  return {
    isLoading,
    srcCalcedVal,
    fees,
    tx,
    errorText: error
      ? 'Could not find routes. Try a different token pair.'
      : '',
  };
}

export function useAmtInQuote(
  srcInput: string | null,
  dstToken: TokenInfo,
  srcToken: TokenInfo,
  srcChain: ChainId
) {
  const { actionResponse, isLoading, error } = useDecentAmountInQuote(
    dstToken,
    srcInput ?? undefined,
    srcToken
  );

  const appFee = actionResponse?.applicationFee?.amount || 0n;
  const bridgeFee = actionResponse?.bridgeFee?.amount || 0n;
  const fees = formatFees(appFee, bridgeFee, srcChain);
  const tx = actionResponse?.tx;
  const amountOut = actionResponse?.amountOut?.amount || undefined;

  const dstCalcedVal = amountOut
    ? parseFloat(formatUnits(amountOut, dstToken.decimals)).toPrecision(8)
    : undefined;

  return {
    isLoading,
    dstCalcedVal,
    fees,
    tx,
    errorText: error
      ? 'Could not find routes. Try a different token pair.'
      : '',
  };
}