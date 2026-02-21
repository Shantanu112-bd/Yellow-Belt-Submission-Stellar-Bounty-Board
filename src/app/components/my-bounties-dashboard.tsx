import { useState } from 'react';
import {
    Search,
    Filter,
    SlidersHorizontal,
    FolderOpen,
    Plus,
    ArrowUpRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    Coins,
    Loader2
} from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from './ui/utils';
import { BountyCard, BountyCardHeader, BountyCardTitle, BountyCardDescription, BountyCardFooter } from './bounty-card';
import { BountyBadge } from './bounty-badge';

import { useBounties } from '../../hooks/useBounties';
import { useWallet } from './wallet-provider';
import { stroopsToXlm, getTimeRemaining } from '../../lib/stellar-client';

// --- Types ---

type TabType = 'created' | 'solving' | 'completed' | 'drafts';

const CATEGORIES = [
    { id: 'dev', label: 'Development' },
    { id: 'design', label: 'Design' },
    { id: 'writing', label: 'Writing' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'audit', label: 'Audit' }
];

// --- Components ---

const StatCard = ({ label, value, trend, icon: Icon, color, bg, unit }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between overflow-hidden relative group hover:border-indigo-200 transition-all">
        <div className="z-10 relative">
            <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg", bg, color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
            </div>
            {trend && (
                <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">{trend}</span>
                </div>
            )}
        </div>
    </div>
);

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="border-b border-slate-100 dark:border-slate-800 py-6 last:border-0">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            {title}
        </h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const EmptyState = ({ loading, error, activeTab = 'created' }: { loading: boolean, error: string | null, activeTab?: string }) => {
    let title = "No bounties yet";
    let message = "You haven't created any bounties yet. Start your journey by creating your first task.";
    if (activeTab === 'solving') {
        title = "Not solving any bounties";
        message = "You are not currently working on any active bounties. Browse the board to find tasks to solve.";
    } else if (activeTab === 'completed') {
        title = "No completed bounties";
        message = "You haven't completed any bounties yet. Keep working hard and they will show up here!";
    } else if (activeTab === 'drafts') {
        title = "No drafts";
        message = "You don't have any saved drafts.";
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            {loading ? (
                <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full mb-6 relative">
                        <FolderOpen className="h-12 w-12 text-indigo-400" />
                        {activeTab === 'created' && (
                            <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm">
                                <Plus className="h-4 w-4 text-indigo-600" />
                            </div>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-slate-500 max-w-sm mb-8">
                        {message}
                    </p>
                    {activeTab === 'created' ? (
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" onClick={() => window.location.hash = '#create'}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create your first bounty
                        </Button>
                    ) : (
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" onClick={() => window.location.hash = '#browse'}>
                            <Search className="mr-2 h-4 w-4" />
                            Browse Bounties
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

export function MyBountiesDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('created');
    const [rewardRange, setRewardRange] = useState([0, 5000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Use Real Data
    const { bounties, loading, error } = useBounties();
    const { address } = useWallet();

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const hasActiveFilters = selectedCategories.length > 0 || rewardRange[0] > 0 || rewardRange[1] < 5000;

    const myCreated = bounties.filter((b: any) => address && b.creator === address);
    const mySolving = bounties.filter((b: any) => address && b.solver === address && b.status !== 2 && b.status !== 'Completed');
    const myCompleted = bounties.filter((b: any) => address && (b.creator === address || b.solver === address) && (b.status === 2 || b.status === 'Completed'));

    const totalEarned = myCompleted
        .filter((b: any) => b.solver === address)
        .reduce((acc, b: any) => acc + Number(stroopsToXlm(b.reward)), 0);

    // Stats Calculations 
    const statsData = [
        { label: 'Created', value: myCreated.length.toString(), trend: 'On chain', icon: FolderOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', chartColor: '#4f46e5' },
        { label: 'In Progress', value: mySolving.length.toString(), trend: 'Active now', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', chartColor: '#2563eb' },
        { label: 'Completed', value: myCompleted.length.toString(), trend: 'All time', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', chartColor: '#059669' },
        { label: 'Total Earned', value: totalEarned.toLocaleString(), unit: 'XLM', trend: 'Lifetime', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50', chartColor: '#d97706' },
    ];

    let displayBounties: any[] = [];
    if (activeTab === 'created') displayBounties = myCreated;
    else if (activeTab === 'solving') displayBounties = mySolving;
    else if (activeTab === 'completed') displayBounties = myCompleted;

    if (searchQuery) {
        displayBounties = displayBounties.filter((b: any) =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (sortOrder === 'newest') {
        displayBounties = [...displayBounties].sort((a: any, b: any) => Number(b.id) - Number(a.id));
    } else {
        displayBounties = [...displayBounties].sort((a: any, b: any) => Number(a.id) - Number(b.id));
    }

    return (
        <div className="w-full max-w-[1440px] mx-auto px-6 py-8 min-h-screen bg-background text-foreground">
            {/* Top Header */}
            <div className="space-y-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight">My Bounties</h1>
                        <p className="text-muted-foreground mt-1">Manage and track your bounty activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="hidden sm:flex">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                            <Plus className="mr-2 h-4 w-4" />
                            New Bounty
                        </Button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsData.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>
            </div>

            {/* Sticky Tabs */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border mb-8 -mx-6 px-6 pt-2">
                <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-8">
                        {(['created', 'solving', 'completed', 'drafts'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "relative py-4 text-sm font-medium capitalize transition-colors whitespace-nowrap",
                                    activeTab === tab
                                        ? "text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.3)]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="hidden lg:flex items-center text-sm text-muted-foreground gap-2 pl-4 border-l border-border h-6 my-auto">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: just now</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setRewardRange([0, 5000]);
                                }}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5 shadow-sm dark:shadow-none">
                        <FilterSection title="Status">
                            {['Active', 'Under Review', 'Completed', 'Disputed'].map((status) => (
                                <div key={status} className="flex items-center space-x-3">
                                    <Checkbox id={`status-${status}`} />
                                    <label
                                        htmlFor={`status-${status}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                    >
                                        {status}
                                    </label>
                                </div>
                            ))}
                        </FilterSection>

                        <FilterSection title="Categories">
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(category => (
                                    <Badge
                                        key={category.id}
                                        variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer font-medium transition-all px-3 py-1.5",
                                            selectedCategories.includes(category.id)
                                                ? "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent"
                                                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                                        )}
                                        onClick={() => toggleCategory(category.id)}
                                    >
                                        {category.label}
                                    </Badge>
                                ))}
                            </div>
                        </FilterSection>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card border-border focus:border-primary focus:ring-primary/20 shadow-sm dark:shadow-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="w-[180px] bg-card border-border shadow-sm dark:shadow-none">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : displayBounties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {displayBounties.map((bounty: any) => (
                                <BountyCard key={bounty.id} hover className="bg-card border-border">
                                    <BountyCardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                <BountyBadge variant="category">Dev</BountyBadge>
                                            </div>
                                            <BountyBadge variant="warning">
                                                MEDIUM
                                            </BountyBadge>
                                        </div>
                                        <BountyCardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                                            {bounty.title}
                                        </BountyCardTitle>
                                        <BountyCardDescription className="line-clamp-2">
                                            {bounty.description}
                                        </BountyCardDescription>
                                    </BountyCardHeader>
                                    <BountyCardFooter className="border-t border-border/50 bg-muted/30 justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <div className="p-1 px-2 rounded bg-amber-100/50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/50 flex items-center gap-1.5 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                                                <Coins className="h-3.5 w-3.5" />
                                                {stroopsToXlm(bounty.reward)} XLM
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            {getTimeRemaining(Number(bounty.deadline))} left
                                        </div>
                                    </BountyCardFooter>
                                </BountyCard>
                            ))}
                        </div>
                    ) : (
                        <EmptyState loading={loading} error={error} activeTab={activeTab} />
                    )}
                </div>
            </div>
        </div>
    );
}
