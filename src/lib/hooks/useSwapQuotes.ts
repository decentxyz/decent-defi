import { UseBoxActionArgs, useBoxAction } from "@decent.xyz/box-hooks";
import { ChainId, TokenInfo } from "@decent.xyz/box-common";
import { formatUnits } from "viem";
import { usdcToken } from "../constants";
import {
  generateDecentAmountInParams,
  generateDecentAmountOutParams,
} from "../generateDecentParams";
import { formatFees } from "../formatFees";

type UseBoxActionReturn = ReturnType<typeof useBoxAction>;
export type BoxActionResponse = UseBoxActionReturn["actionResponse"];

const sampleAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export type DecentQuote = {
  actionResponse?: BoxActionResponse;
  paymentAmt?: number;
  isLoading?: boolean;
  error?: Error;
};

export function useAmtOutQuote(
  dstInput: string | null,
  destToken: TokenInfo,
  srcToken: TokenInfo,
  srcChain: ChainId,
) {
  const { actionResponse, isLoading, error } = useDecentAmountOutQuote(
    destToken,
    dstInput ?? undefined,
    srcToken,
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
      ? "Could not find routes. Try a different token pair."
      : "",
  };
}

export function useAmtInQuote(
  srcInput: string | null,
  destToken: TokenInfo,
  srcToken: TokenInfo,
  srcChain: ChainId,
) {
  const { actionResponse, isLoading, error } = useDecentAmountInQuote(
    destToken,
    srcInput ?? undefined,
    srcToken,
  );

  const appFee = actionResponse?.applicationFee?.amount || 0n;
  const bridgeFee = actionResponse?.bridgeFee?.amount || 0n;
  const fees = formatFees(appFee, bridgeFee, srcChain);
  const tx = actionResponse?.tx;
  const amountOut = actionResponse?.amountOut?.amount || undefined;

  const dstCalcedVal = amountOut
    ? parseFloat(formatUnits(amountOut, destToken.decimals)).toPrecision(8)
    : undefined;

  return {
    isLoading,
    dstCalcedVal,
    fees,
    tx,
    errorText: error
      ? "Could not find routes. Try a different token pair."
      : "",
  };
}

function useDecentAmountOutQuote(
  dstToken: TokenInfo,
  dstAmount?: string,
  srcToken?: TokenInfo,
  srcChainId?: ChainId,
): DecentQuote {
  let boxArgs = undefined;
  try {
    boxArgs = generateDecentAmountOutParams({
      dstToken,
      dstAmount,
      srcToken,
      connectedAddress: sampleAddress,
      toAddress: sampleAddress,
    });
  } catch (e) {
    console.log(e);
  }

  const quote = useDecentQuote(boxArgs);

  const tokenPayment = quote?.actionResponse?.tokenPayment;
  const paymentAmt = !tokenPayment
    ? undefined
    : parseFloat(formatUnits(tokenPayment.amount, usdcToken.decimals));

  return { ...quote, paymentAmt };
}

function useDecentAmountInQuote(
  dstToken: TokenInfo,
  srcAmount?: string,
  srcToken?: TokenInfo,
): DecentQuote {
  let boxArgs = undefined;
  try {
    boxArgs = generateDecentAmountInParams({
      dstToken,
      srcAmount,
      srcToken,
      connectedAddress: sampleAddress,
      toAddress: sampleAddress,
    });
  } catch (e) {
    console.log(e);
  }
  const quote = useDecentQuote(boxArgs);

  const amountOut = quote?.actionResponse?.amountOut;
  const paymentAmt = !amountOut
    ? undefined
    : parseFloat(formatUnits(amountOut.amount, dstToken?.decimals ?? 6));

  return { ...quote, paymentAmt };
}

const useDecentQuote = (boxActionArgs?: UseBoxActionArgs) => {
  const { actionResponse, isLoading, error } = useBoxAction(
    // TODO: just pass boxActionArgs when useBoxAction can handle undefined
    boxActionArgs ?? ({ enable: false } as UseBoxActionArgs),
  );

  return {
    actionResponse: actionResponse,
    isLoading: !!boxActionArgs && isLoading,
    error: error as Error,
  };
};
