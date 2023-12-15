import { zeroAddress } from "viem";
import { ChainId, TokenInfo } from "@decent.xyz/box-common";

const polygonLogo = "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025";

export const polygonGasToken: TokenInfo = {
  address: zeroAddress,
  decimals: 18,
  name: "Matic",
  symbol: "MATIC",
  logo: polygonLogo,
  chainId: ChainId.POLYGON,
  isNative: true,
};

export const USDC_OPTIMISM = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

export const usdcToken: TokenInfo = {
  address: USDC_OPTIMISM,
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