//! Error definitions

use anchor_lang::prelude::*;

/// ErrorsCode
#[error_code]
pub enum PaymentGpuMarketplaceErrorCode {
	#[msg("Contract was paused")]
	Paused,

	#[msg("Contract was not paused")]
	NotPaused,

	#[msg("Caller is not the Owner")]
	NotOwner,

	#[msg("New maximum withdraw must be greater than minimum withdraw")]
	InvalidMaximumWithdraw,

	#[msg("New minimum withdraw must be less than maximum withdraw")]
	InvalidMinimumWithdraw,

	#[msg("Invalid address")]
	InvalidAddress,

	#[msg("Invalid rate")]
	InvalidRate,

	#[msg("Amount must be greater than 0")]
	ZeroAmount,

	#[msg("Math overflow")]
	MathOverflow,

	#[msg("Invalid bump")]
	InvalidBump,

	#[msg("Amount must be greater than minimum withdraw")]
	AmountLowerThanMinimumWithdraw,

	#[msg("Amount must be less than maximum withdraw")]
	AmountGreaterThanMaximumWithdraw,

	#[msg("Transaction timeout")]
	TransactionTimeout,

	#[msg("Insufficient balance")]
	InsufficientBalance,
}
