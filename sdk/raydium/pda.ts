import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { u16ToBytes } from "../helpers";

export const AMM_CONFIG_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("amm_config")
);
export const POOL_SEED = Buffer.from(anchor.utils.bytes.utf8.encode("pool"));
export const POOL_VAULT_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("pool_vault")
);
export const POOL_AUTH_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("vault_and_lp_mint_auth_seed")
);
export const POOL_LPMINT_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("pool_lp_mint")
);
export const TICK_ARRAY_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("tick_array")
);

export const OPERATION_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("operation")
);

export const ORACLE_SEED = Buffer.from(
    anchor.utils.bytes.utf8.encode("observation")
);

export async function getAmmConfigAddress(
    index: number,
    programId: PublicKey
): Promise<[PublicKey, number]> {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [AMM_CONFIG_SEED, u16ToBytes(index)],
        programId
    );
    return [address, bump];
}

export async function getAuthAddress(
    programId: PublicKey
): Promise<[PublicKey, number]> {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [POOL_AUTH_SEED],
        programId
    );
    return [address, bump];
}

export async function getPoolAddress(
    ammConfig: PublicKey,
    tokenMint0: PublicKey,
    tokenMint1: PublicKey,
    programId: PublicKey
): Promise<[PublicKey, number]> {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [
            POOL_SEED,
            ammConfig.toBuffer(),
            tokenMint0.toBuffer(),
            tokenMint1.toBuffer(),
        ],
        programId
    );
    return [address, bump];
}

export async function getPoolVaultAddress(
    pool: PublicKey,
    vaultTokenMint: PublicKey,
    programId: PublicKey
): Promise<[PublicKey, number]> {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [POOL_VAULT_SEED, pool.toBuffer(), vaultTokenMint.toBuffer()],
        programId
    );
    return [address, bump];
}

export async function getPoolLpMintAddress(
    pool: PublicKey,
    programId: PublicKey
): Promise<[PublicKey, number]> {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [POOL_LPMINT_SEED, pool.toBuffer()],
        programId
    );
    return [address, bump];
}

export async function getOrcleAccountAddress(
    pool: PublicKey,
    programId: PublicKey
): Promise<[PublicKey, number]> {
    const [address, bump] = PublicKey.findProgramAddressSync(
        [ORACLE_SEED, pool.toBuffer()],
        programId
    );
    return [address, bump];
}
