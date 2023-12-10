import '@decent.xyz/box-ui/index.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import localFont from 'next/font/local';

import { arbitrum, mainnet, optimism, polygon, base, avalanche } from 'wagmi/chains';

import { BoxHooksContextProvider } from '@decent.xyz/box-hooks';
import { BoxActionContextProvider } from '@/boxActionContext';
import RouteSelectProvider from '@/lib/routeSelectContext';

const getAlchemyProviders = () => {
  const providers: ReturnType<typeof alchemyProvider>[] = [];
  for (const c of ['OPTIMISM', 'ARBITRUM', 'POLYGON']) {
    const apiKey = process.env[`${c}_MAINNET_KEY`];
    if (apiKey) {
      providers.push(alchemyProvider({ apiKey }));
    }
  }
  return providers;
};

const { chains, publicClient } = configureChains(
  [mainnet, arbitrum, optimism, polygon, base, avalanche],
  [
    // @ts-ignore
    ...getAlchemyProviders(),
    // @ts-ignore
    publicProvider(),
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID as string,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const monument = localFont({
  src: '../public/fonts/EduMonumentGroteskVariable.woff2',
  variable: '--font-monument',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${monument.variable} font-sans flex flex-col min-h-screen`}
    >
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <BoxHooksContextProvider
            apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
          >
            <RouteSelectProvider>
              <BoxActionContextProvider>
                <div className={`${monument.variable} font-sans`}>
                  <Component {...pageProps} />
                </div>
              </BoxActionContextProvider>
            </RouteSelectProvider>
          </BoxHooksContextProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}
