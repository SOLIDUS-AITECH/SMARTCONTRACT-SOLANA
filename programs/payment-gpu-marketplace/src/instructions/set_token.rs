//! SetToken Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	impl_only_owner, impl_when_paused,
	states::config::Config,
	utils::{
		create_token_account, transfer_from_pool_vault_to_user, AUTH_SEED, CONFIG_SEED,
		PROGRAM_TOKEN_VAULT_SEED,
	},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct SetToken<'info> {
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
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	#[account(mut)]
	pub new_aitech_token: Account<'info, Mint>,

	#[account(mut, address = config.aitech_token)]
	pub aitech_token: Account<'info, Mint>,

	/// CHECK: AITECH token vault of Program
	#[account(
    mut,
		seeds = [PROGRAM_TOKEN_VAULT_SEED, config.aitech_token.key().as_ref()],
    bump,
  )]
	pub program_token_vault: Account<'info, TokenAccount>,

	/// CHECK: AITECH token vault of Program
	#[account(
    mut,
		seeds = [PROGRAM_TOKEN_VAULT_SEED, new_aitech_token.key().as_ref()],
    bump,
  )]
	pub new_program_token_vault: UncheckedAccount<'info>,

	#[account(
      mut,
			address = config.fee_wallet @ PaymentGpuMarketplaceErrorCode::InvalidAddress,
  )]
	pub fee_wallet: Account<'info, TokenAccount>,

	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

impl_only_owner!(SetToken);
impl_when_paused!(SetToken);

pub fn handler(ctx: Context<SetToken>) -> Result<()> {
	require!(
		ctx.bumps.authority == ctx.accounts.config.authority_bump,
		PaymentGpuMarketplaceErrorCode::InvalidBump
	);
	require!(
		ctx.bumps.program_token_vault == ctx.accounts.config.program_token_vault_bump,
		PaymentGpuMarketplaceErrorCode::InvalidBump
	);

	let authority_signer: &[&[&[u8]]] = &[&[AUTH_SEED, &[ctx.bumps.authority][..]]];

	if ctx.accounts.program_token_vault.amount != 0 {
		transfer_from_pool_vault_to_user(
			ctx.accounts.authority.to_account_info(),
			ctx.accounts.program_token_vault.to_account_info(),
			ctx.accounts.fee_wallet.to_account_info(),
			ctx.accounts.aitech_token.to_account_info(),
			ctx.accounts.token_program.to_account_info(),
			ctx.accounts.program_token_vault.amount,
			ctx.accounts.aitech_token.decimals,
			authority_signer,
		)?;
	}

	let cpi_accounts = anchor_spl::token::CloseAccount {
		account: ctx.accounts.program_token_vault.to_account_info(),
		destination: ctx.accounts.signer.to_account_info(),
		authority: ctx.accounts.authority.to_account_info(),
	};
	let cpi_program = ctx.accounts.token_program.to_account_info();
	let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, authority_signer);
	anchor_spl::token::close_account(cpi_ctx)?;

	// create `vault` account
	create_token_account(
		&ctx.accounts.authority.to_account_info(),
		&ctx.accounts.signer.to_account_info(),
		&ctx.accounts.new_program_token_vault.to_account_info(),
		&ctx.accounts.new_aitech_token.to_account_info(),
		&ctx.accounts.system_program.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&[&[
			PROGRAM_TOKEN_VAULT_SEED,
			ctx.accounts.new_aitech_token.key().as_ref(),
			&[ctx.bumps.new_program_token_vault][..],
		][..]],
	)?;

	ctx.accounts.config.program_token_vault_bump = ctx.bumps.new_program_token_vault;
	ctx.accounts.config.aitech_token = ctx.accounts.new_aitech_token.key();

	Ok(())
}
