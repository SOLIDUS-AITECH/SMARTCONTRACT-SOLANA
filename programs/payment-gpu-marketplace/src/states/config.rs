use anchor_lang::prelude::*;

use crate::{
	errors::PaymentGpuMarketplaceErrorCode,
	events::{
		BurnRateChange, FeeRateChange, FeeWalletChange, MaximumWithdrawChange,
		MinimumWithdrawChange, StakingRateChange, StakingWalletChange,
	},
	utils::MAX_RATE,
};

#[derive(InitSpace)]
#[account]
pub struct Config {
	pub authority_bump: u8,
	pub program_token_vault_bump: u8,
	pub paused: bool,

	pub fee_rate: u16,
	pub staking_rate: u16,
	pub burn_rate: u16,
	pub minimum_withdraw: u64,
	pub maximum_withdraw: u64,

	pub owner: Pubkey,
	pub withdraw_signer: Pubkey,
	pub aitech_token: Pubkey,
	pub fee_wallet: Pubkey,
	pub staking_wallet: Pubkey,
}

impl Config {
	pub fn set_maximum_withdraw(&mut self, new_maximum_withdraw: u64) -> Result<()> {
		require!(
			new_maximum_withdraw >= self.minimum_withdraw,
			PaymentGpuMarketplaceErrorCode::InvalidMaximumWithdraw
		);

		self.maximum_withdraw = new_maximum_withdraw;

		emit!(MaximumWithdrawChange { new_maximum_withdraw });

		Ok(())
	}

	pub fn set_minimum_withdraw(&mut self, new_minimum_withdraw: u64) -> Result<()> {
		require!(
			new_minimum_withdraw <= self.maximum_withdraw,
			PaymentGpuMarketplaceErrorCode::InvalidMinimumWithdraw
		);

		self.minimum_withdraw = new_minimum_withdraw;

		emit!(MinimumWithdrawChange { new_minimum_withdraw });

		Ok(())
	}

	pub fn set_fee_rate(&mut self, new_fee_rate: u16) -> Result<()> {
		require!(new_fee_rate < MAX_RATE, PaymentGpuMarketplaceErrorCode::InvalidRate);

		self.fee_rate = new_fee_rate;

		emit!(FeeRateChange { new_fee_rate });

		Ok(())
	}

	pub fn set_staking_rate(&mut self, new_staking_rate: u16) -> Result<()> {
		require!(new_staking_rate < MAX_RATE, PaymentGpuMarketplaceErrorCode::InvalidRate);

		self.staking_rate = new_staking_rate;

		emit!(StakingRateChange { new_staking_rate });

		Ok(())
	}

	pub fn set_burn_rate(&mut self, new_burn_rate: u16) -> Result<()> {
		require!(new_burn_rate < MAX_RATE, PaymentGpuMarketplaceErrorCode::InvalidRate);

		self.burn_rate = new_burn_rate;

		emit!(BurnRateChange { new_burn_rate });

		Ok(())
	}

	pub fn set_fee_wallet(&mut self, new_fee_wallet: Pubkey) -> Result<()> {
		self.fee_wallet = new_fee_wallet;

		emit!(FeeWalletChange { new_fee_wallet });

		Ok(())
	}

	pub fn set_staking_wallet(&mut self, new_staking_wallet: Pubkey) -> Result<()> {
		self.staking_wallet = new_staking_wallet;

		emit!(StakingWalletChange { new_staking_wallet });

		Ok(())
	}
}
