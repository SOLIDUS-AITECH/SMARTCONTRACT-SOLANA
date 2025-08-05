//! Roles module

use anchor_lang::prelude::Pubkey;

/// Verifies if the signer is the admin
pub fn only_owner(signer_key: &Pubkey, owner_key: &Pubkey) -> bool {
	// Check if the signer is the admin
	signer_key.eq(owner_key)
}
