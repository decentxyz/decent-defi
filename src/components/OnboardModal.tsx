import React, { useState } from 'react';
import Image from 'next/image';
import { useAllBalances } from '@/lib/hooks/useBalance';
import { roundValue } from '@/lib/roundValue';
import { getChainIcon } from '@/lib/constants';
import { TokenInfo } from '@decent.xyz/box-common';

interface TokenGroup {
  tokens: TokenInfo[];
  totalBalance: number;
}

interface DropdownProps {
  tokenGroup: TokenGroup;
}

const TokenRow = ({ token }: any) => (
  <div className="flex gap-2 py-1 my-1 w-40 pl-8">
    {token.balanceFloat > 0 && (
      <>
        <div className="relative h-6 w-6">
          <Image
            src={token.logo || '/Currency=usd.png'}
            height={25}
            width={25}
            alt='token icon'
            className="absolute inset-0"
          />
          <Image
            src={getChainIcon(token.chainId) || '/ethereum.svg'}
            height={15}
            width={15}
            alt='chain icon'
            className="absolute right-0 bottom-0 z-10"
            style={{ transform: 'translate(20%, 20%)' }}
          />
        </div>
        <div>{roundValue(token.balanceFloat, 4)}{' '}{token.symbol}</div>
      </>
    )}
  </div>
);

const Dropdown: React.FC<DropdownProps> = ({ tokenGroup }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button 
        className='flex justify-center py-2 my-2 border rounded-sm w-40' 
        onClick={() => setIsOpen(!isOpen)}
        disabled={!(tokenGroup.tokens.length > 0)}
      >
        <div className='flex w-28 gap-2 justify-start items-center'>
          <Image
            src={tokenGroup.tokens[0].logo || '/Currency=usd.png'}
            height={20}
            width={20}
            alt='token icon'
          />
          {roundValue(tokenGroup.totalBalance, 2)}{' '}
          {tokenGroup.tokens[0].symbol}
        </div>
      </button>
      {isOpen && (
        <div className="dropdown">
          {tokenGroup.tokens.map((token, i) => (
            <TokenRow key={token.chainId + '-' + i} token={token} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function OnboardModal({ connectedAddress }: any) {
  const { tokens } = useAllBalances(connectedAddress);

  const groupedTokens = tokens.reduce<Record<string, TokenGroup>>((acc, token) => {
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

  return (
    <>
      <div>
        {connectedAddress ? Object.entries(groupedTokens).map(([symbol, tokenGroup], i) => (
          <div key={symbol + '-' + i}>
            {tokenGroup.tokens.length === 1 ? (
              <TokenRow token={tokenGroup.tokens[0]} />
          ) : (
              <Dropdown tokenGroup={tokenGroup} />
            )}
          </div>
        )) : 'Please connect wallet.'}
      </div>
    </>
  );
}
