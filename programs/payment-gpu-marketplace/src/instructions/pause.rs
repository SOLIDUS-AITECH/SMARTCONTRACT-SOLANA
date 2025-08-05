//! Pause Instruction.

use crate::{
	errors::PaymentGpuMarketplaceErrorCode, events::Paused, impl_only_owner, impl_when_not_paused,
	states::config::Config,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Pause<'info> {
	/// The signer account
	#[account(mut)]
	pub signer: Signer<'info>,

	/// The game state
	#[account(mut)]
	pub config: Account<'info, Config>,
}

impl_only_owner!(Pause);
impl_when_not_paused!(Pause);

pub fn handler(ctx: Context<Pause>) -> Result<()> {
	require!(!ctx.accounts.config.paused, PaymentGpuMarketplaceErrorCode::NotPaused);

	ctx.accounts.config.paused = true;

	emit!(Paused {});

	Ok(())
}
