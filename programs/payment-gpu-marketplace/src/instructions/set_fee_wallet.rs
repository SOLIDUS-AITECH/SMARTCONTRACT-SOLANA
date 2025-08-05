//! Set Fee Wallet Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode, impl_only_owner, impl_when_paused,
	states::config::Config, utils::CONFIG_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct SetFeeWallet<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
		mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	#[account(
      constraint = fee_wallet.mint == config.aitech_token.key() @ PaymentGpuMarketplaceErrorCode::InvalidAddress,
  )]
	pub fee_wallet: Account<'info, TokenAccount>,
}

impl_only_owner!(SetFeeWallet);
impl_when_paused!(SetFeeWallet);

pub fn handler(ctx: Context<SetFeeWallet>) -> Result<()> {
	ctx.accounts.config.set_fee_wallet(ctx.accounts.fee_wallet.key())
}
