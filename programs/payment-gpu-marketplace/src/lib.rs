#![allow(ambiguous_glob_reexports)]

use anchor_lang::prelude::*;

declare_id!("BV7ZPynu7mnNKP2RNhVsqxXSfEsuZLcx1xfvsZ5z63UU");

mod errors;
mod events;
mod instructions;
mod states;
mod utils;

pub use crate::states::*;

pub use instructions::*;

#[program]
pub mod payment_gpu_marketplace {
	use super::*;

	pub fn initialize(
		ctx: Context<Initialize>,
		fee_rate: u16,
		staking_rate: u16,
		burn_rate: u16,
		minimum_withdraw: u64,
		maximum_withdraw: u64,
		owner: Pubkey,
		withdraw_signer: Pubkey,
	) -> Result<()> {
		initializer::handler(
			ctx,
			fee_rate,
			staking_rate,
			burn_rate,
			minimum_withdraw,
			maximum_withdraw,
			owner,
			withdraw_signer,
		)
	}

	#[access_control(Pause::only_owner(&ctx))]
	#[access_control(Pause::when_not_paused(&ctx))]
	pub fn pause(ctx: Context<Pause>) -> Result<()> {
		pause::handler(ctx)
	}

	#[access_control(UnPause::only_owner(&ctx))]
	#[access_control(UnPause::when_paused(&ctx))]
	pub fn unpause(ctx: Context<UnPause>) -> Result<()> {
		unpause::handler(ctx)
	}

	#[access_control(UpdateConfig::only_owner(&ctx))]
	#[access_control(UpdateConfig::when_paused(&ctx))]
	pub fn update_config(
		ctx: Context<UpdateConfig>,
		fee_rate: u16,
		staking_rate: u16,
		burn_rate: u16,
		minimum_withdraw: u64,
		maximum_withdraw: u64,
	) -> Result<()> {
		update_config::handler(
			ctx,
			fee_rate,
			staking_rate,
			burn_rate,
			minimum_withdraw,
			maximum_withdraw,
		)
	}

	#[access_control(SetMaximumWithdraw::only_owner(&ctx))]
	#[access_control(SetMaximumWithdraw::when_paused(&ctx))]
	pub fn set_maximum_withdraw(
		ctx: Context<SetMaximumWithdraw>,
		new_maximum_withdraw: u64,
	) -> Result<()> {
		set_maximum_withdraw::handler(ctx, new_maximum_withdraw)
	}

	#[access_control(SetMinimumWithdraw::only_owner(&ctx))]
	#[access_control(SetMinimumWithdraw::when_paused(&ctx))]
	pub fn set_minimum_withdraw(
		ctx: Context<SetMinimumWithdraw>,
		new_minimum_withdraw: u64,
	) -> Result<()> {
		set_minimum_withdraw::handler(ctx, new_minimum_withdraw)
	}

	#[access_control(SetWithdrawSigner::only_owner(&ctx))]
	#[access_control(SetWithdrawSigner::when_paused(&ctx))]
	pub fn set_withdraw_signer(
		ctx: Context<SetWithdrawSigner>,
		new_withdraw_signer: Pubkey,
	) -> Result<()> {
		set_withdraw_signer::handler(ctx, new_withdraw_signer)
	}

	#[access_control(SetStakingWallet::only_owner(&ctx))]
	#[access_control(SetStakingWallet::when_paused(&ctx))]
	pub fn set_staking_wallet(ctx: Context<SetStakingWallet>) -> Result<()> {
		set_staking_wallet::handler(ctx)
	}

	#[access_control(SetStakingRate::only_owner(&ctx))]
	#[access_control(SetStakingRate::when_paused(&ctx))]
	pub fn set_staking_rate(ctx: Context<SetStakingRate>, new_staking_rate: u16) -> Result<()> {
		set_staking_rate::handler(ctx, new_staking_rate)
	}

	#[access_control(SetBurnRate::only_owner(&ctx))]
	#[access_control(SetBurnRate::when_paused(&ctx))]
	pub fn set_burn_rate(ctx: Context<SetBurnRate>, new_burn_rate: u16) -> Result<()> {
		set_burn_rate::handler(ctx, new_burn_rate)
	}

	#[access_control(SetFeeWallet::only_owner(&ctx))]
	#[access_control(SetFeeWallet::when_paused(&ctx))]
	pub fn set_fee_wallet(ctx: Context<SetFeeWallet>) -> Result<()> {
		set_fee_wallet::handler(ctx)
	}

	#[access_control(SetFeeRate::only_owner(&ctx))]
	#[access_control(SetFeeRate::when_paused(&ctx))]
	pub fn set_fee_rate(ctx: Context<SetFeeRate>, new_fee_rate: u16) -> Result<()> {
		set_fee_rate::handler(ctx, new_fee_rate)
	}

	#[access_control(SetToken::only_owner(&ctx))]
	#[access_control(SetToken::when_paused(&ctx))]
	pub fn set_token(ctx: Context<SetToken>) -> Result<()> {
		set_token::handler(ctx)
	}

	#[access_control(SetRouter::only_owner(&ctx))]
	#[access_control(SetRouter::when_paused(&ctx))]
	pub fn set_router(ctx: Context<SetRouter>) -> Result<()> {
		set_router::handler(ctx)
	}

	#[access_control(EmergencyWithdraw::only_owner(&ctx))]
	pub fn emergency_withdraw(ctx: Context<EmergencyWithdraw>, amount: u64) -> Result<()> {
		emergency_withdraw::handler(ctx, amount)
	}

	#[access_control(DepositCtx::when_not_paused(&ctx))]
	pub fn deposit(
		ctx: Context<DepositCtx>,
		amount_aitech: u64,
		extra_data: Vec<u8>,
	) -> Result<()> {
		deposit::handler(ctx, amount_aitech, extra_data)
	}

	#[access_control(WithdrawCtx::when_not_paused(&ctx))]
	pub fn withdraw(
		ctx: Context<WithdrawCtx>,
		amount: u64,
		amount_in_maximum: u64,
		withdraw_request_id: u64,
		withdraw_request_timestamp: u64,
	) -> Result<()> {
		withdraw::handler(
			ctx,
			amount,
			amount_in_maximum,
			withdraw_request_id,
			withdraw_request_timestamp,
		)
	}
}
