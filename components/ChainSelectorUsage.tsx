import { ChainId, ChainSelector } from '@decent.xyz/box-ui';
import { H2, P } from '@/components/common';

export const ChainSelectorUsage = ({
  chainId,
  setChainId,
}: {
  chainId: ChainId;
  setChainId: (c: ChainId) => void;
}) => {
  const chains = [
    ChainId.ARBITRUM,
    ChainId.OPTIMISM,
    ChainId.GOERLI,
    ChainId.BASE,
  ];

  return (
    <div>
      <div className={'mt-10'}>
        <H2>Chain Selector</H2>
      </div>
      <div className={'mb-5 flex'}>
        <div className={'flex bg-white rounded p-3'}>
          <ChainSelector
            srcChainId={chainId}
            setSrcChainId={setChainId}
            chains={chains}
            title={"⛓️"}
          />
        </div>
      </div>
      <P>Selected Chain: {chainId}</P>
    </div>
  );
};
