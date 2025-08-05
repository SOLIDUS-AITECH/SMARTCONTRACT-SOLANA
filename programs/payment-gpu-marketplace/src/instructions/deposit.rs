//! Deposit Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	events::Deposit,
	impl_when_not_paused,
	states::config::Config,
	utils::{
		burn_from_user, transfer_from_user_to_pool_vault, AUTH_SEED, CONFIG_SEED,
		PERCENT_DENOMINATOR, PROGRAM_TOKEN_VAULT_SEED,
	},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct DepositCtx<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
		mut,
		constraint = signer_token_account.mint == aitech_token.key() &&
			signer_token_account.owner == signer.key()
			@ PaymentGpuMarketplaceErrorCode::InvalidAddress,
	)]
	pub signer_token_account: Account<'info, TokenAccount>,

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
	)]
	pub program_token_vault: UncheckedAccount<'info>,

	#[account(
		mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,

	#[account(mut, address = config.aitech_token)]
	pub aitech_token: Account<'info, Mint>,

	#[account(
		  mut,
			constraint = config.staking_wallet == staking_wallet.key()
				@ PaymentGpuMarketplaceErrorCode::InvalidAddress,
	)]
	pub staking_wallet: Account<'info, TokenAccount>,

	pub token_program: Program<'info, Token>,
	pub system_program: Program<'info, System>,
}

impl_when_not_paused!(DepositCtx);

pub fn handler(ctx: Context<DepositCtx>, amount_aitech: u64, extra_data: Vec<u8>) -> Result<()> {
	require!(amount_aitech > 0, PaymentGpuMarketplaceErrorCode::ZeroAmount);
	require!(
		ctx.bumps.authority == ctx.accounts.config.authority_bump,
		PaymentGpuMarketplaceErrorCode::InvalidBump
	);
	require!(
		ctx.bumps.program_token_vault == ctx.accounts.config.program_token_vault_bump,
		PaymentGpuMarketplaceErrorCode::InvalidBump
	);

	let config = ctx.accounts.config.clone();

	let denominator = PERCENT_DENOMINATOR as u64;
	let burn_amount = {
		let burn_rate = config.burn_rate as u64;
		amount_aitech
			.checked_mul(burn_rate)
			.and_then(|x| x.checked_div(denominator))
			.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?
	};
	let staking_amount = {
		let staking_rate = config.staking_rate as u64;
		amount_aitech
			.checked_mul(staking_rate)
			.and_then(|x| x.checked_div(denominator))
			.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?
	};

	let transfer_amount = amount_aitech
		.checked_sub(burn_amount)
		.and_then(|x| x.checked_sub(staking_amount))
		.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?;

	burn_from_user(
		ctx.accounts.signer.to_account_info(),
		ctx.accounts.signer_token_account.to_account_info(),
		ctx.accounts.aitech_token.to_account_info(),
		ctx.accounts.token_program.to_account_info(),
		burn_amount as u64,
	)?;

	transfer_from_user_to_pool_vault(
		ctx.accounts.signer.to_account_info(),
		ctx.accounts.signer_token_account.to_account_info(),
		ctx.accounts.staking_wallet.to_account_info(),
		ctx.accounts.aitech_token.to_account_info(),
		ctx.accounts.token_program.to_account_info(),
		staking_amount as u64,
		ctx.accounts.aitech_token.decimals,
	)?;

	transfer_from_user_to_pool_vault(
		ctx.accounts.signer.to_account_info(),
		ctx.accounts.signer_token_account.to_account_info(),
		ctx.accounts.program_token_vault.to_account_info(),
		ctx.accounts.aitech_token.to_account_info(),
		ctx.accounts.token_program.to_account_info(),
		transfer_amount as u64,
		ctx.accounts.aitech_token.decimals,
	)?;

	emit!(Deposit {
		from: ctx.accounts.signer.key(),
		amount_aitech,
		transfer_amount,
		burn_amount,
		staking_amount,
		extra_data,
	});

	Ok(())
}
