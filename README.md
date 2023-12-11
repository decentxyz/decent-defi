# Decent Example Application for DeFi

Hi 👋.  This is an example repository for [Box Hooks](https://docs.decent.xyz/docs/box-hooks) using Next 14, Typescript, Tailwind CSS, and [wagmi](https://wagmi.sh) + [viem](https://viem.sh).  Decent's Hooks package enables developers to execute cross-chain transactions via intuitive API calls.  Hooks offer the flexibility to support any arbitrary onchain transaction and frontend design.  This repository contains three examples that are particularly relevant for DeFi teams:

### Repository Overview

1. Bridge Modal
  - This modal enables cross-chain swaps between any token pairs.  It leverages Decent's [Box UI](https://docs.decent.xyz/docs/box-ui) package for standard components like token and chain selectors.
  - Key logic of the Bridge Modal is contained in the following files:
    - `/src/components/SwapModal.tsx`: interface where users can specify their desired transaction.  This modal accomplishes two key functions:
      - Specifies the desired cross-chain route and updates the `routeSelectContext`
      - Sends the transaction

    - `src/lib/contexts/routeSelectContext.tsx`: provides a context for key bridge information, including:
      - `srcToken`: source token
      - `dstToken`: destination token
      - `srcChain`: source chain
      - `dstChain`: destination chain
      - You can specify defaults in this file. For example, if you would like users to swap into a specific token, you should specify that as the `dstToken` when creating the context and disable the destination token and chain selector in the swap modal.

    - `src/lib/contexts/decentActionContext.tsx`: provides a context for the calldata for the transaction based on the route variables
    - `src/lib/sendTx`: called in the Swap Modal, this function actually sends the transaction specified by the `decentActionContext`

  2. Deposit Function
    - Coming Soon
  
  3. Onramp
    - Buy Crypto button
    - Custom parameters coming soon
