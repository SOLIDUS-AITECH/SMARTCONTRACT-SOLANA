//! Set Staking Rate Instruction

use crate::{impl_only_owner, impl_when_paused, states::config::Config, utils::CONFIG_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetStakingRate<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,
}

impl_only_owner!(SetStakingRate);
impl_when_paused!(SetStakingRate);

pub fn handler(ctx: Context<SetStakingRate>, new_staking_rate: u16) -> Result<()> {
	ctx.accounts.config.set_staking_rate(new_staking_rate)
}
