import { useContext, useState, Dispatch } from 'react';
import Image from 'next/image';
import { useAllBalances } from '@/lib/hooks/useBalance';
import { roundValue } from '@/lib/roundValue';
import { getChainIcon, daiLogo } from '@/lib/constants';
import { TokenInfo } from '@decent.xyz/box-common';
import { RouteSelectContext } from '@/lib/contexts/routeSelectContext';
import { BoxActionContext } from '@/lib/contexts/decentActionContext';
import { RouteVars } from '@/lib/contexts/routeSelectContext';
import { confirmRoute, executeTransaction } from '@/lib/executeTransaction';
import { useNetwork } from 'wagmi';

interface TokenGroup {
  tokens: TokenInfo[];
  totalBalance: number;
}

// <------------------------ Destination Wallet Input ------------------------>

const DestinationAddress = ({ 
  setDstWallet 
}: {
  setDstWallet: (wallet: string) => void;
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDstWallet(e.target.value);
  };

  return (
    <>
      <input
        placeholder='Destination Address'
        type='text'
        onChange={handleInputChange}
        className='border p-2 rounded-md text-gray-600 text-sm w-full bg-gray-100/80'
      />
    </>
  )
}

// <------------------------ Individual Balances per Chain ------------------------>

const TokenRow = ({ 
  token, 
  isOpen,
  setIsOpen,
  updateRouteVars
}: {
  token: any,
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  updateRouteVars: Dispatch<Partial<RouteVars>>
}) => {
  return (
    <button
      onClick={() => {
        updateRouteVars({
          srcToken: token,
          srcChain: token.chainId
        });
        setIsOpen(!isOpen);
      }}
      className="flex gap-2 py-2 mt-1 pl-12 text-sm border-b w-full"
    >
      <div className="relative h-6 w-6">
        <Image
          src={token.symbol === 'DAI' ? daiLogo : token.logo || '/Currency=usd.png'}
          height={14}
          width={14}
          alt='token icon'
          className="absolute inset-0"
        />
        <Image
          src={getChainIcon(token.chainId) || '/ethereum.svg'}
          height={16}
          width={16}
          alt='chain icon'
          className="absolute right-0 bottom-0 z-10"
          style={{ transform: 'translate(0%, -10%)' }}
        />
      </div>
      <div>{roundValue(token.balanceFloat, 4)}{' '}{token.symbol}</div>
    </button>
  )
};

// <------------------------ Dropdown ------------------------>

const Dropdown = ({ 
  tokenGroup,
  updateRouteVars 
}: {
  tokenGroup: TokenGroup,
  updateRouteVars: Dispatch<Partial<RouteVars>>
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function clickHandler(tokens: TokenInfo[]) {
    if (tokens.length <= 1) {
      updateRouteVars({
        srcChain: tokens[0].chainId,
        srcToken: tokens[0]
      });
    } else {
      setIsOpen(!isOpen)
    };
  };

  return (
    <div className='border rounded-sm pt-2 mt-2 bg-white'>
      <div className='relative pb-2 pl-12'>
        <button 
          className={`
            ${tokenGroup.tokens.length > 1 && 'hover:bg-white/80 hover:opacity-80 '}
            flex justify-center text-sm 
          `}
          onClick={() => {
            clickHandler(tokenGroup.tokens)
          }}
        >
          <div className='flex gap-2 justify-start items-center'>
            <Image
              src={tokenGroup.tokens[0].symbol === 'DAI' ? daiLogo : tokenGroup.tokens[0].logo || '/Currency=usd.png'}
              height={20}
              width={20}
              alt='token icon'
            />
            {roundValue(tokenGroup.totalBalance, 2)}{' '}
            {tokenGroup.tokens[0].symbol}
          </div>
        </button>
        {tokenGroup.tokens.length > 1 && !isOpen && <div
          className="absolute right-0 bottom-0 z-10 text-[10px] bg-gray-500 rounded-full w-5 h-5 text-white justify-center items-center flex"
          style={{ transform: 'translate(40%, 30%)' }}
        >
          +{tokenGroup.tokens.length}
        </div>}
      </div>
      {isOpen && (
        <div className="dropdown">
          {tokenGroup.tokens.map((token, i) => (
            <TokenRow 
              key={token.chainId + '-' + i} 
              token={token}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              updateRouteVars={updateRouteVars}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// <------------------------ Exported Modal ------------------------>

export default function OnboardModal({ 
  connectedAddress, 
  setActiveTab,
  privyWallet,
  publicClient
 }: {
  connectedAddress: any;
  setActiveTab: (tab: string) => void;
  privyWallet: any,
  publicClient: any
}) {
  const { tokens } = useAllBalances(connectedAddress);
  const balances = tokens.filter(token => token.balanceFloat > 0);
  const {
    setBoxActionArgs,
    boxActionResponse: { actionResponse },
  } = useContext(BoxActionContext);
  const { routeVars, updateRouteVars } = useContext(RouteSelectContext);
  const { chain } = useNetwork();
  const [dstWallet, setDstWallet] = useState<string>(connectedAddress);
  const [showContinue, setShowContinue] = useState(true);

  if (!tokens) {
    return <div className="absolute right-4 load-spinner"></div>
  } else if (balances.length == 0) {
    console.log('NO Balances')
    return <button 
      onClick={() => setActiveTab('buy')}
      className={'bg-black text-white ' +
      "text-center font-medium" +
      " w-full rounded-lg p-2 mt-4" +
      " relative flex items-center justify-center"
      }
    >Buy Crypto to Continue</button>
  };

  const groupedTokens = balances.reduce<Record<string, TokenGroup>>((acc, token) => {
    if (!acc[token.symbol]) {
      acc[token.symbol] = {
          tokens: [],
          totalBalance: 0,
      };
    }
    acc[token.symbol].tokens.push(token);
    acc[token.symbol].totalBalance += token.balanceFloat;
    return acc;
  }, {});

  const sortedTokenGroups = Object.values(groupedTokens).sort((a, b) => b.totalBalance - a.totalBalance);

  return (
    <div className='flex justify-center mt-8'>
      <div className='bg-white/50 w-60 p-2 rounded-sm'>
        <DestinationAddress 
          setDstWallet={setDstWallet}
        />
        <div>
          {connectedAddress ? Object.entries(sortedTokenGroups).map(([symbol, tokenGroup], i) => (
            <div key={symbol + '-' + i}>
              <Dropdown 
                tokenGroup={tokenGroup} 
                updateRouteVars={updateRouteVars}
              />
            </div>
          )) : 'Please connect wallet.'}
        </div>
        {showContinue ? 
        <button 
          className={'bg-black text-white ' +
          "text-center font-medium" +
          " w-full rounded-lg p-2 mt-4" +
          " relative flex items-center justify-center"}
          disabled={!dstWallet}
          onClick={() => confirmRoute({
          chain,
          srcChain: routeVars.srcChain,
          srcToken: routeVars.srcToken,
          // Will need to add an input field for users to decide how much $ they want to fill their new wallet with.  We recommend expanding upon on this component to include an effect when a token is selected that reveals an input amount for the desired value to transfer.
          srcInputVal: '0.001',
          // For this flow, you would set the dstToken as a default in your flow.  For example, if you are an app on Base, you might direct your users to fill their wallets with ETH on Base.
          dstToken: routeVars.dstToken,
          recipient: dstWallet,
          connectedAddress,
          setShowContinue,
          setBoxActionArgs,
          updateRouteVars,
          privyWallet
        })}>Confirm Token</button>
        : <button
          className={`${!actionResponse ? 'bg-gray-300 text-gray-600 ' : 'bg-primary text-white '}` +
          "text-center font-medium" +
          " w-full rounded-lg p-2 mt-4" +
          " relative flex items-center justify-center"}   
          disabled={!actionResponse}
          onClick={() => executeTransaction({
          actionResponse,
          connectedAddress,
          publicClient,
          srcChain: chain?.id!,
        })}>Fill Wallet</button>
        }
      </div>
    </div>
  );
}
