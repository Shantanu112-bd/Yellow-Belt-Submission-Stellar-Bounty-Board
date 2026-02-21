# Bounty Board Implementation Plan

## Current Status
- **Frontend**: React + Tailwind + Radix UI (Complete UI structure)
- **Backend**: Soroban Smart Contract (in `contracts/bounty_board`)
- **Integration**: 
    - [x] Wallet Connection (Freighter) implemented via `WalletProvider`.
    - [ ] Contract Interaction (Calling `submit_bounty`, `approve_bounty`, etc.).
    - [ ] Data Fetching (Replacing mock data with chain data).

## Completed Steps
1.  Analyzed project structure.
2.  Installed `stellar-sdk` and `@stellar/freighter-api`.
3.  Implemented `WalletProvider` and `useWallet` hook.
4.  Refactored `Navigation` and `App` to use global wallet state.

## Next Steps

### 1. Smart Contract Bindings
- Generate TypeScript bindings for the Soroban contract to make it easier to interact with from the frontend.
- Alternatively, create a wrapper service using `stellar-sdk` to invoke contract methods.

### 2. Connect "Create Bounty" Form
- Update `CreateBountyForm.tsx` to:
    - validating inputs.
    - constructing a transaction to call `create_bounty` on the contract.
    - signing with Freighter.
    - submitting to the network.

### 3. Real Data on Dashboard
- Create a hook `useBounties` to fetch the list of bounties from the contract.
- Update `MyBountiesDashboard.tsx` and `BountyShowcase.tsx` to use this hook instead of hardcoded mock data.

### 4. Deployment (COMPLETED)
- [x] Deploy the contract to **Stellar Testnet**.
- [x] Configure the frontend with the Contract ID (`CBPVHZWTTQPY37GBVMN57VQEXIKMMLIL5HXKBFBQ2BM4TD4HMCP5LFLG`).

## Technical Debt / Cleanup
- `MobileNavigation.tsx` and `Navigation.tsx` had some import issues that were fixed, but could be further unified.
- `use-toast.tsx` is basic; might need handling for async transaction states (Mining, Success, Error).
