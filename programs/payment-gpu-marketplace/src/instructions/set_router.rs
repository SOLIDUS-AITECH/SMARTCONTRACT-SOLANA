//! Withdraw Instruction

use crate::{
	impl_only_owner, impl_when_paused,
	states::config::Config, utils::CONFIG_SEED,
};
use anchor_lang::prelude::*;
use raydium_cp_swap::program::RaydiumCpSwap;

#[derive(Accounts)]
pub struct SetRouter<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
		mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	/// CHECKED Raydium pool state
	pub pool_state: UncheckedAccount<'info>,
	/// CHECKED Raydium program
	pub cp_swap_program: Program<'info, RaydiumCpSwap>,
}

impl_when_paused!(SetRouter);
impl_only_owner!(SetRouter);

pub fn handler(ctx: Context<SetRouter>) -> Result<()> {
	ctx.accounts.config.swap_program = ctx.accounts.cp_swap_program.key();
	ctx.accounts.config.pool_state = ctx.accounts.pool_state.key();

	Ok(())
}
