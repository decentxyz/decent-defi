import { Layout } from '@/components/Layouts/Layout';
import {
  BoxHooksContextProvider,
  useUsersBalances,
} from '@decent.xyz/box-hooks';

import {
  ChainSelector,
  ClientRendered,
  TokenSelector,
  ChainId,
  ethGasToken,
  TokenInfo,
} from '@decent.xyz/box-ui';

import { prettyPrint } from '@/pages/boxHooks';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CodeBlock, H1, H2, P } from '@/components/common';

const ChainSelectorUsage = () => {
  const [chain, setChain] = useState<ChainId>(ChainId.ETHEREUM);
  return (
    <div>
      <div className={'mt-10'}>
        <H2>Chain Selector</H2>
      </div>
      <div className={'mb-5 flex'}>
        <div className={'flex bg-white rounded p-3'}>
          <ChainSelector srcChainId={chain} setSrcChainId={setChain} />
        </div>
      </div>
      <P>Selected Chain: {chain}</P>
    </div>
  );
};
const TokenSelectorUsage = () => {
  const { address } = useAccount();
  const chainId = ChainId.ARBITRUM;
  const [srcToken, setSrcToken] = useState<TokenInfo>(ethGasToken);

  const { tokens } = useUsersBalances({
    address: address!,
    chainId,
    enable: Boolean(address),
  });

  const header = <H2>Token Selector</H2>;

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
              <TokenSelector
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
export default function ExamplePage() {
  const { address } = useAccount();

  return (
    <Layout>
      <ClientRendered>
        <BoxHooksContextProvider
          apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
        >
          <ClientRendered>
            <BoxHooksContextProvider
              apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
            >
              <div className={'max-w-5xl '}>
                <H1>Box UI</H1>
                <P>Below you can see the usage of the box hooks.</P>
                <ChainSelectorUsage />
                <TokenSelectorUsage />
              </div>
            </BoxHooksContextProvider>
          </ClientRendered>
        </BoxHooksContextProvider>
      </ClientRendered>
    </Layout>
  );
}
