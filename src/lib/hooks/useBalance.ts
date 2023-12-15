import { TokenInfo, ChainId, UserTokenInfo } from "@decent.xyz/box-common";
import { useUsersBalances } from "@decent.xyz/box-hooks";
import { Address } from "viem";
import { defaultAvailableChains } from "../constants";

export function useBalance(walletAddress?: string, token?: TokenInfo) {
  const enable = !!walletAddress && !!token;

  const balances = useUsersBalances({
    address: walletAddress,
    chainId: token?.chainId ?? 1,
    enable,
  });
  const tokenBalanceInfo = balances.tokens?.find(
    (t) => t.address === token?.address,
  );

  const nativeBalanceInfo = balances.tokens?.find((t) => t.isNative);

  return {
    tokenBalance: tokenBalanceInfo?.balanceFloat || 0,
    nativeBalance: nativeBalanceInfo?.balanceFloat || 0,
  };
}

interface Balances {
  chainId: ChainId;
  tokens: UserTokenInfo[] | undefined;
}

export function useAllBalances(walletAddress: string) {
  const allBalances:Balances[] = []
  
  for (let i = 0; i < defaultAvailableChains.length; i++) {
    let balance = useUsersBalances({
      address: walletAddress,
      chainId: defaultAvailableChains[i],
      enable: true,
    });
    allBalances.push({
      chainId: defaultAvailableChains[i],
      tokens: balance.tokens,
    })
  }

  return allBalances;
}