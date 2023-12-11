import { ChainId, TokenInfo, ethGasToken } from "@decent.xyz/box-common";
import { polygonGasToken, usdcToken } from "../constants";
import { Dispatch, PropsWithChildren, createContext, useReducer } from "react";

export const chainIcons: { [key: number]: string } = {
  [ChainId.ETHEREUM]: "/ethereum.svg",
  [ChainId.OPTIMISM]: "/optimism.svg",
  [ChainId.ARBITRUM]: "/arbitrum.svg",
  [ChainId.POLYGON]: "/polygon.svg",
  [ChainId.BASE]: "/base.png",
  [ChainId.AVALANCHE]: "/avalanche.svg",
};

export const chainNames: { [key: number]: string } = {
  [ChainId.ETHEREUM]: "Ethereum",
  [ChainId.OPTIMISM]: "OP Mainnet",
  [ChainId.ARBITRUM]: "Arbitrum One",
  [ChainId.POLYGON]: "Polygon",
  [ChainId.BASE]: "Base",
  [ChainId.AVALANCHE]: "Avalanche",
};

export type RouteVars = {
  srcChain: ChainId;
  srcToken: TokenInfo;
  dstChain: ChainId;
  dstToken: TokenInfo;
  sameChain: boolean;
  purchaseName: string;
};

export const RouteSelectContext = createContext<{
  routeVars: RouteVars;
  updateRouteVars: Dispatch<Partial<RouteVars>>;
}>({
  routeVars: {
    srcChain: ChainId.OPTIMISM,
    srcToken: ethGasToken,
    dstChain: ChainId.OPTIMISM,
    dstToken: usdcToken,
    purchaseName: "",
    sameChain: false,
  },
  updateRouteVars: () => {},
});

function routeReducer(prev: RouteVars, next: Partial<RouteVars>) {
  const newVars = { ...prev, ...next };

  if (newVars.dstChain !== prev.dstChain && !next.dstToken) {
    newVars.dstToken = getDefaultToken(newVars.dstChain);
  }

  newVars.sameChain =
    newVars.srcChain == newVars.dstChain &&
    newVars.srcToken.address == newVars.dstToken.address;

  return newVars;
}

export function getDefaultToken(chainId: ChainId) {
  if (chainId == ChainId.POLYGON || chainId == ChainId.POLYGON_TESTNET) {
    return { ...polygonGasToken, chainId };
  }
  return { ...ethGasToken, chainId };
}

export default function RouteSelectProvider({ children }: PropsWithChildren) {
  const [routeVars, updateRouteVars] = useReducer(routeReducer, {
    srcChain: ChainId.ARBITRUM,
    srcToken: ethGasToken,
    dstChain: ChainId.OPTIMISM,
    dstToken: usdcToken,
    sameChain: false,
    purchaseName: "",
  });

  const value = { routeVars, updateRouteVars };

  return (
    <RouteSelectContext.Provider value={value}>
      {children}
    </RouteSelectContext.Provider>
  );
}
