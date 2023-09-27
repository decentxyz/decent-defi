import { useAccount } from 'wagmi';
import {
  ChainId,
  ethGasToken,
  SimpleTokenSelector,
  TokenInfo,
} from '@decent.xyz/box-ui';
import { useState } from 'react';
import { useUsersBalances } from '@decent.xyz/box-hooks';
import { CodeBlock, H2, P } from '@/components/common';
import { prettyPrint } from '@/pages/boxHooks';

export const SimpleTokenSelectorUsage = ({ chainId }: { chainId: ChainId }) => {
  const { address } = useAccount();
  const [srcToken, setSrcToken] = useState<TokenInfo>(ethGasToken);

  const { tokens } = useUsersBalances({
    address: address!,
    chainId,
    enable: Boolean(address),
  });

  const header = <H2>Simple Token Selector</H2>;

  if (!address) {
    return <div>Please Connect your wallet.</div>;
  }

  return (
    <div>
      {header}
      <div>
        {tokens ? (
          <div className={'mb-5 flex'}>
            <div className={'flex bg-white rounded p-3'}>
              <SimpleTokenSelector
                srcToken={srcToken}
                setSrcToken={setSrcToken}
                tokens={tokens}
              />
            </div>
          </div>
        ) : (
          <P>Fetching your balances...</P>
        )}
      </div>
      <P>Your Selected Token: srcToken</P>
      <CodeBlock>{prettyPrint(srcToken)}</CodeBlock>
      <P>Your Fetched Balances</P>
      <CodeBlock>{prettyPrint(tokens)}</CodeBlock>
    </div>
  );
};
