//! Update Config Instruction

use crate::{
	impl_only_owner, impl_when_paused,
	states::config::Config,
	utils::{AUTH_SEED, CONFIG_SEED},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	/// CHECK: program authority
	#[account(
      seeds = [AUTH_SEED],
      bump,
  )]
	pub authority: UncheckedAccount<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	#[account(
      mut,
      constraint = fee_wallet.mint == config.aitech_token.key(),
  )]
	pub fee_wallet: Account<'info, TokenAccount>,

	#[account(
      mut,
      constraint = staking_wallet.mint == config.aitech_token.key(),
  )]
	pub staking_wallet: Account<'info, TokenAccount>,

	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

impl_only_owner!(UpdateConfig);
impl_when_paused!(UpdateConfig);

pub fn handler(
	ctx: Context<UpdateConfig>,
	fee_rate: u16,
	staking_rate: u16,
	burn_rate: u16,
	minimum_withdraw: u64,
	maximum_withdraw: u64,
) -> Result<()> {
	ctx.accounts.config.set_maximum_withdraw(maximum_withdraw)?;
	ctx.accounts.config.set_minimum_withdraw(minimum_withdraw)?;
	ctx.accounts.config.set_staking_wallet(ctx.accounts.staking_wallet.key())?;
	ctx.accounts.config.set_staking_rate(staking_rate)?;
	ctx.accounts.config.set_burn_rate(burn_rate)?;
	ctx.accounts.config.set_fee_wallet(ctx.accounts.fee_wallet.key())?;
	ctx.accounts.config.set_fee_rate(fee_rate)?;

	Ok(())
}
