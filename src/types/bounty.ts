export interface Bounty {
    id: number;
    title: string;
    description: string;
    reward: bigint; // In stroops
    deadline: bigint; // Unix timestamp
    creator: string;
    status: 'Open' | 'Assigned' | 'Completed' | 'Cancelled';
    assignee?: string;
}

export type BountyStatus = Bounty['status'];
