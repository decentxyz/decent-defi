import { ChainId } from '@decent.xyz/box-common';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { BrowserProvider } from 'ethers/providers';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function usePrivyAddress({ enableAutoPolygon = false }: { enableAutoPolygon?: boolean } = {}) {
  const { wallets } = useWallets();
  const currentWallet = wallets ? wallets[0] : undefined;
  const isPrivyAddress = currentWallet?.walletClientType === 'privy';
  const connectedAddress = currentWallet?.address;
  const [switchedToPolygon, setSwitchedToPolygon] = useState<boolean>(false);
  const autoPolygon = async () => {
    try {
      if (currentWallet) {
        setSwitchedToPolygon(true);
        await currentWallet.switchChain(ChainId.POLYGON);
      }
    } catch (e) {
      console.log(e);
    }
  };
  enableAutoPolygon && !switchedToPolygon && autoPolygon();

  const [bp, setBp] = useState<BrowserProvider | undefined>(undefined);

  useEffect(() => {
    const getBp = async () => {
      if (currentWallet) {
        if (isPrivyAddress) {
          // do this if privy
          console.log('setting bp');
          const ethereumProvider = await currentWallet.getEthereumProvider();
          setBp(new BrowserProvider(ethereumProvider));
        } else if (window.ethereum) {
          // do this if mm
          // TODO: confirm this is needed
          console.log('setting mm bp');
          setBp(new BrowserProvider(window.ethereum));
        } else {
          // do this for mobile wallets
          console.log('setting mobile bps');
          const ethereumProvider = await currentWallet.getEthereumProvider();
          setBp(new BrowserProvider(ethereumProvider));
        }
      }
    };
    getBp();
  }, [wallets]);

  return {
    connectedAddress,
    bp,
    wallets,
    isPrivyAddress,
    privyWallet: currentWallet,
  };
}