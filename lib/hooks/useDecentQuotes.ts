import { UseBoxActionArgs, useBoxAction } from '@decent.xyz/box-hooks';
import { ChainId, TokenInfo } from '@decent.xyz/box-common';
import { formatUnits } from 'viem';
import { usdcToken } from '../constants';
import {
  generateBoxAmountInParams,
  generateBoxAmountOutParams,
} from '../generateDecentParams';

type UseBoxActionReturn = ReturnType<typeof useBoxAction>;
// TODO: can we import this from the-box?
export type BoxActionResponse = UseBoxActionReturn['actionResponse'];

const sampleAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

export type DecentQuote = {
  actionResponse?: BoxActionResponse;
  paymentAmt?: number;
  isLoading?: boolean;
  error?: Error;
};

export function useBoxAmountOutQuote(
  dstToken: TokenInfo,
  dstAmount?: string,
  srcToken?: TokenInfo,
  srcChainId?: ChainId
): DecentQuote {
  let boxArgs = undefined;
  try {
    boxArgs = generateBoxAmountOutParams({
      dstToken,
      dstAmount,
      srcToken,
      connectedAddress: sampleAddress,
      toAddress: sampleAddress,
    });
  } catch (e) {
    // console.log(e)
  }

  const quote = useBoxQuote(boxArgs);

  const tokenPayment = quote?.actionResponse?.tokenPayment;
  const paymentAmt = !tokenPayment
    ? undefined
    : parseFloat(formatUnits(tokenPayment.amount, usdcToken.decimals));

  return { ...quote, paymentAmt };
}

export function useBoxAmountInQuote(
  dstToken: TokenInfo,
  srcAmount?: string,
  srcToken?: TokenInfo
): DecentQuote {
  let boxArgs = undefined;
  try {
    boxArgs = generateBoxAmountInParams({
      dstToken,
      srcAmount,
      srcToken,
      connectedAddress: sampleAddress,
      toAddress: sampleAddress,
    });
  } catch (e) {
    // console.log(e)
  }
  const quote = useBoxQuote(boxArgs);

  const amountOut = quote?.actionResponse?.amountOut;
  const paymentAmt = !amountOut
    ? undefined
    : parseFloat(formatUnits(amountOut.amount, dstToken?.decimals ?? 6));

  return { ...quote, paymentAmt };
}

export const useBoxQuote = (boxActionArgs?: UseBoxActionArgs) => {
  const { actionResponse, isLoading, error } = useBoxAction(
    // TODO: just pass boxActionArgs when useBoxAction can handle undefined
    boxActionArgs ?? ({ enable: false } as UseBoxActionArgs)
  );

  return {
    actionResponse: actionResponse,
    isLoading: !!boxActionArgs && isLoading,
    error: error as Error,
  };
};
