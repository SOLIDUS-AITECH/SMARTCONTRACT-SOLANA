//! Withdraw Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	events::Withdraw,
	impl_when_not_paused,
	states::config::Config,
	utils::{
		raydium_cp_swap_base_output, transfer_from_pool_vault_to_user, AUTH_SEED, CONFIG_SEED,
		PERCENT_DENOMINATOR, PROGRAM_TOKEN_VAULT_SEED, WITHDRAW_REQUEST_SEED,
	},
	withdrawal::Withdrawal,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use raydium_cp_swap::{
	program::RaydiumCpSwap,
	states::{AmmConfig, ObservationState, PoolState},
};

#[derive(Accounts)]
#[instruction(_amount: u64, _amount_in_maximum: u64, withdraw_request_id: u64)]
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

	#[account(mut)]
	pub token_out: Option<Account<'info, Mint>>,
	pub token_out_program: Option<Program<'info, Token>>,

	/// CHECK: pool vault and lp mint authority
	#[account(
			seeds = [
				raydium_cp_swap::AUTH_SEED.as_bytes(),
			],
			// seeds::program = cp_swap_program,
			bump,
	)]
	pub pool_vault_and_lp_mint_authority: Option<UncheckedAccount<'info>>,

	#[account(mut)]
	pub pool_state: Option<AccountLoader<'info, PoolState>>,

	// #[account(address = pool_state.load()?.amm_config)]
	pub amm_config: Option<Box<Account<'info, AmmConfig>>>,

	#[account(
		mut,
		// address = pool_state.load()?.observation_key
	)]
	pub observation_state: Option<AccountLoader<'info, ObservationState>>,

	/// The vault token account for input meme token
	#[account(
			mut,
			// constraint = aitech_token_vault.key() == pool_state.load()?.token_0_vault || aitech_token_vault.key() == pool_state.load()?.token_1_vault
	)]
	pub aitech_token_vault: Option<Box<Account<'info, TokenAccount>>>,

	/// The vault token account for wsol
	#[account(
			mut,
			// constraint = token_out_vault.key() == pool_state.load()?.token_0_vault || token_out_vault.key() == pool_state.load()?.token_1_vault
	)]
	pub token_out_vault: Option<Box<Account<'info, TokenAccount>>>,

	pub cp_swap_program: Option<Program<'info, RaydiumCpSwap>>,
}

impl_when_not_paused!(WithdrawCtx);

pub fn handler(
	ctx: Context<WithdrawCtx>,
	amount: u64,
	amount_in_maximum: u64,
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

	if ctx.accounts.token_out.is_none() {
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
		})
	} else {
		// validate all optional account
		require!(ctx.accounts.token_out.is_some(), PaymentGpuMarketplaceErrorCode::InvalidAddress);
		require!(
			ctx.accounts.token_out_program.is_some(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			ctx.accounts.pool_vault_and_lp_mint_authority.is_some(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(ctx.accounts.pool_state.is_some(), PaymentGpuMarketplaceErrorCode::InvalidAddress);
		require!(ctx.accounts.amm_config.is_some(), PaymentGpuMarketplaceErrorCode::InvalidAddress);
		require!(
			ctx.accounts.observation_state.is_some(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			ctx.accounts.cp_swap_program.is_some(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			ctx.accounts.aitech_token_vault.is_some(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			ctx.accounts.token_out_vault.is_some(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);

		let token_out = ctx.accounts.token_out.as_ref().unwrap();
		let token_out_program = ctx.accounts.token_out_program.as_ref().unwrap();
		let pool_vault_and_lp_mint_authority =
			ctx.accounts.pool_vault_and_lp_mint_authority.as_ref().unwrap();
		let pool_state_loader = ctx.accounts.pool_state.as_ref().unwrap();
		let pool_state = pool_state_loader.load()?;
		let amm_config = ctx.accounts.amm_config.as_ref().unwrap();
		let observation_state = ctx.accounts.observation_state.as_ref().unwrap();
		let cp_swap_program = ctx.accounts.cp_swap_program.as_ref().unwrap();
		let aitech_token_vault = ctx.accounts.aitech_token_vault.as_ref().unwrap();
		let token_out_vault = ctx.accounts.token_out_vault.as_ref().unwrap();

		require!(
			ctx.accounts.config.swap_program.eq(&cp_swap_program.key()),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			ctx.accounts.config.pool_state.eq(&pool_state_loader.key()),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			ctx.accounts.signer_token_account.mint == token_out.key(),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			amm_config.key().eq(&pool_state.amm_config),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			observation_state.key().eq(&pool_state.observation_key),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			aitech_token_vault.key().eq(&pool_state.token_0_vault) ||
				aitech_token_vault.key().eq(&pool_state.token_1_vault),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			aitech_token_vault.mint.eq(&config.aitech_token.key()),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			token_out_vault.key().eq(&pool_state.token_0_vault) ||
				token_out_vault.key().eq(&pool_state.token_1_vault),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);
		require!(
			token_out_vault.mint.eq(&token_out.key()),
			PaymentGpuMarketplaceErrorCode::InvalidAddress
		);

		require!(amount_in_maximum > 0, PaymentGpuMarketplaceErrorCode::ZeroAmount);
		let nominator = denominator - fee_rate;
		let transfer_amount = amount
			.checked_mul(nominator)
			.and_then(|v| v.checked_div(denominator))
			.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?;

		let pre_balance = ctx.accounts.program_token_vault.amount;

		raydium_cp_swap_base_output(
			&cp_swap_program.to_account_info(),
			&ctx.accounts.signer,
			&pool_vault_and_lp_mint_authority.to_account_info(),
			&amm_config.to_account_info(),
			&pool_state_loader.to_account_info(),
			&ctx.accounts.program_token_vault.to_account_info(),
			&ctx.accounts.signer_token_account.to_account_info(),
			&aitech_token_vault.to_account_info(),
			&token_out_vault.to_account_info(),
			&ctx.accounts.aitech_token_program.to_account_info(),
			&token_out_program.to_account_info(),
			&ctx.accounts.aitech_token.to_account_info(),
			&token_out.to_account_info(),
			&observation_state.to_account_info(),
			amount_in_maximum,
			transfer_amount,
		)?;

		let post_balance = ctx.accounts.program_token_vault.amount;

		msg!("pre_balance: {}, post_balance: {}", pre_balance, post_balance);

		let amount_in = post_balance - pre_balance;
		let amount_in_without_fee = amount_in
			.checked_mul(denominator)
			.and_then(|v| v.checked_div(nominator))
			.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?;

		require!(
			amount_in_without_fee >= config.minimum_withdraw,
			PaymentGpuMarketplaceErrorCode::AmountLowerThanMinimumWithdraw
		);
		require!(
			amount_in_without_fee <= config.maximum_withdraw,
			PaymentGpuMarketplaceErrorCode::AmountGreaterThanMaximumWithdraw
		);

		let fee_amount = amount_in
			.checked_mul(fee_rate)
			.and_then(|v| v.checked_div(nominator))
			.ok_or(PaymentGpuMarketplaceErrorCode::MathOverflow)?;

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

		emit!(Withdraw {
			to: ctx.accounts.signer_token_account.key(),
			token_out: token_out.key(),
			amount: transfer_amount,
			swap_amount: amount_in,
			fee_amount,
			withdraw_request_id,
		})
	}

	Ok(())
}
