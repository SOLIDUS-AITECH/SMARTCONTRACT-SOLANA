//! Set Fee Rate Instruction

use crate::{impl_only_owner, impl_when_paused, states::config::Config, utils::CONFIG_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetFeeRate<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,
}

impl_only_owner!(SetFeeRate);
impl_when_paused!(SetFeeRate);

pub fn handler(ctx: Context<SetFeeRate>, new_fee_rate: u16) -> Result<()> {
	ctx.accounts.config.set_fee_rate(new_fee_rate)
}
