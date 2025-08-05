//! Helper functions for the program

use anchor_lang::prelude::*;
use anchor_spl::{
	token::TokenAccount,
	token_2022::{
		self,
		spl_token_2022::{
			self,
			extension::{ExtensionType, StateWithExtensions},
		},
	},
	token_interface::{
		initialize_account3, spl_token_2022::extension::BaseStateWithExtensions, InitializeAccount3,
	},
};

pub fn create_token_account<'a>(
	authority: &AccountInfo<'a>,
	payer: &AccountInfo<'a>,
	token_account: &AccountInfo<'a>,
	mint_account: &AccountInfo<'a>,
	system_program: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	authority_seeds: &[&[&[u8]]],
) -> Result<()> {
	let space = {
		let mint_info = mint_account.to_account_info();
		if *mint_info.owner == token_2022::Token2022::id() {
			let mint_data = mint_info.try_borrow_data()?;
			let mint_state =
				StateWithExtensions::<spl_token_2022::state::Mint>::unpack(&mint_data)?;
			let mint_extensions = mint_state.get_extension_types()?;
			let required_extensions =
				ExtensionType::get_required_init_account_extensions(&mint_extensions);
			ExtensionType::try_calculate_account_len::<spl_token_2022::state::Account>(
				&required_extensions,
			)?
		} else {
			TokenAccount::LEN
		}
	};
	let lamports = Rent::get()?.minimum_balance(space);
	let cpi_accounts = anchor_lang::system_program::CreateAccount {
		from: payer.to_account_info(),
		to: token_account.to_account_info(),
	};
	let cpi_context = CpiContext::new(system_program.to_account_info(), cpi_accounts);
	anchor_lang::system_program::create_account(
		cpi_context.with_signer(authority_seeds),
		lamports,
		space as u64,
		token_program.key,
	)?;
	initialize_account3(CpiContext::new(
		token_program.to_account_info(),
		InitializeAccount3 {
			account: token_account.to_account_info(),
			mint: mint_account.to_account_info(),
			authority: authority.to_account_info(),
		},
	))
}

pub fn transfer_from_pool_vault_to_user<'a>(
	authority: AccountInfo<'a>,
	from_vault: AccountInfo<'a>,
	to: AccountInfo<'a>,
	mint: AccountInfo<'a>,
	token_program: AccountInfo<'a>,
	amount: u64,
	mint_decimals: u8,
	authority_seeds: &[&[&[u8]]],
) -> Result<()> {
	if amount == 0 {
		return Ok(());
	}
	token_2022::transfer_checked(
		CpiContext::new_with_signer(
			token_program.to_account_info(),
			token_2022::TransferChecked { from: from_vault, to, authority, mint },
			authority_seeds,
		),
		amount,
		mint_decimals,
	)
}

pub fn transfer_from_user_to_pool_vault<'a>(
	authority: AccountInfo<'a>,
	from: AccountInfo<'a>,
	to_vault: AccountInfo<'a>,
	mint: AccountInfo<'a>,
	token_program: AccountInfo<'a>,
	amount: u64,
	mint_decimals: u8,
) -> Result<()> {
	if amount == 0 {
		return Ok(());
	}
	token_2022::transfer_checked(
		CpiContext::new(
			token_program.to_account_info(),
			token_2022::TransferChecked { from, to: to_vault, authority, mint },
		),
		amount,
		mint_decimals,
	)
}

pub fn burn_from_user<'a>(
	authority: AccountInfo<'a>,
	from: AccountInfo<'a>,
	mint: AccountInfo<'a>,
	token_program: AccountInfo<'a>,
	amount: u64,
) -> Result<()> {
	token_2022::burn(
		CpiContext::new(
			token_program.to_account_info(),
			token_2022::Burn { from, authority, mint },
		),
		amount,
	)
}

/// Abstracts the `swap_based_output` CPI of the Raydium Swap program
pub fn raydium_cp_swap_base_output<'a>(
	cp_swap_program: &AccountInfo<'a>,
	payer: &AccountInfo<'a>,
	authority: &AccountInfo<'a>,
	amm_config: &AccountInfo<'a>,
	pool_state: &AccountInfo<'a>,
	input_token_account: &AccountInfo<'a>,
	output_token_account: &AccountInfo<'a>,
	input_vault: &AccountInfo<'a>,
	output_vault: &AccountInfo<'a>,
	input_token_program: &AccountInfo<'a>,
	output_token_program: &AccountInfo<'a>,
	input_token_mint: &AccountInfo<'a>,
	output_token_mint: &AccountInfo<'a>,
	observation_state: &AccountInfo<'a>,
	max_amount_in: u64,
	amount_out: u64,
) -> Result<()> {
	let cpi_accounts = raydium_cp_swap::cpi::accounts::Swap {
		payer: payer.to_account_info(),
		authority: authority.to_account_info(),
		amm_config: amm_config.to_account_info(),
		pool_state: pool_state.to_account_info(),
		input_token_account: input_token_account.to_account_info(),
		output_token_account: output_token_account.to_account_info(),
		input_vault: input_vault.to_account_info(),
		output_vault: output_vault.to_account_info(),
		input_token_program: input_token_program.to_account_info(),
		output_token_program: output_token_program.to_account_info(),
		input_token_mint: input_token_mint.to_account_info(),
		output_token_mint: output_token_mint.to_account_info(),
		observation_state: observation_state.to_account_info(),
	};
	let cpi_context = CpiContext::new(cp_swap_program.to_account_info(), cpi_accounts);
	raydium_cp_swap::cpi::swap_base_output(cpi_context, max_amount_in, amount_out)
}
