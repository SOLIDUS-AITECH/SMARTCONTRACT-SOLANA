//! Set Minimum Withdraw Instruction

use crate::{impl_only_owner, impl_when_paused, states::config::Config, utils::CONFIG_SEED};
use anchor_lang::prelude::*;

/// Initialize Context
#[derive(Accounts)]
pub struct SetMinimumWithdraw<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,
}

impl_only_owner!(SetMinimumWithdraw);
impl_when_paused!(SetMinimumWithdraw);

pub fn handler(ctx: Context<SetMinimumWithdraw>, new_minimum_withdraw: u64) -> Result<()> {
	ctx.accounts.config.set_minimum_withdraw(new_minimum_withdraw)
}
