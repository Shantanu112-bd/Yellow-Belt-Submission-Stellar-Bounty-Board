// src/lib/stellar-client.ts
import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config/env';

// Initialize Soroban RPC Server
export const server = new StellarSdk.rpc.Server(config.rpcUrl);

// Network passphrase
export const networkPassphrase = config.networkPassphrase;

// Get contract instance
export const getContract = () => {
    if (!config.contractId) {
        throw new Error('Contract ID not configured. Check .env.local');
    }
    return new StellarSdk.Contract(config.contractId);
};

// Convert XLM to stroops (1 XLM = 10,000,000 stroops)
export const xlmToStroops = (xlm: number): bigint => {
    return BigInt(Math.floor(xlm * 10_000_000));
};

// Convert stroops to XLM
export const stroopsToXlm = (stroops: bigint | number): number => {
    return Number(stroops) / 10_000_000;
};

// Shorten address for display
export const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Get time remaining from Unix timestamp
export const getTimeRemaining = (deadline: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// Get Stellar Explorer URL
export const getExplorerUrl = (type: 'tx' | 'account' | 'contract', id: string): string => {
    return `${config.explorerUrl}/${type}/${id}`;
};

// Format transaction hash
export const formatTxHash = (hash: string, chars = 8): string => {
    if (!hash) return '';
    return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
};
