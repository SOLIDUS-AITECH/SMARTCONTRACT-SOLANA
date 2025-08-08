import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function updateConfig(
    program: Program<PaymentGpuMarketplace>,
    signer: PublicKey,
    args: {
        feeRate: number;
        stakingRate: number;
        burnRate: number;
        minimumWithdraw: BN;
        maximumWithdraw: BN;
        feeWallet: PublicKey;
        stakingWallet: PublicKey;
    }
) {
    const configPda = getConfigPda(program.programId)[0];
    const authorityPda = getAuthorityPda(program.programId)[0];

    const ix = await program.methods
        .updateConfig(
            args.feeRate,
            args.stakingRate,
            args.burnRate,
            args.minimumWithdraw,
            args.maximumWithdraw
        )
        .accounts({
            signer: signer,
            authority: authorityPda,
            config: configPda,
            feeWallet: args.feeWallet,
            stakingWallet: args.stakingWallet,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
    return {
        instruction: ix,
    };
}
