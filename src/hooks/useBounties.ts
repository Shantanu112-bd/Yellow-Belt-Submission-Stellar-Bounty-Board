import { useState, useEffect, useCallback } from 'react';
import { contractService } from '../services/contract-service';
import { Bounty } from '../types/bounty';

export const useBounties = () => {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBounties = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await contractService.getAllBounties();

            // Map contract data to Bounty interface if needed
            // Assuming scValToNative returns the struct properties correctly
            // We might need to adjust based on actual return structure (e.g. if it returns [id, bounty] tuples or just bounty structs)
            // For now, let's assume it returns an array of Bounty objects.

            // Sort by newest first
            const sortedBounties = (data as Bounty[]).sort((a, b) => Number(b.id) - Number(a.id));

            setBounties(sortedBounties);
        } catch (err: any) {
            console.error('Error fetching bounties:', err);
            setError(err.message || 'Failed to fetch bounties');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBounties();

        // Optional: Poll every minute
        const interval = setInterval(fetchBounties, 60000);
        return () => clearInterval(interval);
    }, [fetchBounties]);

    return {
        bounties,
        loading,
        error,
        refresh: fetchBounties,
    };
};
