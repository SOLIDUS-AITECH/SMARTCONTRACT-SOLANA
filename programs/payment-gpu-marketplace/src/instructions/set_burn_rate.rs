//! Set Burn Rate Instruction

use crate::{impl_only_owner, impl_when_paused, states::config::Config, utils::CONFIG_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetBurnRate<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,
}

impl_only_owner!(SetBurnRate);
impl_when_paused!(SetBurnRate);

pub fn handler(ctx: Context<SetBurnRate>, new_burn_rate: u16) -> Result<()> {
	ctx.accounts.config.set_burn_rate(new_burn_rate)
}
