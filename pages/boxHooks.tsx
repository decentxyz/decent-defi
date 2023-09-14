import { Layout } from '@/components/Layouts/Layout';
import { useState } from 'react';
import {
  BoxHooksContextProvider,
  useBoxAction,
  UseBoxActionArgs,
  EvmTransaction,
  ActionType,
  bigintSerializer,
  ChainId,
  getChainExplorerTxLink,
  useBridgeReceipt,
} from '@decent.xyz/box-hooks';

import {
  EstimateGasParameters,
  Hex,
  parseUnits,
  TransactionReceipt,
} from 'viem';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { ClientRendered } from '@decent.xyz/box-ui';
import {
  getAccount,
  getPublicClient,
  sendTransaction,
  waitForTransaction,
} from '@wagmi/core';
import { Button, CodeBlock, H1, H2, P } from '@/components/common';

export const prettyPrint = (obj: any) =>
  JSON.stringify(obj, bigintSerializer, 2);

export const BoxActionUser = ({
  getActionArgs,
}: {
  getActionArgs: UseBoxActionArgs;
}) => {
  const { actionResponse, isLoading, error } = useBoxAction(getActionArgs);
  const [hash, setHash] = useState<Hex>();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { chain } = useNetwork();
  const bridgeId = actionResponse?.bridgeId;
  const { srcChainId, dstChainId } = getActionArgs;
  const [srcTxReceipt, setSrcTxReceipt] = useState<TransactionReceipt>();
  const { receipt: _dstTxReceipt } = useBridgeReceipt({
    bridgeId,
    srcChainId,
    dstChainId,
    srcTxHash: hash,
  });
  const dstTxReceipt = _dstTxReceipt as TransactionReceipt;

  if (error) {
    return <CodeBlock>Error fetching: {prettyPrint(error)}</CodeBlock>;
  }
  if (isLoading || !actionResponse) {
    return <CodeBlock>Fetching box action...</CodeBlock>;
  }

  return (
    <div className={'max-w-4xl'}>
      <CodeBlock className={'mb-4'}>{prettyPrint(actionResponse)}</CodeBlock>
      <Button
        onClick={async () => {
          try {
            const account = getAccount();
            const publicClient = getPublicClient();
            if (chain?.id !== srcChainId) {
              await switchNetworkAsync?.(srcChainId);
            }
            const tx = actionResponse.tx as EvmTransaction;
            const gas = await publicClient.estimateGas({
              account,
              ...tx,
            } as unknown as EstimateGasParameters);
            const { hash } = await sendTransaction({
              ...tx,
              gas,
            });
            setHash(hash);
            // catch viem polygon error
            try {
              const receipt = await waitForTransaction({ hash });
              setSrcTxReceipt(receipt);
            } catch (e) {}
          } catch (e) {
            console.error(e);
          }
        }}
      >
        Send This Tx!
      </Button>
      {hash && (
        <div className={'mt-6'}>
          <H2>TX Hash:</H2>
          <CodeBlock>
            {srcTxReceipt ? hash : 'Waiting for tx confirmation...'}
          </CodeBlock>
          <a
            href={getChainExplorerTxLink(srcChainId, hash)}
            className={'text-blue-500'}
          >
            view on explorer
          </a>
        </div>
      )}
      {srcTxReceipt && srcChainId !== dstChainId && (
        <div className={'mt-6'}>
          <H2>Bridged TX Hash:</H2>
          <CodeBlock>
            {dstTxReceipt
              ? dstTxReceipt.transactionHash
              : 'Waiting for bridged tx confirmation...'}
          </CodeBlock>
          {dstTxReceipt?.transactionHash && (
            <a
              href={getChainExplorerTxLink(
                dstChainId,
                dstTxReceipt?.transactionHash
              )}
              className={'text-blue-500'}
            >
              view on explorer
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export const Usage = () => {
  const { address: sender } = useAccount();

  const getActionArgs: UseBoxActionArgs = {
    actionType: ActionType.NftMint,
    actionConfig: {
      contractAddress: '0x3007E0eB44222AC69E1D3c93A9e50F9CA73F53a1',
      chainId: ChainId.ARBITRUM,
      cost: {
        isNative: true,
        amount: parseUnits('0.00005', 18),
      },
    },
    srcChainId: ChainId.POLYGON,
    sender: sender!,
    slippage: 1, // 1%
    srcToken: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC on Polygon
    dstToken: '0x0000000000000000000000000000000000000000', // ETH
    dstChainId: ChainId.ARBITRUM,
  };

  return (
    <>
      <H2>Action Args</H2>
      <CodeBlock>{prettyPrint(getActionArgs)}</CodeBlock>
      <div className={'mt-10'}>
        <H2>Action Response</H2>
        <BoxActionUser getActionArgs={getActionArgs} />
      </div>
    </>
  );
};

export default function ExamplePage() {
  const { address: sender } = useAccount();

  return (
    <Layout>
      <ClientRendered>
        <BoxHooksContextProvider
          apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
        >
          <div className={'max-w-5xl '}>
            <H1>Box Hooks</H1>
            <P>Below you can see the usage of the box hooks.</P>
            {sender ? <Usage /> : <P>Please Connect your wallet</P>}
          </div>
        </BoxHooksContextProvider>
      </ClientRendered>
    </Layout>
  );
}
