import { Clock, Coins, ChevronRight } from 'lucide-react';
import { BountyAvatar } from './bounty-avatar';
import { cn } from './ui/utils';

export type BountyCategory = 'Dev' | 'Design' | 'Writing' | 'Marketing' | 'Other';
export type BountyStatus = 'Open' | 'Submitted' | 'Completed';
export type BountyDifficulty = 'Easy' | 'Medium' | 'Hard';

interface BountyListCardProps {
  id: string;
  title: string;
  description: string;
  category: BountyCategory;
  status: BountyStatus;
  timeRemaining: string;
  reward: number;
  currency?: string;
  difficulty: BountyDifficulty;
  creatorAddress: string;
  creatorAvatar?: string;
  onClick?: () => void;
  className?: string;
}

export function BountyListCard({
  title,
  description,
  category,
  status,
  timeRemaining,
  reward,
  currency = 'XLM',
  difficulty,
  creatorAddress,
  creatorAvatar,
  onClick,
  className,
}: BountyListCardProps) {
  // Category colors
  const categoryColors: Record<BountyCategory, string> = {
    Dev: 'bg-primary/10 text-primary border-primary/20',
    Design: 'bg-secondary/10 text-secondary border-secondary/20',
    Writing: 'bg-accent/10 text-accent border-accent/20',
    Marketing: 'bg-warning/10 text-warning border-warning/20',
    Other: 'bg-muted text-muted-foreground border-border',
  };

  // Status colors
  const statusConfig: Record<BountyStatus, { color: string; dotColor: string; borderColor: string }> = {
    Open: { 
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      dotColor: 'bg-blue-500',
      borderColor: 'hover:border-blue-500/30',
    },
    Submitted: { 
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      dotColor: 'bg-purple-500',
      borderColor: 'hover:border-purple-500/30',
    },
    Completed: { 
      color: 'bg-success/10 text-success border-success/20',
      dotColor: 'bg-success',
      borderColor: 'hover:border-success/30',
    },
  };

  // Difficulty dots
  const difficultyConfig: Record<BountyDifficulty, { count: number; color: string }> = {
    Easy: { count: 1, color: 'bg-success' },
    Medium: { count: 2, color: 'bg-warning' },
    Hard: { count: 3, color: 'bg-error' },
  };

  const currentStatus = statusConfig[status];
  const currentDifficulty = difficultyConfig[difficulty];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-[360px] h-[240px] bg-card rounded-xl border border-border shadow-md',
        'transition-all duration-300 cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-xl',
        currentStatus.borderColor,
        className
      )}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={cn(
          'absolute inset-0 rounded-xl blur-xl',
          status === 'Open' && 'bg-blue-500/10',
          status === 'Submitted' && 'bg-purple-500/10',
          status === 'Completed' && 'bg-success/10'
        )} />
      </div>

      <div className="relative h-full p-5 flex flex-col">
        {/* TOP - Badges Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Category Badge */}
            <span className={cn(
              'px-2.5 py-1 rounded-md text-xs font-semibold border',
              categoryColors[category]
            )}>
              {category}
            </span>

            {/* Status Badge */}
            <span className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border',
              currentStatus.color
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', currentStatus.dotColor)} />
              {status}
            </span>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Clock size={12} />
          <span>{timeRemaining}</span>
        </div>

        {/* MIDDLE - Content */}
        <div className="flex-1 space-y-2 mb-4">
          {/* Title - 2 line clamp */}
          <h3 className="font-bold text-xl text-card-foreground leading-tight line-clamp-2">
            {title}
          </h3>

          {/* Description - 3 line clamp */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-4">
          <BountyAvatar 
            size="sm" 
            src={creatorAvatar}
            fallback={creatorAddress.slice(0, 2).toUpperCase()}
          />
          <span className="text-xs font-mono text-muted-foreground truncate">
            {creatorAddress}
          </span>
        </div>

        {/* BOTTOM - Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {/* Reward */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-warning flex items-center justify-center">
              <Coins size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-none text-foreground">
                {reward} {currency}
              </p>
              <p className="text-[10px] text-muted-foreground">Reward</p>
            </div>
          </div>

          {/* Difficulty & View Details */}
          <div className="flex items-center gap-4">
            {/* Difficulty Dots */}
            <div className="flex items-center gap-1" title={`${difficulty} difficulty`}>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index < currentDifficulty.count
                      ? currentDifficulty.color
                      : 'bg-border'
                  )}
                />
              ))}
            </div>

            {/* View Details Link */}
            <div className="flex items-center gap-1 text-primary hover:text-secondary transition-colors group">
              <span className="text-xs font-semibold">Details</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
