import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { u64ToBytes } from "../helpers";

export const AUTH_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("authority")
);
export const CONFIG_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("config")
);
export const PROGRAM_TOKEN_VAULT_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("program_token_vault")
);
export const WITHDRAW_REQUEST_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("withdraw_request")
);

export function getAuthorityPda(programId: PublicKey): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [AUTH_SEED],
        programId
    );
    return [address, bump];
}

export function getConfigPda(programId: PublicKey): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [CONFIG_SEED],
        programId
    );
    return [address, bump];
}

export function getProgramTokenVaultPda(programId: PublicKey, aitechToken: PublicKey): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [PROGRAM_TOKEN_VAULT_SEED, aitechToken.toBuffer()],
        programId
    );
    return [address, bump];
}

export function getWithdrawRequestPda(programId: PublicKey, signer: PublicKey, withdrawRequestId: anchor.BN): [PublicKey, number] {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [WITHDRAW_REQUEST_SEED, signer.toBuffer(), u64ToBytes(BigInt(withdrawRequestId.toString()))],
        programId
    );
    return [address, bump];
}