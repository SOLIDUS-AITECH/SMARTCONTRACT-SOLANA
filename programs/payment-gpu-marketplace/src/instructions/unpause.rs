//! UnPause Instruction.

use crate::{
	errors::PaymentGpuMarketplaceErrorCode, events::UnPaused, impl_only_owner, impl_when_paused,
	states::config::Config,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UnPause<'info> {
	/// The admin account
	#[account(mut)]
	pub signer: Signer<'info>,

	/// The game state
	#[account(mut)]
	pub config: Account<'info, Config>,
}

impl_only_owner!(UnPause);
impl_when_paused!(UnPause);

pub fn handler(ctx: Context<UnPause>) -> Result<()> {
	require!(ctx.accounts.config.paused, PaymentGpuMarketplaceErrorCode::NotPaused);

	ctx.accounts.config.paused = false;

	emit!(UnPaused {});

	Ok(())
}
