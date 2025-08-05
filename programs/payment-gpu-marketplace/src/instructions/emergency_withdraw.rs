//! Emergency Withdraw Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	impl_only_owner,
	states::config::Config,
	utils::{transfer_from_pool_vault_to_user, AUTH_SEED, CONFIG_SEED, PROGRAM_TOKEN_VAULT_SEED},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
#[instruction(withdraw_request_id: u64)]
pub struct EmergencyWithdraw<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	/// CHECK: program authority account
	#[account(
		mut,
		seeds = [AUTH_SEED],
		bump,
	)]
	pub authority: UncheckedAccount<'info>,

	/// CHECK: program authority account
	#[account(
		mut,
		seeds = [PROGRAM_TOKEN_VAULT_SEED, config.aitech_token.key().as_ref()],
		bump,
		constraint = program_token_vault.mint == aitech_token.key()
			@ PaymentGpuMarketplaceErrorCode::InvalidAddress,
	)]
	pub program_token_vault: Account<'info, TokenAccount>,

	#[account(
		mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	#[account(mut, address = config.aitech_token)]
	pub aitech_token: Account<'info, Mint>,
	pub aitech_token_program: Program<'info, Token>,

	#[account(
			mut,
      constraint = fee_wallet.mint == config.aitech_token.key() &&
				config.fee_wallet == fee_wallet.key()
				@ PaymentGpuMarketplaceErrorCode::InvalidAddress,
  )]
	pub fee_wallet: Account<'info, TokenAccount>,

	pub system_program: Program<'info, System>,
}

impl_only_owner!(EmergencyWithdraw);

pub fn handler(ctx: Context<EmergencyWithdraw>, amount: u64) -> Result<()> {
	require!(
		ctx.bumps.authority == ctx.accounts.config.authority_bump,
		PaymentGpuMarketplaceErrorCode::InvalidBump
	);
	require!(
		ctx.bumps.program_token_vault == ctx.accounts.config.program_token_vault_bump,
		PaymentGpuMarketplaceErrorCode::InvalidBump
	);
	require!(
		ctx.accounts.program_token_vault.amount >= amount,
		PaymentGpuMarketplaceErrorCode::InsufficientBalance
	);
	require!(amount > 0, PaymentGpuMarketplaceErrorCode::ZeroAmount);

	transfer_from_pool_vault_to_user(
		ctx.accounts.authority.to_account_info(),
		ctx.accounts.program_token_vault.to_account_info(),
		ctx.accounts.fee_wallet.to_account_info(),
		ctx.accounts.aitech_token.to_account_info(),
		ctx.accounts.aitech_token_program.to_account_info(),
		amount,
		ctx.accounts.aitech_token.decimals,
		&[&[AUTH_SEED, &[ctx.bumps.authority][..]]],
	)?;

	Ok(())
}
