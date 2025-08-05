//! Set Maximum Withdraw Instruction

use crate::{impl_only_owner, impl_when_paused, states::config::Config, utils::CONFIG_SEED};
use anchor_lang::prelude::*;

/// Initialize Context
#[derive(Accounts)]
pub struct SetMaximumWithdraw<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,
}

impl_only_owner!(SetMaximumWithdraw);
impl_when_paused!(SetMaximumWithdraw);

pub fn handler(ctx: Context<SetMaximumWithdraw>, new_maximum_withdraw: u64) -> Result<()> {
	ctx.accounts.config.set_maximum_withdraw(new_maximum_withdraw)
}
