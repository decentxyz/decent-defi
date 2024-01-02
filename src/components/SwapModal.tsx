import { TokenSelectorComponent } from "./TokenSelectorComponent";
import ChainSelectMenu from "../components/ChainSelectorMenu";
import { useContext, useEffect, useState, Fragment } from "react";
import {
  RouteSelectContext,
  getDefaultToken,
} from "../lib/contexts/routeSelectContext";
import {
  ChainId,
  ethGasToken,
  TokenInfo,
} from "@decent.xyz/box-common";
import useDebounced from "../lib/useDebounced";
import { useAmtInQuote, useAmtOutQuote } from "../lib/hooks/useSwapQuotes";
import { BoxActionContext } from "../lib/contexts/decentActionContext";
import { roundValue } from "../lib/roundValue";
import { useNetwork } from "wagmi";
import { Hex } from "viem";
import { useBalance } from "../lib/hooks/useBalance";
import { confirmRoute, executeTransaction } from "@/lib/executeTransaction";

export default function SwapModal({ connectedAddress, privyWallet, publicClient }: any) {
  const { routeVars, updateRouteVars } = useContext(RouteSelectContext);
  const {
    setBoxActionArgs,
    boxActionResponse: { actionResponse },
  } = useContext(BoxActionContext);

  const { chain } = useNetwork();

  const [showContinue, setShowContinue] = useState(true);
  const [hash, setHash] = useState<Hex>();

  const { dstChain, dstToken } = routeVars;
  const srcToken = routeVars.srcToken;
  const srcChain = routeVars.srcChain;

  const setSrcChain = (c: ChainId) => updateRouteVars({ srcChain: c });
  const setSrcToken = (t: TokenInfo) => updateRouteVars({ srcToken: t });
  useEffect(() => {
    updateRouteVars({
      srcChain: ChainId.ETHEREUM,
      srcToken: ethGasToken,
    });
  }, []);

  const { nativeBalance: srcNativeBalance, tokenBalance: srcTokenBalance } =
    useBalance(connectedAddress, srcToken);
  const srcTokenBalanceRounded = roundValue(srcTokenBalance, 2) ?? 0;

  const [submitting, setSubmitting] = useState(false);
  const [submitErrorText, setSubmitErrorText] = useState("");

  const handleSrcAmtChange = (strVal: string) => {
    if (strVal == "") {
      setSrcInputVal("");
      return;
    }

    if (!/^\d*\.?\d*$/.test(strVal)) return;
    setSrcInputVal(strVal);
    setDstInputVal(null);
    overrideDebouncedDst(null);
    setSubmitErrorText("");
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

  const srcDisplay = srcCalcedVal ?? srcInputVal ?? "";
  const dstDisplay = dstCalcedVal ?? dstInputVal ?? "";

  useEffect(() => {
    const srcNum = Number(srcDisplay);
    if (srcNum > srcTokenBalance) {
      setSubmitErrorText(
        "Insufficient funds. Try onramping to fill your wallet.",
      );
    } else {
      setSubmitErrorText("");
    }
  }, [srcTokenBalance, srcDisplay]);

  const srcSpinning = amtOutLoading || dstDebounceWaiting;
  const dstSpinning = amtInLoading || srcDebounceWaiting;

  const continueDisabled =
    !!submitErrorText ||
    !!amtOutErrorText ||
    !!amtInErrorText ||
    !chain ||
    srcSpinning ||
    dstSpinning ||
    !(Number(srcInputDebounced) || Number(dstInputDebounced)) ||
    submitting;
  
  const confirmDisabled = !actionResponse?.tx;

  return (
    <>
      <div className="group mt-8 bg-white">
        <div
          className={
            "p-4 rounded-t border" +
            " focus-within:border-accent-purple" +
            " group-focus-within:border-b-accent-purple"
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
                setShowContinue(true);
              }}
              wallet={connectedAddress}
            />{" "}
            on{" "}
            <ChainSelectMenu
              chainId={srcChain}
              onSelectChain={(c) => {
                setSrcChain(c);
                const t = getDefaultToken(c);
                setSrcToken(t);
                setShowContinue(true);
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
            "border border-t-0 p-4 rounded-b" +
            " focus-within:border-accent-purple"
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
              wallet={connectedAddress}
            />{" "}
            on{" "}
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
        {srcInputDebounced &&
          amtInFees &&
          Object.keys(amtInFees).map((feeName) => (
            <Fragment key={feeName}>
              <div>{feeName}</div>
              <div className="text-right">{amtInFees[feeName]}</div>
            </Fragment>
          ))}

        {dstInputDebounced &&
          amtOutFees &&
          Object.keys(amtOutFees).map((feeName) => (
            <Fragment key={feeName}>
              <div>{feeName}</div>
              <div className="text-right">{amtOutFees[feeName]}</div>
            </Fragment>
          ))}
      </div>
      <div className="text-red-500">{submitErrorText}</div>
      <div className="mt-auto"></div>
      {showContinue ? (
        <button
          className={
            `${continueDisabled ? 'bg-gray-300 text-gray-600 ' : 'bg-black text-white '}` +
            "text-center font-medium" +
            " w-full rounded-lg p-2 mt-4" +
            " relative flex items-center justify-center"
          }
          onClick={() => confirmRoute({
            chain: chain!,
            srcChain,
            srcToken,
            dstToken,
            setBoxActionArgs,
            updateRouteVars,
            srcInputVal: srcInputDebounced!,
            dstInputVal: dstInputDebounced!,
            privyWallet,
            connectedAddress,
            continueDisabled,
            setSubmitting,
            setShowContinue,
            srcDisplay,
            recipient: '0xAcCC1fe6537eb8EB56b31CcFC48Eb9363e8dd32E'
          })}
          disabled={continueDisabled}
        >
          Confirm Selections
        </button>
      ) : (
        <button
          className={
            `${confirmDisabled ? 'bg-gray-300 text-gray-600 ': 'bg-primary text-white '}` +
            "text-center font-medium" +
            " w-full rounded-lg p-2 mt-4" +
            " relative flex items-center justify-center"
          }
          disabled={confirmDisabled}
          onClick={() => executeTransaction({
            actionResponse,
            setSubmitting,
            setHash,
            setShowContinue,
            publicClient,
            connectedAddress, 
            srcChain: chain?.id!,
          })}
        >
          Swap
          {submitting && <div className="absolute right-4 load-spinner"></div>}
        </button>
      )}
      {hash && (
        <div>
          <p>{hash}</p>
        </div>
      )}
    </>
  );
}
