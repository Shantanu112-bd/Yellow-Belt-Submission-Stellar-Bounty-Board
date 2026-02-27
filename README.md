# 🎯 Bounty Board dApp

A decentralized Bounty Board built on the **Stellar Network** using **Soroban Smart Contracts**. This platform allows users to create tasks, attach XLM rewards, and allows solvers to browse and complete bounties safely using on-chain escrow mechanics.

### 🖼️ Multiple Wallet Connection Options
[🔗 View Multiple Wallet Connections Screenshot](https://ibb.co/LdDmfV4S)

## 🔗 Key Deployment Details
* **Live App URL**: [https://stellar-bounty-board.vercel.app](https://stellar-bounty-board.vercel.app)


* **Deployed Contract Address with stellar  expert ** : https://stellar.expert/explorer/testnet/contract/CBPVHZWTTQPY37GBVMN57VQEXIKMMLIL5HXKBFBQ2BM4TD4HMCP5LFLG
 `CBPVHZWTTQPY37GBVMN57VQEXIKMMLIL5HXKBFBQ2BM4TD4HMCP5LFLG`
* **Network**: Stellar Testnet (`https://soroban-testnet.stellar.org:443`)
* **Example Contract Call Transaction Hash**: [`59878baad45119d736ac8a89169361665792364319084b5a3b93911c757dab3c`](https://stellar.expert/explorer/testnet/tx/59878baad45119d736ac8a89169361665792364319084b5a3b93911c757dab3c)



## ✨ Features

*   **Wallet Integration**: Native support for **Freighter**, **Albedo**, and **xBull** via `@creit.tech/stellar-wallets-kit`.
*   **Decentralized Bounties**: Create bounties with dynamic XLM rewards directly governed by Soroban smart contracts.
*   **Functional Dashboards**: Browse global bounties, sort by categories/rewards, and track your personal `Created`, `Solving`, and `Completed` tasks.
*   **Hunter Leaderboards**: Real-time analytical ranking of the most active bounty hunters on the network.
*   **Modern UI/UX**: Sleek, fully responsive Dark/Light mode design system built with Tailwind CSS, React, and Lucide Icons.
*   **Transaction Status Modals**: Built-in visual pipelines tracking on-chain transactions with external Explorer links.

## 🚀 Tech Stack

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
*   **Blockchain**: Soroban (Stellar Smart Contracts), `stellar-sdk`
*   **Wallet Kit**: `@creit.tech/stellar-wallets-kit`
*   **Routing & State**: Zustand, React Router

---


### 2. Clone and Install
First, clone the repository and install all required frontend dependencies:

```bash
# Install dependencies
npm install

# Or if you are using pnpm
pnpm install
```

### 3. Environment Variables
To connect the UI to the Soroban smart contract, you must set up your environment variables. 
Create a new file named `.env.local` in the root of your project:

```bash
touch .env.local
```

Paste your specific smart contract ID and Stellar network details inside `.env.local`:

```env
VITE_CONTRACT_ID=CBPVHZWTTQPY37GBVMN57VQEXIKMMLIL5HXKBFBQ2BM4TD4HMCP5LFLG
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443
VITE_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
VITE_NETWORK=testnet
```

### 4. Run the Development Server
Once the environment variables are securely in place, spin up the local Vite development server:

```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 📝 Smart Contract Notice
This frontend connects to a deployed Soroban smart contract. If you wish to modify the core rust logic (`/contracts`), you will need the `stellar-cli` installed locally to compile and re-deploy your own instance of the `.wasm` file to the network.

---

## 🧪 Smart Contract Test Results

The Soroban `bounty_board` smart contract has been thoroughly unit tested and successfully passes all core logic assertions.

```bash
cargo test --manifest-path contracts/bounty_board/Cargo.toml
```

**Results:**
```text
running 8 tests
test test::test_double_initialize - should panic ... ok
test test::test_initialize ... ok
test test::test_create_bounty_invalid_reward - should panic ... ok
test test::test_create_bounty ... ok
test test::test_reject_solution ... ok
test test::test_submit_solution ... ok
test test::test_approve_solution ... ok
test test::test_get_open_bounties ... ok

test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.11s
```