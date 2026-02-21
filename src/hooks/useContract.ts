// src/hooks/useContract.ts
import { useState, useCallback } from 'react';
import { contractService } from '../services/contract-service';
import { useWallet } from '../app/components/wallet-provider';
import toast from 'react-hot-toast';

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export const useContract = () => {
    const { address, isConnected, signTransaction } = useWallet();
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [txHash, setTxHash] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Create Bounty
    const createBounty = useCallback(async (
        title: string,
        description: string,
        reward: number,
        durationDays: number
    ) => {
        if (!isConnected || !address) {
            toast.error('❌ Please connect your wallet first');
            return null;
        }

        setTxStatus('pending');
        setIsLoading(true);
        setTxHash('');

        console.log('🚀 Starting bounty creation...');

        try {
            const result = await contractService.createBounty(
                address,
                title,
                description,
                reward,
                durationDays,
                (xdr) => { return signTransaction(xdr); }
            );

            if (result.success) {
                setTxStatus('success');
                setTxHash(result.hash);
                toast.success('🎉 Bounty created successfully!');
                return result.hash;
            } else {
                throw new Error(result.error || 'Transaction failed');
            }

        } catch (error: any) {
            console.error('Create bounty failed:', error);
            setTxStatus('error');
            // Fix potential object is of type 'unknown' typescript error by type checking or casting
            const errorMsg = error instanceof Error ? error.message : String(error);
            toast.error('❌ ' + (errorMsg || 'Failed to create bounty'));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [address, isConnected, signTransaction]);

    // Load Bounties
    const loadBounties = useCallback(async () => {
        try {
            return await contractService.getAllBounties();
        } catch (error) {
            console.error('Failed to load bounties:', error);
            return [];
        }
    }, []);

    // Get Bounty Count
    const getBountyCount = useCallback(async () => {
        try {
            return await contractService.getBountyCount();
        } catch (error) {
            console.error('Failed to get count:', error);
            return 0;
        }
    }, []);

    // Reset transaction status
    const resetTxStatus = useCallback(() => {
        setTxStatus('idle');
        setTxHash('');
    }, []);

    return {
        // State
        txStatus,
        txHash,
        isLoading,

        // Actions
        createBounty,
        loadBounties,
        getBountyCount,
        resetTxStatus,
    };
};
