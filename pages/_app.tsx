import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import localFont from 'next/font/local';

// Default styles that can be overridden by your app
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { arbitrum, mainnet, optimism, polygon, base } from 'wagmi/chains';

if (process.env.NODE_ENV !== 'development') {
  // @ts-ignore
  import('@decent.xyz/the-box/index.css').then(() => {
    console.log('💅🏼 box styles imported');
  });
}

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
  [mainnet, arbitrum, optimism, polygon, base],
  [
    // @ts-ignore
    ...getAlchemyProviders(),
    // @ts-ignore
    publicProvider(),
  ]
);
const projectId = process.env['PROJECT_ID'] || 'your-mom';
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [metaMaskWallet({ projectId, chains })],
  },
]);

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
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}
