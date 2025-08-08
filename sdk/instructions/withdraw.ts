import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda, getProgramTokenVaultPda, getWithdrawRequestPda } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

export async function withdraw(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  withdrawSigner: PublicKey,
  args: {
    amount: BN,
    withdrawRequestId: BN,
    withdrawRequestTimestamp: BN,
  }
) {
  const configPda = getConfigPda(program.programId)[0];
  const configData = await program.account.config.fetch(configPda);

  const authorityPda = getAuthorityPda(program.programId)[0];
  const programTokenVault = getProgramTokenVaultPda(program.programId, configData.aitechToken)[0];
  const withdrawRequestPda = getWithdrawRequestPda(program.programId, signer, args.withdrawRequestId)[0];

  const signerTokenAccount = getAssociatedTokenAddressSync(
    configData.aitechToken, 
    signer
  );

  const ix = await program.methods
    .withdraw(
      args.amount,
      args.withdrawRequestId,
      args.withdrawRequestTimestamp,
    )
    .accounts({
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
    })
    .instruction();
  return {
    instruction: ix,
  };
} 