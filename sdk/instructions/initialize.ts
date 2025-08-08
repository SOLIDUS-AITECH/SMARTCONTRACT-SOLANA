import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda, getProgramTokenVaultPda } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function initialize(
    program: Program<PaymentGpuMarketplace>,
    signer: PublicKey,
    aitechToken: PublicKey,
    feeWallet: PublicKey,
    stakingWallet: PublicKey,
    args: {
        feeRate: number;
        stakingRate: number;
        burnRate: number;
        minimumWithdraw: BN;
        maximumWithdraw: BN;
        owner: PublicKey;
        withdrawSigner: PublicKey;
    }
) {
    const configPda = getConfigPda(program.programId)[0];
    const authorityPda = getAuthorityPda(program.programId)[0];
    const programTokenVault = getProgramTokenVaultPda(
        program.programId,
        aitechToken
    )[0];

    const ix = await program.methods
        .initialize(
            args.feeRate,
            args.stakingRate,
            args.burnRate,
            args.minimumWithdraw,
            args.maximumWithdraw,
            args.owner,
            args.withdrawSigner
        )
        .accounts({
            signer: signer,
            authority: authorityPda,
            config: configPda,
            aitechToken: aitechToken,
            programTokenVault: programTokenVault,
            feeWallet: feeWallet,
            stakingWallet: stakingWallet,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
    return {
        instruction: ix,
        configPda: configPda,
    };
}
