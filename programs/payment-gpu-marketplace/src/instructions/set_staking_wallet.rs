//! Set Staking Wallet Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode, impl_only_owner, impl_when_paused,
	states::config::Config, utils::CONFIG_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct SetStakingWallet<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	#[account(
		constraint = staking_wallet.mint == config.aitech_token.key() @ PaymentGpuMarketplaceErrorCode::InvalidAddress,
	)]
	pub staking_wallet: Account<'info, TokenAccount>,
}

impl_only_owner!(SetStakingWallet);
impl_when_paused!(SetStakingWallet);

pub fn handler(ctx: Context<SetStakingWallet>) -> Result<()> {
	ctx.accounts.config.set_staking_wallet(ctx.accounts.staking_wallet.key())
}
