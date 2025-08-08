//! Withdraw Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	events::Withdraw,
	impl_when_not_paused,
	states::config::Config,
	utils::{
		transfer_from_pool_vault_to_user, AUTH_SEED, CONFIG_SEED,
		PERCENT_DENOMINATOR, PROGRAM_TOKEN_VAULT_SEED, WITHDRAW_REQUEST_SEED,
	},
	withdrawal::Withdrawal,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
#[instruction(_amount: u64, withdraw_request_id: u64)]
pub struct WithdrawCtx<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(mut, address = config.withdraw_signer)]
	pub withdraw_signer: Signer<'info>,

	#[account(
		mut,
		constraint = signer_token_account.owner == signer.key()
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

	#[account(
		init,
		seeds = [WITHDRAW_REQUEST_SEED, signer.key().as_ref(), withdraw_request_id.to_le_bytes().as_ref()],
		bump,
		payer = signer,
		space = 8 + Withdrawal::INIT_SPACE,
	)]
	pub withdraw_request: Account<'info, Withdrawal>,

	/// CHECK: program authority account
	#[account(
		mut,
		seeds = [PROGRAM_TOKEN_VAULT_SEED, config.aitech_token.key().as_ref()],
		bump,
		constraint = program_token_vault.mint == aitech_token.key()
			@ PaymentGpuMarketplaceErrorCode::InvalidAddress,
	)]
	pub program_token_vault: Box<Account<'info, TokenAccount>>,

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
	pub fee_wallet: Box<Account<'info, TokenAccount>>,

	pub system_program: Program<'info, System>,
}

impl_when_not_paused!(WithdrawCtx);

pub fn handler(
	ctx: Context<WithdrawCtx>,
	amount: u64,
	withdraw_request_id: u64,
	withdraw_request_timestamp: u64,
) -> Result<()> {
	let block_time = Clock::get()?.unix_timestamp as u64;
	require!(
		block_time <= withdraw_request_timestamp,
		PaymentGpuMarketplaceErrorCode::TransactionTimeout
	);

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
	let fee_rate = config.fee_rate as u64;
	let authority_seeds: &[&[&[u8]]] = &[&[AUTH_SEED, &[ctx.bumps.authority][..]]];

	require!(
		amount >= config.minimum_withdraw,
		PaymentGpuMarketplaceErrorCode::AmountLowerThanMinimumWithdraw
	);
	require!(
		amount <= config.maximum_withdraw,
		PaymentGpuMarketplaceErrorCode::AmountGreaterThanMaximumWithdraw
	);

	let fee_amount = amount
		.checked_mul(fee_rate)
		.and_then(|v| v.checked_div(denominator))
		.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?;

	let transfer_amount = amount - fee_amount;

	transfer_from_pool_vault_to_user(
		ctx.accounts.authority.to_account_info(),
		ctx.accounts.program_token_vault.to_account_info(),
		ctx.accounts.fee_wallet.to_account_info(),
		ctx.accounts.aitech_token.to_account_info(),
		ctx.accounts.aitech_token_program.to_account_info(),
		fee_amount,
		ctx.accounts.aitech_token.decimals,
		authority_seeds,
	)?;

	transfer_from_pool_vault_to_user(
		ctx.accounts.authority.to_account_info(),
		ctx.accounts.program_token_vault.to_account_info(),
		ctx.accounts.signer_token_account.to_account_info(),
		ctx.accounts.aitech_token.to_account_info(),
		ctx.accounts.aitech_token_program.to_account_info(),
		transfer_amount,
		ctx.accounts.aitech_token.decimals,
		authority_seeds,
	)?;

	emit!(Withdraw {
		to: ctx.accounts.signer_token_account.owner.key(),
		token_out: ctx.accounts.aitech_token.key(),
		amount: transfer_amount,
		swap_amount: 0,
		fee_amount,
		withdraw_request_id,
	});

	Ok(())
}
