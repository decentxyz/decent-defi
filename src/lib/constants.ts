import { zeroAddress } from "viem";
import { ChainId, TokenInfo } from "@decent.xyz/box-common";

const polygonLogo = "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025";

export const daiLogo= 'https://static.alchemyapi.io/images/assets/4943.png'

export const polygonGasToken: TokenInfo = {
  address: zeroAddress,
  decimals: 18,
  name: "Matic",
  symbol: "MATIC",
  logo: polygonLogo,
  chainId: ChainId.POLYGON,
  isNative: true,
};

const USDCE_OPTIMISM = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

export const usdcToken: TokenInfo = {
  address: USDCE_OPTIMISM,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  logo: `https://s3.coinmarketcap.com/static-gravity/image/5a8229787b5e4c809b5914eef709b59a.png`,
  chainId: ChainId.OPTIMISM,
  isNative: false,
};

export const defaultAvailableChains = [
  ChainId.ETHEREUM,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM,
  ChainId.POLYGON,
  ChainId.BASE,
  ChainId.AVALANCHE,
];

export function getChainIcon(chainId: ChainId | number) {
  switch (chainId) {
    case (ChainId.ETHEREUM):
      return '/ethereum.svg';
    case (ChainId.OPTIMISM):
      return '/optimism.svg';
    case (ChainId.ARBITRUM):
      return '/arbitrum.svg';
    case (ChainId.POLYGON):
      return '/polygon.svg';
    case (ChainId.BASE):
      return '/base.png';
    case (ChainId.AVALANCHE):
      return '/avalanche.svg';
  }
}