import { Layout } from "@/components/Layouts/Layout";
import { CodeBlock, H1, P } from "@/components/common";
import { useAccount } from "wagmi";
import { ChainId } from "@decent.xyz/box-common";

export default function ExamplePage() {
  const { address: connectedAddress } = useAccount();
  const BASE_UDSC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const EARLY_OPTIMISTS = "0x0110bb5739a6f82eafc748418e572fc67d854a0f";
  const EARLY_OPTIMISTS_ID = 7983;
  const REDIRECT_URL = "decent.xyz";
  const ARB_MAGIC = "0x539bdE0d7Dbd336b79148AA742883198BBF60342";

  return (
    <Layout>
      <div className="max-w-5xl">
        <H1>Decent Checkout</H1>
        <P>
          Decent Checkout enables users to onramp to any token on any supported
          chain and complete transactions with fiat. You can easily install
          customizable onramp links like the examples below to seamlessly
          onboard new users to your app. Please see our docs for more
          information.
        </P>
        <P>
          Prompt a user to checkout and link to the appropriate Decent Checkout
          URL. When the transaction completes, the user will be redirected back
          to your site.
        </P>
        <div className="py-8">
          <div className="flex gap-4 items-center">
            <a
              href="https://checkout.decent.xyz/"
              target="_blank"
              className="px-4 py-2 rounded-md text-white bg-black"
            >
              Visit Checkout
            </a>
            <CodeBlock className="max-w-[800px]">
              {`<a href='https://checkout.decent.xyz/'  target='_blank'>Visit Checkout</a>`}
            </CodeBlock>
          </div>

          <div className="flex gap-4 items-center">
            <a
              href={
                connectedAddress &&
                `https://checkout.decent.xyz?wallet=${connectedAddress}`
              }
              target="_blank"
              className="px-4 py-2 rounded-md text-white bg-black"
            >
              {connectedAddress ? "Checkout to Wallet" : "Connect Wallet"}
            </a>
            <CodeBlock className="max-w-[810px]">
              {`<a href='https://checkout.decent.xyz?wallet=${connectedAddress}' target='_blank'>Checkout to Wallet</a>`}
            </CodeBlock>
          </div>

          <div className="flex gap-4 items-center">
            <a
              href={
                connectedAddress &&
                `https://checkout.decent.xyz?wallet=${connectedAddress}&chain=${ChainId.ARBITRUM}&token=${ARB_MAGIC}&app=onramp`
              }
              target="_blank"
              className="px-4 py-2 rounded-md text-white bg-black"
            >
              {connectedAddress ? "Onramp to Base" : "Connect Wallet"}
            </a>
            <CodeBlock className="max-w-[760px]">
              {`<a href='https://checkout.decent.xyz?wallet=${connectedAddress}&chain=${ChainId.BASE}&token=${BASE_UDSC}&app=onramp' target='_blank'>Onramp to USDC on Base</a>`}
            </CodeBlock>
          </div>

          <div className="flex gap-4 items-center">
            <a
              href={`https://checkout.decent.xyz?wallet=${connectedAddress}&chain=${ChainId.OPTIMISM}&app=nft&nft=${EARLY_OPTIMISTS}%3A${EARLY_OPTIMISTS_ID}&redir=${REDIRECT_URL}`}
              target="_blank"
              className="px-4 py-2 rounded-md text-white bg-black"
            >
              {connectedAddress ? "Purchase NFT on Optimism" : "Connect Wallet"}
            </a>
            <CodeBlock className="max-w-[750px]">
              {`<a href='https://checkout.decent.xyz?wallet=${connectedAddress}&chain=${ChainId.OPTIMISM}&app=nft&nft=${EARLY_OPTIMISTS}%3A${EARLY_OPTIMISTS_ID}&redir=${REDIRECT_URL}'>Purchase NFT on Optimism</a>`}
            </CodeBlock>
          </div>

          <div className="flex gap-4 items-center">
            <a
              href={`https://checkout.decent.xyz?wallet=${connectedAddress}&chain=${ChainId.ARBITRUM}&token=${ARB_MAGIC}&app=bridge`}
              target="_blank"
              className="px-4 py-2 rounded-md text-white bg-black"
            >
              {connectedAddress ? "Bridge Arbitrum" : "Connect Wallet"}
            </a>
            <CodeBlock className="max-w-[740px]">
              {`<a href='https://checkout.decent.xyz?wallet=${connectedAddress}&chain=${ChainId.ARBITRUM}&token=${ARB_MAGIC}&app=bridge'>Bridge to MAGIC on Arbitrum</a>`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </Layout>
  );
}
