import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda, getProgramTokenVaultPda, getWithdrawRequestPda } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

interface WithdrawAitechToken {
  amount: BN,
  amountInMaximum: BN,
  withdrawRequestId: BN,
  withdrawRequestTimestamp: BN,
}

interface WithdrawOtherToken extends WithdrawAitechToken {
  // Raydium parameters
  tokenOut: PublicKey,
  tokenOutProgram?: PublicKey,
  poolVaultAndLpMintAuthority: PublicKey,
  poolState: PublicKey,
  ammConfig: PublicKey,
  observationState: PublicKey,
  aitechTokenVault: PublicKey,
  tokenOutVault: PublicKey,
  cpSwapProgram: PublicKey,
}

export async function withdraw(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  withdrawSigner: PublicKey,
  args: WithdrawAitechToken | WithdrawOtherToken
) {
  const configPda = getConfigPda(program.programId)[0];
  const configData = await program.account.config.fetch(configPda);

  const authorityPda = getAuthorityPda(program.programId)[0];
  const programTokenVault = getProgramTokenVaultPda(program.programId, configData.aitechToken)[0];
  const withdrawRequestPda = getWithdrawRequestPda(program.programId, signer, args.withdrawRequestId)[0];

  const signerTokenAccount = getAssociatedTokenAddressSync(
    'tokenOut' in args ? args.tokenOut : configData.aitechToken, 
    signer
  );

  const accounts: any = {
    signer: signer,
    withdrawSigner: withdrawSigner,
    signerTokenAccount: signerTokenAccount,
    authority: authorityPda,
    withdrawRequest: withdrawRequestPda,
    programTokenVault: programTokenVault,
    config: configPda,
    aitechToken: configData.aitechToken,
    aitechTokenProgram: TOKEN_PROGRAM_ID,
    feeWallet: configData.feeWallet,
    systemProgram: SystemProgram.programId,
  };

  // Add optional swap accounts if provided
  if ('tokenOut' in args) {
    accounts.tokenOut = args.tokenOut;
    accounts.tokenOutProgram = args.tokenOutProgram || TOKEN_PROGRAM_ID;
    accounts.poolVaultAndLpMintAuthority = args.poolVaultAndLpMintAuthority;
    accounts.poolState = args.poolState;
    accounts.ammConfig = args.ammConfig;
    accounts.observationState = args.observationState;
    accounts.aitechTokenVault = args.aitechTokenVault;
    accounts.tokenOutVault = args.tokenOutVault;
    accounts.cpSwapProgram = args.cpSwapProgram;
  } else {
    accounts.tokenOut = null;
    accounts.tokenOutProgram = null;
    accounts.poolVaultAndLpMintAuthority = null;
    accounts.poolState = null;
    accounts.ammConfig = null;
    accounts.observationState = null;
    accounts.aitechTokenVault = null;
    accounts.tokenOutVault = null;
    accounts.cpSwapProgram = null;
  }

  const ix = await program.methods
    .withdraw(
      args.amount,
      args.amountInMaximum,
      args.withdrawRequestId,
      args.withdrawRequestTimestamp,
    )
    .accounts(accounts)
    .instruction();
  return {
    instruction: ix,
  };
} 