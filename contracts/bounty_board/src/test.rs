#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env, String,
};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let token_address = env.register_stellar_asset_contract(admin.clone());
    (
        token::Client::new(env, &token_address),
        token::StellarAssetClient::new(env, &token_address)
    )
}

fn create_bounty_board_contract<'a>(env: &Env) -> BountyBoardClient<'a> {
    BountyBoardClient::new(env, &env.register_contract(None, BountyBoard {}))
}

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract = create_bounty_board_contract(&env);

    contract.initialize();

    assert_eq!(contract.get_bounty_count(), 0);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    let contract = create_bounty_board_contract(&env);

    contract.initialize();
    contract.initialize(); // Should panic
}

#[test]
fn test_create_bounty() {
    let env = Env::default();
    env.mock_all_auths();

    let contract = create_bounty_board_contract(&env);
    let creator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    // Mint tokens to creator
    token_admin_client.mint(&creator, &1000);

    // Initialize contract
    contract.initialize();

    // Set ledger timestamp
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create bounty
    let bounty_id = contract.create_bounty(
        &creator,
        &String::from_str(&env, "Test Bounty"),
        &String::from_str(&env, "This is a test bounty"),
        &100,
        &2000, // deadline
        &token.address,
    );

    assert_eq!(bounty_id, 1);
    assert_eq!(contract.get_bounty_count(), 1);

    // Verify bounty
    let bounty = contract.get_bounty(&1);
    assert_eq!(bounty.id, 1);
    assert_eq!(bounty.creator, creator);
    assert_eq!(bounty.reward, 100);
    assert_eq!(bounty.status, BountyStatus::Open as u32);
}

#[test]
#[should_panic(expected = "Reward must be positive")]
fn test_create_bounty_invalid_reward() {
    let env = Env::default();
    env.mock_all_auths();

    let contract = create_bounty_board_contract(&env);
    let creator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&creator, &1000);
    contract.initialize();

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    contract.create_bounty(
        &creator,
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Test"),
        &0, // Invalid reward
        &2000,
        &token.address,
    );
}

#[test]
fn test_submit_solution() {
    let env = Env::default();
    env.mock_all_auths();

    let contract = create_bounty_board_contract(&env);
    let creator = Address::generate(&env);
    let solver = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&creator, &1000);

    contract.initialize();

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create bounty
    let bounty_id = contract.create_bounty(
        &creator,
        &String::from_str(&env, "Test Bounty"),
        &String::from_str(&env, "Description"),
        &100,
        &2000,
        &token.address,
    );

    // Submit solution
    contract.submit_solution(
        &bounty_id,
        &solver,
        &String::from_str(&env, "https://github.com/user/repo/pull/1"),
    );

    // Verify
    let bounty = contract.get_bounty(&bounty_id);
    assert_eq!(bounty.status, BountyStatus::Submitted as u32);
    assert_eq!(bounty.solver, Some(solver));
}

#[test]
fn test_approve_solution() {
    let env = Env::default();
    env.mock_all_auths();

    let contract = create_bounty_board_contract(&env);
    let creator = Address::generate(&env);
    let solver = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&creator, &1000);

    contract.initialize();

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create and submit
    let bounty_id = contract.create_bounty(
        &creator,
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Test"),
        &100,
        &2000,
        &token.address,
    );

    contract.submit_solution(
        &bounty_id,
        &solver,
        &String::from_str(&env, "proof"),
    );

    // Get solver balance before
    let balance_before = token.balance(&solver);

    // Approve
    contract.approve_solution(&bounty_id, &token.address);

    // Verify
    let bounty = contract.get_bounty(&bounty_id);
    assert_eq!(bounty.status, BountyStatus::Completed as u32);

    let balance_after = token.balance(&solver);
    assert_eq!(balance_after, balance_before + 100);
}

#[test]
fn test_reject_solution() {
    let env = Env::default();
    env.mock_all_auths();

    let contract = create_bounty_board_contract(&env);
    let creator = Address::generate(&env);
    let solver = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&creator, &1000);
    contract.initialize();

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    let bounty_id = contract.create_bounty(
        &creator,
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Test"),
        &100,
        &2000,
        &token.address,
    );

    contract.submit_solution(
        &bounty_id,
        &solver,
        &String::from_str(&env, "proof"),
    );

    // Reject
    contract.reject_solution(&bounty_id);

    // Verify back to open
    let bounty = contract.get_bounty(&bounty_id);
    assert_eq!(bounty.status, BountyStatus::Open as u32);
    assert_eq!(bounty.solver, None);
}

#[test]
fn test_get_open_bounties() {
    let env = Env::default();
    env.mock_all_auths();

    let contract = create_bounty_board_contract(&env);
    let creator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&creator, &1000);
    contract.initialize();

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Create multiple bounties
    contract.create_bounty(
        &creator,
        &String::from_str(&env, "Bounty 1"),
        &String::from_str(&env, "Desc 1"),
        &100,
        &2000,
        &token.address,
    );

    contract.create_bounty(
        &creator,
        &String::from_str(&env, "Bounty 2"),
        &String::from_str(&env, "Desc 2"),
        &200,
        &3000,
        &token.address,
    );

    let open_bounties = contract.get_open_bounties();
    assert_eq!(open_bounties.len(), 2);
}
