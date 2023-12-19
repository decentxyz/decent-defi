import { TokenSelectorComponent } from "./TokenSelectorComponent";
import ChainSelectMenu from "./ChainSelectorMenu";
import { useContext, useState } from "react";
import {
  RouteSelectContext,
} from "../lib/contexts/routeSelectContext";

export default function BuyModal({ connectedAddress }: any) {
  const REDIRECT_URL = 'https://decent.xyz';
  const { routeVars, updateRouteVars } = useContext(RouteSelectContext);
  const { dstChain, dstToken } = routeVars;

  const handleDstAmtChange = (strVal: string) => {
    if (!/^\d*\.?\d*$/.test(strVal)) return;
    setDstInputVal(strVal);
  };

  const [dstInputVal, setDstInputVal] = useState<string | null>(null);

  return (
    <>
      <div className="group mt-8 bg-white">
        <div
          className={
            "border border-t-0 p-4 rounded-b" +
            " focus-within:border-accent-purple"
          }
        >
          <div className="text-sm">
            <span className="inline-block w-16">Buy </span>
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
              <input
                className="w-full focus:outline-none"
                type="text"
                value={dstInputVal || ''}
                onChange={(e) => handleDstAmtChange(e.target.value)}
              />
              <div className="absolute right-4 text-gray-mid-light pointer-events-none">
                {dstToken.symbol}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto"></div>
      <a
        className={
          'bg-black text-white ' +
          "text-center font-medium" +
          " w-full rounded-lg p-2 mt-4" +
          " relative flex items-center justify-center"
        }
        target="_blank"
        href={`https://checkout.decent.xyz/?app=onramp&wallet=${connectedAddress}&chain=${dstChain}&token=${dstToken.address}&redir=${REDIRECT_URL}`}
      >
        Buy Crypto
      </a>
    </>
  );
}
