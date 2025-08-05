//! Set Withdraw Signer Instruction

use crate::{
	errors::PaymentGpuMarketplaceErrorCode, events::WithdrawSignerChange, impl_only_owner,
	impl_when_paused, states::config::Config, utils::CONFIG_SEED,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetWithdrawSigner<'info> {
	#[account(mut)]
	pub signer: Signer<'info>,

	#[account(
    mut,
    seeds = [CONFIG_SEED],
    bump,
  )]
	pub config: Account<'info, Config>,
}

impl_only_owner!(SetWithdrawSigner);
impl_when_paused!(SetWithdrawSigner);

pub fn handler(ctx: Context<SetWithdrawSigner>, new_withdraw_signer: Pubkey) -> Result<()> {
	require!(
		new_withdraw_signer.eq(&Pubkey::default()) == false,
		PaymentGpuMarketplaceErrorCode::InvalidAddress
	);

	ctx.accounts.config.withdraw_signer = new_withdraw_signer;

	emit!(WithdrawSignerChange { new_withdraw_signer });

	Ok(())
}
