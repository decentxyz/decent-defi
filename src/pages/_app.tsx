import '@decent.xyz/box-ui/index.css';
import "../styles/globals.css";
import 'react-toastify/dist/ReactToastify.css';

import type { AppProps } from "next/app";
import { PrivyProvider, PrivyClientConfig } from '@privy-io/react-auth';
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector';
import {
  arbitrum,
  mainnet,
  optimism,
  polygon,
  base,
  avalanche,
} from "wagmi/chains";
import { configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import localFont from "next/font/local";
import { BoxHooksContextProvider } from "@decent.xyz/box-hooks";
import { BoxActionContextProvider } from "../lib/contexts/decentActionContext";
import RouteSelectProvider from "../lib/contexts/routeSelectContext";
import { ToastContainer } from 'react-toastify';

const configureChainsConfig = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, avalanche], [
    alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
  }),
  publicProvider(),
]);

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  loginMethods: ['wallet', 'email', 'sms'],
  appearance: {
    showWalletLoginFirst: true,
  },
};

export const monument = localFont({
  src: "../fonts/EduMonumentGroteskVariable.woff2",
  variable: "--font-monument",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${monument.variable} font-sans flex flex-col min-h-screen`}
    >
      <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string} config={privyConfig}>
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <BoxHooksContextProvider
            apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
          >
            <RouteSelectProvider>
              <BoxActionContextProvider>
                <div className={`${monument.variable} font-sans`}>
                  <Component {...pageProps} />
                  <ToastContainer />
                </div>
              </BoxActionContextProvider>
            </RouteSelectProvider>
          </BoxHooksContextProvider>
        </PrivyWagmiConnector>
      </PrivyProvider>
    </div>
  );
}
