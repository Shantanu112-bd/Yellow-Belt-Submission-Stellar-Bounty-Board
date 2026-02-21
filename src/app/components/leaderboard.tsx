
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Target, TrendingUp, Hexagon } from 'lucide-react';
import { cn } from './ui/utils';
import { shortenAddress } from '../../lib/stellar-client';

import { useBounties } from '../../hooks/useBounties';
import { stroopsToXlm } from '../../lib/stellar-client';

// Types for the leaderboard data
interface LeaderboardEntry {
    id: string;
    address: string;
    rank: number;
    totalEarned: number; // in XLM
    bountiesCompleted: number;
    successRate: number; // percentage
    topSkill: string;
    badges: string[];
}

export function Leaderboard() {
    const { bounties, loading } = useBounties();

    // Compute leaderboard based on actual contract data
    const leaderboardMap = new Map<string, LeaderboardEntry>();

    bounties.forEach((bounty) => {
        const b = bounty as any;
        // status === 2 means Completed, and it must have a solver
        if ((b.status === 2 || b.status === 'Completed') && b.solver) {
            const solverAddr = String(b.solver);
            const rewardXlm = Number(stroopsToXlm(b.reward));

            if (!leaderboardMap.has(solverAddr)) {
                leaderboardMap.set(solverAddr, {
                    id: solverAddr,
                    address: solverAddr,
                    rank: 0,
                    totalEarned: 0,
                    bountiesCompleted: 0,
                    successRate: 100, // Placeholder
                    topSkill: 'Contributor',
                    badges: ['Stellar Native'],
                });
            }

            const entry = leaderboardMap.get(solverAddr)!;
            entry.totalEarned += rewardXlm;
            entry.bountiesCompleted += 1;
        }
    });

    const data = Array.from(leaderboardMap.values())
        .sort((a, b) => b.totalEarned - a.totalEarned)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Global Stats
    const activeHunters = data.length;
    const xlmDistributed = data.reduce((acc, curr) => acc + curr.totalEarned, 0);
    const bountiesSolved = data.reduce((acc, curr) => acc + curr.bountiesCompleted, 0);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-slate-300" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-700" />;
            default:
                return <span className="text-muted-foreground font-mono font-bold text-lg">#{rank}</span>;
        }
    };

    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative overflow-hidden';
            case 2:
                return 'bg-slate-300/10 border-slate-300/30';
            case 3:
                return 'bg-amber-700/10 border-amber-700/30';
            default:
                return 'bg-card border-border hover:border-primary/30 transition-colors';
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Leaderboard Header Section */}
            <div className="w-full max-w-4xl mb-10 text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4"
                >
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide uppercase">Top Performers</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Bounty Hunter Leaderboard
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Recognizing the most active and successful contributors in the ecosystem. Real-time ranking based on XLM earned and bounties completed.
                </p>
            </div>

            {/* Leaderboard Table/List */}
            <div className="w-full max-w-5xl bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden p-6 relative">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Stats Summary slightly overlapping the top */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-background/80 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
                        <Target className="w-6 h-6 text-primary mb-2" />
                        <span className="text-2xl font-bold">{activeHunters}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Active Hunters</span>
                    </div>
                    <div className="bg-background/80 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
                        <TrendingUp className="w-6 h-6 text-secondary mb-2" />
                        <span className="text-2xl font-bold">{xlmDistributed.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">XLM Distributed</span>
                    </div>
                    <div className="bg-background/80 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
                        <Hexagon className="w-6 h-6 text-accent mb-2" />
                        <span className="text-2xl font-bold">{bountiesSolved}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Bounties Solved</span>
                    </div>
                    <div className="bg-background/80 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
                        <Star className="w-6 h-6 text-yellow-500 mb-2" />
                        <span className="text-2xl font-bold">{activeHunters > 0 ? '100%' : '0%'}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Success Rate</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Table Header - Desktop only */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-semibold text-muted-foreground border-b border-border/40">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-4">Hunter</div>
                            <div className="col-span-2 text-right">Earned</div>
                            <div className="col-span-2 text-center">Completed</div>
                            <div className="col-span-3">Top Skill / Badges</div>
                        </div>

                        {/* Leaderboard Rows */}
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 },
                                },
                            }}
                            className="space-y-3"
                        >
                            {data.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No completed bounties yet. Be the first to claim and complete a bounty!
                                </div>
                            ) : (
                                data.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            show: { opacity: 1, x: 0 },
                                        }}
                                        className={cn(
                                            'grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 md:px-6 rounded-xl border transition-all hover:scale-[1.01]',
                                            getRankStyles(user.rank)
                                        )}
                                    >
                                        {/* #1 Crown decoration */}
                                        {user.rank === 1 && (
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-bl-full pointer-events-none" />
                                        )}

                                        {/* Rank */}
                                        <div className="col-span-1 flex justify-between md:justify-center items-center">
                                            <span className="md:hidden text-sm text-muted-foreground font-semibold">Rank</span>
                                            {getRankIcon(user.rank)}
                                        </div>

                                        {/* Hunter Address */}
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex flex-shrink-0 items-center justify-center shadow-lg">
                                                <span className="text-white font-bold text-sm">
                                                    {user.address.substring(1, 3)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-mono text-sm font-bold text-foreground truncate w-32 md:w-auto">
                                                    {user.rank === 1 || user.rank === 2 || user.rank === 3
                                                        ? shortenAddress(user.address, 6)
                                                        : shortenAddress(user.address, 4)}
                                                </p>
                                                {user.rank === 1 && (
                                                    <p className="text-xs text-yellow-500 font-semibold tracking-wide">🏆 reigning champion</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Earned amount */}
                                        <div className="col-span-2 flex justify-between md:justify-end items-center">
                                            <span className="md:hidden text-sm text-muted-foreground">Total Earned</span>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-lg text-primary">
                                                    {user.totalEarned.toLocaleString()} <span className="text-sm">XLM</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bounties Completed & Success Rate */}
                                        <div className="col-span-2 flex justify-between md:justify-center items-center gap-2">
                                            <span className="md:hidden text-sm text-muted-foreground">Bounties</span>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-foreground bg-muted/50 px-3 py-1 rounded-lg">
                                                    {user.bountiesCompleted} <span className="text-muted-foreground font-normal text-xs ml-1">solved</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Top Skill and Badges */}
                                        <div className="col-span-3 flex justify-between md:justify-start items-center gap-2">
                                            <span className="md:hidden text-sm text-muted-foreground w-1/3">Strengths</span>
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap flex-1 justify-end md:justify-start">
                                                <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded border-primary/20 whitespace-nowrap">
                                                    {user.topSkill}
                                                </span>
                                                {user.badges.map((badge, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] font-medium px-2 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full flex items-center gap-1 whitespace-nowrap"
                                                    >
                                                        ⭐ {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>

                        {/* Load more button placeholder */}
                        <div className="mt-6 flex justify-center">
                            <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                                View Full Rankings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
