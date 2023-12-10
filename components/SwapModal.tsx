import { useState, useContext, useEffect } from "react";
import { TokenSelectorComponent } from "./TokenSelectorComponent";
import ChainSelectMenu from "./ChainSelectorMenu";
import useDebounced from "@/lib/useDebounced";
import { ChainId, TokenInfo, ethGasToken } from "@decent.xyz/box-common";
import { RouteSelectContext, getDefaultToken } from "@/lib/routeSelectContext";
import { useAmtOutQuote, useAmtInQuote } from "@/lib/hooks/useReturnQuotes";
import { roundValue } from "@/lib/roundValue";
import { useBalance } from "@/lib/hooks/useBalance";
import { BoxActionContext } from '@/boxActionContext';
import {
  generateBoxAmountInParams,
  generateBoxAmountOutParams,
} from '../lib/generateDecentParams';
import { useAccount } from "wagmi";

export default function SwapModal(){
  const { address: account } = useAccount();
  const { routeVars, updateRouteVars } = useContext(RouteSelectContext);
  
  const [srcInputVal, setSrcInputVal] = useState<string | null>('');
  const [dstInputVal, setDstInputVal] = useState<string | null>('');
  const [srcInputDebounced, overrideDebouncedSrc] = useDebounced(srcInputVal);
  const [dstInputDebounced, overrideDebouncedDst] = useDebounced(dstInputVal);
  const { setBoxActionArgs } = useContext(BoxActionContext);

  const [submitting, setSubmitting] = useState(false);

  const { dstChain, dstToken } = routeVars;
  const srcToken = routeVars.srcToken;
  const srcChain = routeVars.srcChain;

  const {
    nativeBalance: srcNativeBalance,
    tokenBalance: srcTokenBalance,
  } = useBalance(account, srcToken);
  const srcTokenBalanceRounded = roundValue(srcTokenBalance, 2) ?? 0;

  const setSrcChain = (c: ChainId) => updateRouteVars({ srcChain: c });
  const setSrcToken = (t: TokenInfo) => updateRouteVars({ srcToken: t });
  useEffect(() => {
    updateRouteVars({
      srcChain: ChainId.ARBITRUM,
      srcToken: ethGasToken,
    });
  }, []);

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
  
  const srcDisplay = srcCalcedVal ?? srcInputVal ?? '';
  const dstDisplay = dstCalcedVal ?? dstInputVal ?? '';

  updateRouteVars({
    purchaseName: `${Number(srcDisplay).toPrecision(2)} ${dstToken.symbol}`,
  });

  const [submitErrorText, setSubmitErrorText] = useState('');

  const handleSrcAmtChange = (strVal: string) => {
    if (strVal == '') {
      setSrcInputVal('');
      return;
    }

    if (!/^\d*\.?\d*$/.test(strVal)) return;
    setSrcInputVal(strVal);
    setDstInputVal('');
    overrideDebouncedDst(null);
    setSubmitErrorText('');
  };

  const handleDstAmtChange = (strVal: string) => {
    if (!/^\d*\.?\d*$/.test(strVal)) return;
    setDstInputVal(strVal);
    setSrcInputVal(null);
    overrideDebouncedSrc(null);
  };

  const srcDebounceWaiting = srcInputDebounced != srcInputVal;
  const dstDebounceWaiting = dstInputDebounced != dstInputVal;

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
      const actionArgs = generateBoxAmountInParams({
        srcToken,
        dstToken: dstToken,
        srcAmount: srcInputDebounced,
        connectedAddress: account,
        toAddress: account,
      });
      setBoxActionArgs(actionArgs);
    } else if (dstInputDebounced) {
      const actionArgs = generateBoxAmountOutParams({
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
            setSrcToken(t);;
          }}
        />
      </div>

      <div className="my-4 px-2 font-medium leading-none relative text-3xl flex items-center">
        {srcSpinning && (
          <div className="absolute inset-0 rounded load-shine opacity-75" />
        )}
        <input
          className="w-full focus:outline-none rounded-sm"
          type="text"
          value={srcDisplay}
          onChange={(e) => handleSrcAmtChange(e.target.value)}
          disabled={srcSpinning || submitting}
        />
        <div className="absolute right-4 text-gray-mid-light pointer-events-none">
          {srcToken.symbol}
        </div>
        <div className="absolute top-full right-4 text-xs text-gray-mid">
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

    <button
      className={
        `${!srcInputVal && !dstInputVal ? 'bg-gray-200 text-gray-500 ' : 'bg-black text-white '}` +
        'text-center font-medium' +
        ' w-full rounded-lg p-2 mt-4' +
        ' relative flex items-center justify-center'
      }
      onClick={onConfirmClick}
      disabled={!srcInputVal && !dstInputVal || !account}
    >
      Swap
      {submitting && (
        <div className="absolute right-4 load-spinner"></div>
      )}
    </button>
  </div>
  )
}
