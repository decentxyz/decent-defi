import { Layout } from '@/components/Layouts/Layout';
import { PropsWithChildren } from 'react';
import {
  BoxHooksContextProvider,
  useBoxAction,
  UseBoxActionArgs,
  ActionType,
  ChainId,
  bigintSerializer,
} from '@decent.xyz/box-hooks';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { ClientRendered } from '@decent.xyz/box-ui';

export const prettyPrint = (obj: any) =>
  JSON.stringify(obj, bigintSerializer, 2);
export const H1 = ({ children }: PropsWithChildren) => (
  <h1 className={'text-6xl mb-4'}>{children}</h1>
);

export const H2 = ({ children }: PropsWithChildren) => (
  <h1 className={'text-3xl mb-3'}>{children}</h1>
);

export const P = ({ children }: PropsWithChildren) => (
  <p className={'text-xl mb-2'}>{children}</p>
);

export const CodeBlock = ({ children }: PropsWithChildren) => (
  <div
    className={'max-w-6xl overflow-auto ' + 'bg-indigo-100 p-3 rounded-2xl '}
  >
    <pre>{children}</pre>
  </div>
);

export const BoxActionUser = ({
  getActionArgs,
}: {
  getActionArgs: UseBoxActionArgs;
}) => {
  const { actionResponse, isLoading, error } = useBoxAction(getActionArgs);

  if (error) {
    return <CodeBlock>Error fetching: {prettyPrint(error)}</CodeBlock>;
  }
  if (isLoading || !actionResponse) {
    return <CodeBlock>Fetching box action...</CodeBlock>;
  }
  return <CodeBlock>{prettyPrint(actionResponse)}</CodeBlock>;
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
