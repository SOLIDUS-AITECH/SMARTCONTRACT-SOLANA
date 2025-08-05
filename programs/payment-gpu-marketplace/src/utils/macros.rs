//! Macros for implementing common checks

/// Implement the `only_owner` method for the given struct.
/// The `only_owner` method checks if the current `signer` is the admin account.
#[macro_export]
macro_rules! impl_only_owner {
	($struct_name:ident) => {
		impl $struct_name<'_> {
			pub fn only_owner(ctx: &Context<$struct_name>) -> Result<()> {
				require!(
					$crate::utils::roles::only_owner(
						&ctx.accounts.signer.key(),
						&ctx.accounts.config.owner
					),
					$crate::errors::PaymentGpuMarketplaceErrorCode::NotOwner
				);
				Ok(())
			}
		}
	};
}

/// Implement the `when_not_paused` method for the given struct.
/// The `when_not_paused` method checks if the current `config.paused` is false.
#[macro_export]
macro_rules! impl_when_not_paused {
	($struct_name:ident) => {
		impl $struct_name<'_> {
			pub fn when_not_paused(ctx: &Context<$struct_name>) -> Result<()> {
				require!(
					ctx.accounts.config.paused == false,
					$crate::errors::PaymentGpuMarketplaceErrorCode::Paused
				);
				Ok(())
			}
		}
	};
}

/// Implement the `when_paused` method for the given struct.
/// The `when_paused` method checks if the current `config.paused` is true.
#[macro_export]
macro_rules! impl_when_paused {
	($struct_name:ident) => {
		impl $struct_name<'_> {
			pub fn when_paused(ctx: &Context<$struct_name>) -> Result<()> {
				require!(
					ctx.accounts.config.paused == true,
					$crate::errors::PaymentGpuMarketplaceErrorCode::NotPaused
				);
				Ok(())
			}
		}
	};
}
