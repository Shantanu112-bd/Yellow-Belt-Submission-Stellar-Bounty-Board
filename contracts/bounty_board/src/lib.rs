#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec, symbol_short,
};

/// Contract metadata for Antigravity
use soroban_sdk::contractmeta;

contractmeta!(
    key = "Description",
    val = "Decentralized Bounty Board - Stellar Yellow Belt Project"
);

contractmeta!(
    key = "Author",
    val = "Antigravity Developer"
);

contractmeta!(
    key = "Version",
    val = "1.0.0"
);

/// Bounty status enumeration
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum BountyStatus {
    Open = 0,
    Submitted = 1,
    Completed = 2,
    Expired = 3,
}

/// Bounty data structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct Bounty {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub reward: i128,
    pub deadline: u64,
    pub solver: Option<Address>,
    pub proof_url: String,
    pub status: u32,
    pub created_at: u64,
}

/// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    BountyCounter,
    Bounty(u64),
}

/// Main contract
#[contract]
pub struct BountyBoard;

#[contractimpl]
impl BountyBoard {
    
    /// Initialize the contract (must be called once after deployment)
    pub fn initialize(env: Env) {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::BountyCounter) {
            panic!("Contract already initialized");
        }
        
        // Set initial counter to 0
        env.storage().instance().set(&DataKey::BountyCounter, &0u64);
        
        // Emit initialization event
        env.events().publish(
            (symbol_short!("contract"), symbol_short!("init")),
            0u64,
        );
    }

    /// Create a new bounty
    /// 
    /// # Arguments
    /// * `creator` - Address of bounty creator
    /// * `title` - Bounty title
    /// * `description` - Detailed description
    /// * `reward` - Reward amount in stroops
    /// * `deadline` - Unix timestamp deadline
    /// * `token_address` - Token contract address (native XLM)
    /// 
    /// # Returns
    /// * Bounty ID (u64)
    pub fn create_bounty(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        reward: i128,
        deadline: u64,
        token_address: Address,
    ) -> u64 {
        // Authenticate creator
        creator.require_auth();

        // Validate inputs
        if reward <= 0 {
            panic!("Reward must be positive");
        }

        let current_time = env.ledger().timestamp();
        if deadline <= current_time {
            panic!("Deadline must be in the future");
        }

        if title.len() == 0 {
            panic!("Title cannot be empty");
        }

        if description.len() == 0 {
            panic!("Description cannot be empty");
        }

        // Get and increment counter
        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0);
        
        counter += 1;

        // Transfer tokens to contract (escrow)
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &creator,
            &env.current_contract_address(),
            &reward,
        );

        // Create bounty
        let bounty = Bounty {
            id: counter,
            creator: creator.clone(),
            title: title.clone(),
            description,
            reward,
            deadline,
            solver: None,
            proof_url: String::from_str(&env, ""),
            status: BountyStatus::Open as u32,
            created_at: current_time,
        };

        // Save bounty
        env.storage()
            .instance()
            .set(&DataKey::Bounty(counter), &bounty);
        
        env.storage()
            .instance()
            .set(&DataKey::BountyCounter, &counter);

        // Emit event
        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("created")),
            (counter, creator, reward),
        );

        counter
    }

    /// Submit a solution to an open bounty
    /// 
    /// # Arguments
    /// * `bounty_id` - ID of the bounty
    /// * `solver` - Address of the solver
    /// * `proof_url` - URL to proof of completion (e.g., GitHub PR)
    pub fn submit_solution(
        env: Env,
        bounty_id: u64,
        solver: Address,
        proof_url: String,
    ) {
        // Authenticate solver
        solver.require_auth();

        // Validate proof URL
        if proof_url.len() == 0 {
            panic!("Proof URL cannot be empty");
        }

        // Get bounty
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        // Validate status
        if bounty.status != BountyStatus::Open as u32 {
            panic!("Bounty is not open");
        }

        // Check deadline
        let current_time = env.ledger().timestamp();
        if current_time > bounty.deadline {
            bounty.status = BountyStatus::Expired as u32;
            env.storage()
                .instance()
                .set(&DataKey::Bounty(bounty_id), &bounty);
            panic!("Bounty has expired");
        }

        // Update bounty
        bounty.solver = Some(solver.clone());
        bounty.proof_url = proof_url;
        bounty.status = BountyStatus::Submitted as u32;

        env.storage()
            .instance()
            .set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit event
        env.events().publish(
            (symbol_short!("solution"), symbol_short!("submit")),
            (bounty_id, solver),
        );
    }

    /// Approve a submitted solution and release payment
    /// 
    /// # Arguments
    /// * `bounty_id` - ID of the bounty
    /// * `token_address` - Token contract address
    pub fn approve_solution(
        env: Env,
        bounty_id: u64,
        token_address: Address,
    ) {
        // Get bounty
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        // Authenticate creator
        bounty.creator.require_auth();

        // Validate status
        if bounty.status != BountyStatus::Submitted as u32 {
            panic!("No solution submitted");
        }

        let solver = bounty.solver.clone().expect("No solver found");

        // Transfer reward to solver
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &solver,
            &bounty.reward,
        );

        // Update status
        bounty.status = BountyStatus::Completed as u32;
        env.storage()
            .instance()
            .set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit event
        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("complete")),
            (bounty_id, solver, bounty.reward),
        );
    }

    /// Reject a submitted solution and reopen bounty
    /// 
    /// # Arguments
    /// * `bounty_id` - ID of the bounty
    pub fn reject_solution(env: Env, bounty_id: u64) {
        // Get bounty
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        // Authenticate creator
        bounty.creator.require_auth();

        // Validate status
        if bounty.status != BountyStatus::Submitted as u32 {
            panic!("No solution to reject");
        }

        // Reset bounty to open state
        bounty.solver = None;
        bounty.proof_url = String::from_str(&env, "");
        bounty.status = BountyStatus::Open as u32;

        env.storage()
            .instance()
            .set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit event
        env.events().publish(
            (symbol_short!("solution"), symbol_short!("reject")),
            bounty_id,
        );
    }

    /// Get a specific bounty by ID
    /// 
    /// # Arguments
    /// * `bounty_id` - ID of the bounty
    /// 
    /// # Returns
    /// * Bounty data
    pub fn get_bounty(env: Env, bounty_id: u64) -> Bounty {
        env.storage()
            .instance()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found")
    }

    /// Get all bounties
    /// 
    /// # Returns
    /// * Vector of all bounties
    pub fn get_all_bounties(env: Env) -> Vec<Bounty> {
        let counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0);

        let mut bounties = Vec::new(&env);
        
        for id in 1..=counter {
            if let Some(bounty) = env
                .storage()
                .instance()
                .get::<DataKey, Bounty>(&DataKey::Bounty(id))
            {
                bounties.push_back(bounty);
            }
        }

        bounties
    }

    /// Get only open bounties (not expired)
    /// 
    /// # Returns
    /// * Vector of open bounties
    pub fn get_open_bounties(env: Env) -> Vec<Bounty> {
        let counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0);

        let mut open_bounties = Vec::new(&env);
        let current_time = env.ledger().timestamp();

        for id in 1..=counter {
            if let Some(bounty) = env
                .storage()
                .instance()
                .get::<DataKey, Bounty>(&DataKey::Bounty(id))
            {
                if bounty.status == BountyStatus::Open as u32 
                    && bounty.deadline > current_time 
                {
                    open_bounties.push_back(bounty);
                }
            }
        }

        open_bounties
    }

    /// Get bounties created by a specific user
    /// 
    /// # Arguments
    /// * `user` - User's address
    /// 
    /// # Returns
    /// * Vector of user's bounties
    pub fn get_user_bounties(env: Env, user: Address) -> Vec<Bounty> {
        let counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0);

        let mut user_bounties = Vec::new(&env);

        for id in 1..=counter {
            if let Some(bounty) = env
                .storage()
                .instance()
                .get::<DataKey, Bounty>(&DataKey::Bounty(id))
            {
                if bounty.creator == user {
                    user_bounties.push_back(bounty);
                }
            }
        }

        user_bounties
    }

    /// Get total number of bounties
    /// 
    /// # Returns
    /// * Total bounty count
    pub fn get_bounty_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0)
    }

    /// Cancel an open bounty and refund creator
    /// 
    /// # Arguments
    /// * `bounty_id` - ID of the bounty
    /// * `token_address` - Token contract address
    pub fn cancel_bounty(
        env: Env,
        bounty_id: u64,
        token_address: Address,
    ) {
        // Get bounty
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&DataKey::Bounty(bounty_id))
            .expect("Bounty not found");

        // Authenticate creator
        bounty.creator.require_auth();

        // Only open bounties can be cancelled
        if bounty.status != BountyStatus::Open as u32 {
            panic!("Only open bounties can be cancelled");
        }

        // Refund creator
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &bounty.creator,
            &bounty.reward,
        );

        // Mark as expired (reusing status)
        bounty.status = BountyStatus::Expired as u32;
        env.storage()
            .instance()
            .set(&DataKey::Bounty(bounty_id), &bounty);

        // Emit event
        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("cancel")),
            (bounty_id, bounty.creator),
        );
    }
}

mod test;
