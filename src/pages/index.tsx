import { useState } from "react";
import SwapModal from "../components/SwapModal";
import BuyModal from "@/components/BuyModal";
import OnboardModal from "@/components/OnboardModal";
import LoginButton from "@/components/LoginButton";
import Link from "next/link";
import Image from "next/image";
import usePrivyAddress from "../lib/hooks/usePrivyAddress";

export default function Index() {
  const featuredDeFiFunctions = ['bridge', 'deposit', 'buy', 'onboard'];
  const [activeTab, setActiveTab] = useState<string>('bridge');
  const { connectedAddress, bp, privyWallet } = usePrivyAddress();

  return (
    <div className="px-8 bg-gray-100 min-h-screen relative">
      <div className="flex justify-between py-4 items-center">
        <a
          href="https://checkout.decent.xyz/"
          target="_blank"
          className="flex items-center gap-1.5 bg-white rounded border group px-2 py-1"
        >
          <div>
            <Image
              src="/decent-icon-black.png"
              height={20}
              width={20}
              alt="decent-icon"
            />
          </div>
          Buy Crypto
        </a>
        <LoginButton />
      </div>

      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <nav className="flex mb-5">
            {featuredDeFiFunctions.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium text-center ${
                  activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
          <div>
            <div className={`${activeTab !== 'bridge' ? 'hidden' : ''}`}>
              <SwapModal 
                connectedAddress={connectedAddress}
                privyWallet={privyWallet}
              />
            </div>
            <div className={`${activeTab !== 'buy' ? 'hidden' : ''}`}>
              <BuyModal connectedAddress={connectedAddress} />
            </div>
            <div className={`${activeTab !== 'onboard' ? 'hidden' : ''}`}>
              <OnboardModal connectedAddress={connectedAddress} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center">
        <span className="pr-2">Powered by</span>
        <Link
          href="http://decent.xyz/"
          className="hover:opacity-80 hover:underline"
        >
          <Image src='/decent.png' width={80} height={10} alt='decent-logo' />
        </Link>
      </div>
    </div>
  );
}
