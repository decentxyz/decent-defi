import { Address } from 'viem';
import { erc20ABI, writeContract, readContract } from '@wagmi/core';

export const approveToken = async ({
  token,
  spender,
  amount,
}: {
  token: Address;
  spender: Address;
  amount: bigint;
}) => {
  try {
    const result = await writeContract({
      address: token,
      abi: erc20ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
    return result.hash;
  } catch (e) {
    console.log(e);
  }
};

export const getAllowance = async ({
  user,
  token,
  spender,
}: {
  user: Address;
  spender: Address;
  token: Address;
}) => {
  return await readContract({
    address: token,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [user, spender],
  });
};