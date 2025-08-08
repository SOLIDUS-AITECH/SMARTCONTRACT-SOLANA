//! Program instruction processor

pub mod deposit;
pub mod emergency_withdraw;
pub mod initializer;
pub mod pause;
pub mod set_burn_rate;
pub mod set_fee_rate;
pub mod set_fee_wallet;
pub mod set_maximum_withdraw;
pub mod set_minimum_withdraw;
pub mod set_staking_rate;
pub mod set_staking_wallet;
pub mod set_token;
pub mod set_withdraw_signer;
pub mod unpause;
pub mod update_config;
pub mod withdraw;

pub use deposit::*;
pub use emergency_withdraw::*;
pub use initializer::*;
pub use pause::*;
pub use set_burn_rate::*;
pub use set_fee_rate::*;
pub use set_fee_wallet::*;
pub use set_maximum_withdraw::*;
pub use set_minimum_withdraw::*;
pub use set_staking_rate::*;
pub use set_staking_wallet::*;
pub use set_token::*;
pub use set_withdraw_signer::*;
pub use unpause::*;
pub use update_config::*;
pub use withdraw::*;
