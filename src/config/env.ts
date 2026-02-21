// src/config/env.ts
export const config = {
    contractId: (import.meta as any).env.VITE_CONTRACT_ID || '',
    rpcUrl: (import.meta as any).env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org:443',
    networkPassphrase: (import.meta as any).env.VITE_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    network: (import.meta as any).env.VITE_NETWORK || 'testnet',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
};

// Validate configuration
export const validateConfig = () => {
    if (!config.contractId) {
        console.warn('⚠️ Contract ID not set. Please add VITE_CONTRACT_ID to .env.local');
        return false;
    }
    console.log('✅ Configuration loaded:', {
        contractId: config.contractId.substring(0, 8) + '...',
        network: config.network,
    });
    return true;
};

// Auto-validate on import
validateConfig();
