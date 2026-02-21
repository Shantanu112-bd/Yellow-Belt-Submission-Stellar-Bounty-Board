import { BountyListCard } from './bounty-list-card';
import { useBounties } from '../../hooks/useBounties';
import { stroopsToXlm, getTimeRemaining } from '../../lib/stellar-client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BountyDetailsModal } from './bounty-details-modal';
import { Bounty } from '../../types/bounty';
import { useToast } from '../hooks/use-toast';

export function BountyShowcase() {
  const { bounties, loading, error } = useBounties();
  const { showSuccess } = useToast();
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenBounty = (bounty: Bounty) => {
    setSelectedBounty(bounty);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBounty(null), 300); // clear after animate out
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Failed to load bounties: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Browse Bounties</h2>
        <p className="text-muted-foreground">
          Explore available tasks and start earning crypto today
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bounties.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="mb-4">No bounties found.</p>
          </div>
        ) : (
          bounties.map((bounty) => (
            <BountyListCard
              key={bounty.id}
              id={String(bounty.id)}
              title={bounty.title}
              description={bounty.description}
              category="Dev" // Placeholder
              status="Open" // Placeholder
              timeRemaining={getTimeRemaining(Number(bounty.deadline))}
              reward={stroopsToXlm(bounty.reward)}
              difficulty="Medium" // Placeholder
              creatorAddress={bounty.creator}
              onClick={() => handleOpenBounty(bounty)}
            />
          ))
        )}
      </div>

      <BountyDetailsModal
        isOpen={isModalOpen}
        bounty={selectedBounty}
        onClose={handleCloseModal}
        onClaim={(id) => {
          showSuccess(
            'Bounty Claimed!',
            `You have officially started working on Bounty #${id}. Good luck!`
          );
          handleCloseModal();
        }}
      />
    </div>
  );
}
