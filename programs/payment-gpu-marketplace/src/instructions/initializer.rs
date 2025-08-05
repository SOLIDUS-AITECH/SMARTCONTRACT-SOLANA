//! Initialize Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	states::config::Config,
	utils::{create_token_account, AUTH_SEED, CONFIG_SEED, PROGRAM_TOKEN_VAULT_SEED},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use raydium_cp_swap::program::RaydiumCpSwap;

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	/// CHECK: program authority
	#[account(
			mut,
      seeds = [AUTH_SEED],
      bump,
  )]
	pub authority: UncheckedAccount<'info>,

	#[account(
    init,
    seeds = [CONFIG_SEED],
    bump,
    payer = signer,
    space = 8 + Config::INIT_SPACE
  )]
	pub config: Account<'info, Config>,

	#[account(mut)]
	pub aitech_token: Account<'info, Mint>,

	/// CHECK: AITECH token vault of Program
	#[account(
    mut,
		seeds = [PROGRAM_TOKEN_VAULT_SEED, aitech_token.key().as_ref()],
    bump,
  )]
	pub program_token_vault: UncheckedAccount<'info>,

	#[account(
      mut,
      constraint = fee_wallet.mint == aitech_token.key() @ PaymentGpuMarketplaceErrorCode::InvalidAddress,
  )]
	pub fee_wallet: Account<'info, TokenAccount>,

	#[account(
      mut,
      constraint = staking_wallet.mint == aitech_token.key() @ PaymentGpuMarketplaceErrorCode::InvalidAddress,
  )]
	pub staking_wallet: Account<'info, TokenAccount>,

	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,

	/// CHECKED Raydium pool state
	pub pool_state: UncheckedAccount<'info>,
	/// CHECKED Raydium program
	pub cp_swap_program: Program<'info, RaydiumCpSwap>,
}

pub fn handler(
	ctx: Context<Initialize>,
	fee_rate: u16,
	staking_rate: u16,
	burn_rate: u16,
	minimum_withdraw: u64,
	maximum_withdraw: u64,
	owner: Pubkey,
	withdraw_signer: Pubkey,
) -> Result<()> {
	// cannot re initialize because `config` already in use
	ctx.accounts.config.set_inner(Config {
		authority_bump: ctx.bumps.authority,
		program_token_vault_bump: ctx.bumps.program_token_vault,
		paused: false,
		fee_rate,
		staking_rate,
		burn_rate,
		minimum_withdraw,
		maximum_withdraw,
		owner,
		withdraw_signer,
		aitech_token: ctx.accounts.aitech_token.key(),
		fee_wallet: ctx.accounts.fee_wallet.key(),
		staking_wallet: ctx.accounts.staking_wallet.key(),
		swap_program: ctx.accounts.cp_swap_program.key(),
		pool_state: ctx.accounts.pool_state.key(),
	});

	// create `vault` account
	create_token_account(
		&ctx.accounts.authority.to_account_info(),
		&ctx.accounts.signer.to_account_info(),
		&ctx.accounts.program_token_vault.to_account_info(),
		&ctx.accounts.aitech_token.to_account_info(),
		&ctx.accounts.system_program.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&[&[
			PROGRAM_TOKEN_VAULT_SEED,
			ctx.accounts.aitech_token.key().as_ref(),
			&[ctx.bumps.program_token_vault][..],
		][..]],
	)?;

	Ok(())
}
