import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUsersBalances } from "@decent.xyz/box-hooks";
import { ChainId, TokenInfo } from "@decent.xyz/box-common";
import { TokenSelector } from "@decent.xyz/box-ui";
import { getAddress, isAddress } from "viem";

interface TokenSelectorComponentProps {
  disabled: boolean;
  selectedToken: TokenInfo;
  currentChain: ChainId;
  setSelectedToken: (s: TokenInfo) => void;
  wallet: string | undefined;
}

export const TokenSelectorComponent: React.FC<TokenSelectorComponentProps> = ({
  disabled,
  selectedToken,
  currentChain,
  setSelectedToken,
  wallet,
}) => {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");
  const userBalances = useUsersBalances({
    address: wallet,
    chainId: currentChain,
  });

  // match to url
  useEffect(() => {
    if (!urlToken || !isAddress(urlToken)) return;
    const formattedToken = getAddress(urlToken);
    if (selectedToken?.address === formattedToken) return;

    const matchingToken = userBalances?.tokens?.find(
      (t) => t.address === formattedToken,
    );

    if (matchingToken && matchingToken.address !== selectedToken.address) {
      setSelectedToken(matchingToken);
    }
  }, [urlToken, userBalances]);

  return (
    <div className="inline-flex items-center border border-[#BEC3C9] rounded px-1">
      <TokenSelector
        disabled={disabled}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        chainId={currentChain}
        address={wallet}
      />
    </div>
  );
};
