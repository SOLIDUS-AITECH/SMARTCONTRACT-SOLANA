//! Events

use anchor_lang::prelude::*;

/// Emitted when Admin pauses the game
#[event]
pub struct Paused {}

/// Emitted when Admin unpauses the game
#[event]
pub struct UnPaused {}

#[event]
pub struct MaximumWithdrawChange {
	pub new_maximum_withdraw: u64,
}

#[event]
pub struct MinimumWithdrawChange {
	pub new_minimum_withdraw: u64,
}

#[event]
pub struct WithdrawSignerChange {
	pub new_withdraw_signer: Pubkey,
}

#[event]
pub struct StakingWalletChange {
	pub new_staking_wallet: Pubkey,
}

#[event]
pub struct FeeWalletChange {
	pub new_fee_wallet: Pubkey,
}

#[event]
pub struct StakingRateChange {
	pub new_staking_rate: u16,
}

#[event]
pub struct BurnRateChange {
	pub new_burn_rate: u16,
}

#[event]
pub struct FeeRateChange {
	pub new_fee_rate: u16,
}

#[event]
pub struct Deposit {
	#[index]
	pub from: Pubkey,
	pub amount_aitech: u64,
	pub transfer_amount: u64,
	pub burn_amount: u64,
	pub staking_amount: u64,
	pub extra_data: Vec<u8>,
}

#[event]
pub struct Withdraw {
	#[index]
	pub to: Pubkey,
	pub token_out: Pubkey,
	pub amount: u64,
	pub swap_amount: u64,
	pub fee_amount: u64,
	pub withdraw_request_id: u64,
}
