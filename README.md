# Decent Example Application for DeFi

Hi 👋. This is an example repository for [Box Hooks](https://docs.decent.xyz/docs/box-hooks) using Next 14, Typescript, Tailwind CSS, and [wagmi](https://wagmi.sh) + [viem](https://viem.sh). Decent's Hooks package enables developers to execute cross-chain transactions via intuitive API calls. Hooks offer the flexibility to support any arbitrary onchain transaction and frontend design. This repository contains three examples that are particularly relevant for DeFi teams:

## Repository Overview

### 1. Bridge
- This modal enables cross-chain swaps between any token pairs. It leverages Decent's [Box UI](https://docs.decent.xyz/docs/box-ui) package for standard components like token and chain selectors.
- Key logic of the Bridge Modal is contained in the following files:
  - `/src/components/SwapModal.tsx`: interface where users can specify their desired transaction. This modal accomplishes two key functions:
    - Specifies the desired cross-chain route and updates the `routeSelectContext`
    - Sends the transaction

  - `src/lib/contexts/routeSelectContext.tsx`: provides a context for key bridge information, including:
    - `srcToken`: source token
    - `dstToken`: destination token
    - `srcChain`: source chain
    - `dstChain`: destination chain
    - You can specify defaults in this file. For example, if you would like users to swap into a specific token, you should specify that as the `dstToken` when creating the context and disable the destination token and chain selector in the swap modal.

  - `src/lib/contexts/decentActionContext.tsx`: provides a context for the calldata for the transaction based on the route variables
  - `src/lib/executeTx`: called in the `Swap Modal`, `DepositModal`, and `OnboardModal`, this function actually sends the transaction specified by the `decentActionContext`

### 2. Deposit
- Coming Soon

### 3. Buy
- Please view the documentation for Decent Checkout [here]('https://decentxyz.notion.site/Decent-Checkout-Documentation-2c2904c465e445a2ab52e38807720141') for a full product overview.
- This modal enables users to select any ERC20 token on any supported chain and purchase it with fiat. It takes the following parameters and redirects users to the Checkout URL:
  - `https://checkout.decent.xyz/?app=onramp&wallet=${connectedAddress}&chain=${dstChain}&token=${dstToken.address}&redir=${REDIRECT_URL}`
  - `baseUrl`: `https://checkout.decent.xyz`
  - `onramp`: Decent Checkout includes 3 default applications - a fiat onramp, token bridge, and NFT Checkout
  - `chain`: the destination chain to which you would like to onramp
  - `token`: the token you would like to receive on your selected chain
  - `redir`: when the onramp tx is complete, it will redirect back to this URL

### 4. Onboard
- This modal is designed to provide boilerplate code to fill an app-scoped wallet. You might reference this tab if you are using an MPC wallet solution like Privy or a smart contract wallet with a custom signer in your application.
- In this modal we:
  1. Fetch the token balances across all supported chains for a user.
     a. Direct the user to onboard with fiat via **Buy** if they do not have any tokens.
  2. Prompt the user to select a token, setting the `srcToken`.
  3. Bridge from this `srcToken` to a preset `dstToken`.
     a. This would be the primary token in your application; for example, ETH on Base.
  4. Bridge from the `srcToken` to the `dstToken` and transfer it to the destination address.
- The destination address would be the user's wallet address within your application. In a live implementation, you would autofill this address - please refer to [Decent Checkout]('https://decentxyz.notion.site/Decent-Checkout-Documentation-2c2904c465e445a2ab52e38807720141') for further details.
- In a live implementation, you would also want to provide the user a field to input how much money they would like to transfer. For the purposes of this example, we have hardcoded this value.
- 

## Running the project

- `npm i` to install packages
- `npm run dev` to run locally
- `npm run build` to build the project
