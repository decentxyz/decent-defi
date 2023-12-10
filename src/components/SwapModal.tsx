import { TokenSelectorComponent } from './TokenSelectorComponent';
import ChainSelectMenu from '../components/ChainSelectorMenu';
import { useContext, useEffect, useState, Fragment } from 'react';
import { RouteSelectContext, getDefaultToken } from '../lib/contexts/routeSelectContext';
import { ChainId, ethGasToken, TokenInfo } from '@decent.xyz/box-common';
import useDebounced from '../lib/useDebounced';
import { useDecentAmountInQuote, useDecentAmountOutQuote } from '../lib/hooks/useDecentQuotes';
import { formatUnits } from 'viem';
import { BoxActionContext } from '../lib/contexts/decentActionContext';
import {
  generateDecentAmountInParams,
  generateDecentAmountOutParams,
} from '../lib/generateDecentParams';
import { roundValue } from '../lib/roundValue';
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork } from 'wagmi';
import { formatFees } from '../lib/formatFees';
import { useBalance } from '../lib/hooks/useBalance';

export default function SwapModal() {
  const { routeVars, updateRouteVars } = useContext(RouteSelectContext);
  const { address: account } = useAccount();
  const { switchNetwork } = useSwitchNetwork();

  const { dstChain, dstToken } = routeVars;
  const srcToken = routeVars.srcToken;
  const srcChain = routeVars.srcChain;
  console.log("HEREE", routeVars)
  
  const setSrcChain = (c: ChainId) => updateRouteVars({ srcChain: c });
  const setSrcToken = (t: TokenInfo) => updateRouteVars({ srcToken: t });
  useEffect(() => {
    updateRouteVars({
      srcChain: ChainId.ARBITRUM,
      srcToken: ethGasToken,
    });
  }, []);
  const { chain } = useNetwork();
  const publicClient = usePublicClient({ chainId: srcChain });
  const [hasGasFunds, setHasGasFunds] = useState<boolean>(true);

  const {
    nativeBalance: srcNativeBalance,
    tokenBalance: srcTokenBalance,
  } = useBalance(account, srcToken);
  const srcTokenBalanceRounded = roundValue(srcTokenBalance, 2) ?? 0;

  const [submitting, setSubmitting] = useState(false);
  const [submitErrorText, setSubmitErrorText] = useState('');

  const { setBoxActionArgs } = useContext(BoxActionContext);

  const handleSrcAmtChange = (strVal: string) => {
    if (strVal == '') {
      setSrcInputVal('');
      return;
    }

    if (!/^\d*\.?\d*$/.test(strVal)) return;
    setSrcInputVal(strVal);
    setDstInputVal(null);
    overrideDebouncedDst(null);
    setSubmitErrorText('');
  };

  const handleDstAmtChange = (strVal: string) => {
    if (!/^\d*\.?\d*$/.test(strVal)) return;
    setDstInputVal(strVal);
    setSrcInputVal(null);
    overrideDebouncedSrc(null);
    // setSubmitErrorText('');
  };

  const [srcInputVal, setSrcInputVal] = useState<string | null>(null);
  const [dstInputVal, setDstInputVal] = useState<string | null>(null);

  const [srcInputDebounced, overrideDebouncedSrc] = useDebounced(srcInputVal);
  const [dstInputDebounced, overrideDebouncedDst] = useDebounced(dstInputVal);

  const srcDebounceWaiting = srcInputDebounced != srcInputVal;
  const dstDebounceWaiting = dstInputDebounced != dstInputVal;

  const {
    isLoading: amtOutLoading,
    errorText: amtOutErrorText,
    fees: amtOutFees,
    tx: amtOutTx,
    srcCalcedVal,
  } = useAmtOutQuote(dstInputDebounced, dstToken, srcToken, srcChain);

  const {
    isLoading: amtInLoading,
    errorText: amtInErrorText,
    fees: amtInFees,
    tx: amtInTx,
    dstCalcedVal,
  } = useAmtInQuote(srcInputDebounced, dstToken, srcToken, srcChain);

  useEffect(() => {
    if (chain?.id !== srcChain) {
      switchNetwork?.(srcChain)
    };
  }, [srcChain]);

  useEffect(() => {
    const simulateGas = async (tx: any) => {
      try {
        setHasGasFunds(true);
        const gas = await publicClient.estimateGas({
          account,
          ...tx,
        });
      } catch (e: any) {
        e?.shortMessage?.includes('exceeds the balance')
          && setHasGasFunds(false);
      }
    }

    const runEstimates = async () => {
      if ( srcInputDebounced && amtInTx ) {
        simulateGas(amtInTx);
      } else if ( dstInputDebounced && amtOutTx ) {
        simulateGas(amtOutTx);
      }
    }

    runEstimates();
  }, [srcInputDebounced, dstInputDebounced, amtInTx, amtOutTx]);

  const srcDisplay = srcCalcedVal ?? srcInputVal ?? '';
  const dstDisplay = dstCalcedVal ?? dstInputVal ?? '';

  useEffect(() => {
    const srcNum = Number(srcDisplay);
    if (srcNum > srcTokenBalance) {
      setSubmitErrorText(
        'Insufficient funds. Try onramping to fill your wallet.'
      );
    } else if ( srcNum < srcTokenBalance && !hasGasFunds ) {
      setSubmitErrorText(
        'Insufficient funds for gas. Try onramping to fill your wallet.'
      );
    } else {
      setSubmitErrorText('');
    }
  }, [srcTokenBalance, srcDisplay]);

  const srcSpinning = amtOutLoading || dstDebounceWaiting;
  const dstSpinning = amtInLoading || srcDebounceWaiting;

  const continueDisabled =
    !!submitErrorText ||
    !!amtOutErrorText ||
    !!amtInErrorText ||
    srcSpinning ||
    dstSpinning ||
    !(Number(srcInputDebounced) || Number(dstInputDebounced)) ||
    submitting;

  const onConfirmClick = () => {
    if (continueDisabled) return;
    setSubmitting(true);
    setBoxActionArgs(undefined);
    // reconstruct box args
    updateRouteVars({
      purchaseName: `${Number(srcDisplay).toPrecision(2)} ${dstToken.symbol}`,
    });
    if (srcInputDebounced) {
      const actionArgs = generateDecentAmountInParams({
        srcToken,
        dstToken: dstToken,
        srcAmount: srcInputDebounced,
        connectedAddress: account,
        toAddress: account,
      });
      setBoxActionArgs(actionArgs);
    } else if (dstInputDebounced) {
      const actionArgs = generateDecentAmountOutParams({
        srcToken,
        dstToken: dstToken,
        dstAmount: dstInputDebounced,
        connectedAddress: account,
        toAddress: account,
      });
      setBoxActionArgs(actionArgs);
    } else {
      setSubmitting(false);
      throw "Can't submit!";
    }
  };

  return (
    <>
      <div className="group mt-8 bg-white">
        <div
          className={
            'p-4 rounded-t border' +
            ' focus-within:border-accent-purple' +
            ' group-focus-within:border-b-accent-purple'
          }
        >
          <div className="text-sm">
            <span className="inline-block w-16">Pay </span>
            <TokenSelectorComponent
              disabled={false}
              currentChain={srcChain}
              selectedToken={srcToken}
              setSelectedToken={(t) => {
                setSrcToken(t);
              }}
              wallet={account}
            />{' '}
            on{' '}
            <ChainSelectMenu
              chainId={srcChain}
              onSelectChain={(c) => {
                setSrcChain(c);
                const t = getDefaultToken(c);
                setSrcToken(t);
              }}
            />
          </div>

          <div className="my-4 px-2 font-medium leading-none relative text-3xl flex items-center">
            {srcSpinning && (
              <div className="absolute inset-0 rounded load-shine opacity-75" />
            )}
            <input
              className="w-full focus:outline-none"
              type="text"
              value={srcDisplay}
              onChange={(e) => handleSrcAmtChange(e.target.value)}
              disabled={srcSpinning || submitting}
            />
            <div className="absolute right-4 text-gray-mid-light pointer-events-none">
              {srcToken.symbol}
            </div>
            <div className="absolute right-4 top-full text-xs text-gray-mid">
              Balance: {srcTokenBalanceRounded}
            </div>
          </div>
        </div>
        <div
          className={
            'border border-t-0 p-4 rounded-b' +
            ' focus-within:border-accent-purple'
          }
        >
          <div className="text-sm">
            <span className="inline-block w-16">Receive </span>
            <TokenSelectorComponent
              disabled={false}
              currentChain={dstChain}
              selectedToken={dstToken}
              setSelectedToken={(t) => {
                updateRouteVars({ dstToken: t });
              }}
              wallet={account}
            />{' '}
            on{' '}
            <ChainSelectMenu
              chainId={dstChain}
              onSelectChain={(c) => {
                updateRouteVars({ dstChain: c });
              }}
            />
            <div className="my-4 px-2 font-medium leading-none relative text-3xl flex items-center">
              {dstSpinning && (
                <div className="absolute inset-0 rounded load-shine opacity-75" />
              )}
              <input
                className="w-full focus:outline-none"
                type="text"
                value={dstDisplay}
                onChange={(e) => handleDstAmtChange(e.target.value)}
                disabled={dstSpinning || submitting}
              />
              <div className="absolute right-4 text-gray-mid-light pointer-events-none">
                {dstToken.symbol}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 py-4 px-2 text-sm">
        {srcInputDebounced && amtInFees &&
          Object.keys(amtInFees).map((feeName) => (
            <Fragment key={feeName}>
              <div>{feeName}</div>
              <div className="text-right">{amtInFees[feeName]}</div>
            </Fragment>
          ))}

        {dstInputDebounced && amtOutFees &&
          Object.keys(amtOutFees).map((feeName) => (
            <Fragment key={feeName}>
              <div>{feeName}</div>
              <div className="text-right">{amtOutFees[feeName]}</div>
            </Fragment>
          ))}
      </div>
      <div className="mt-auto"></div>

      <button
        className={
          'bg-black text-white text-center font-medium' +
          ' w-full rounded-lg p-2 mt-4' +
          ' relative flex items-center justify-center'
        }
        onClick={onConfirmClick}
        disabled={continueDisabled}
      >
        Confirm
        {submitting && (
          <div className="absolute right-4 load-spinner"></div>
        )}
      </button>
    </>
  );
}

function useAmtInQuote(
  srcInput: string | null,
  destToken: TokenInfo,
  srcToken: TokenInfo,
  srcChain: ChainId
) {
  const { actionResponse, isLoading, error } = useDecentAmountInQuote(
    destToken,
    srcInput ?? undefined,
    srcToken
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
      ? 'Could not find routes. Try a different token pair.'
      : '',
  };
}

function useAmtOutQuote(
  dstInput: string | null,
  destToken: TokenInfo,
  srcToken: TokenInfo,
  srcChain: ChainId
) {
  const { actionResponse, isLoading, error } = useDecentAmountOutQuote(
    destToken,
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
