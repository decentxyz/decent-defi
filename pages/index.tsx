import { SplashPage } from '@/components/SplashPage';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { ActionType, ChainId, TheBox } from '@decent.xyz/the-box';
import { parseUnits } from 'viem';

export default function BoxSplashPage() {
  return (
    <SplashPage>
      <DefaultLayout title="Autumn" image="/nft-image.png">
        <TheBox
          className="rounded-lg border shadow-md bg-white dark"
          paymentButtonText="MINT ME"
          actionType={ActionType.NftMint}
          actionConfig={{
            contractAddress: '0x3007E0eB44222AC69E1D3c93A9e50F9CA73F53a1',
            chainId: ChainId.ARBITRUM,
            cost: {
              isNative: true,
              amount: parseUnits('0.00005', 18),
            },
          }}
          apiKey={process.env.NEXT_PUBLIC_DECENT_API_KEY as string}
        />
      </DefaultLayout>
    </SplashPage>
  );
}
