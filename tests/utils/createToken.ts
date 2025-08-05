import { AITECH_TOKEN, GPU_OWNER_ACCOUNT_KEYPAIR, GPU_RENTER_ACCOUNT_KEYPAIR, OWNER_KEYPAIR, USDT_TOKEN } from "./consts";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { Connection } from "@solana/web3.js";

export async function createToken(connection: Connection) {
  const mintAmount = 1000000_000000000;

  await createMint(
    connection,
    OWNER_KEYPAIR,
    OWNER_KEYPAIR.publicKey,
    null,
    9,
    AITECH_TOKEN,
  );
  console.info("Created AITECH_TOKEN")

  await createMint(
    connection,
    OWNER_KEYPAIR,
    OWNER_KEYPAIR.publicKey,
    null,
    9,
    USDT_TOKEN,
  )

  console.info("Created USDT_TOKEN")

  const ownerAitechAta = await getOrCreateAssociatedTokenAccount(connection, OWNER_KEYPAIR, AITECH_TOKEN.publicKey, OWNER_KEYPAIR.publicKey);
  const gpuOwnerAitechAta = await getOrCreateAssociatedTokenAccount(connection, OWNER_KEYPAIR, AITECH_TOKEN.publicKey, GPU_OWNER_ACCOUNT_KEYPAIR.publicKey);
  const gpuRenterAitechAta = await getOrCreateAssociatedTokenAccount(connection, OWNER_KEYPAIR, AITECH_TOKEN.publicKey, GPU_RENTER_ACCOUNT_KEYPAIR.publicKey);
  
  const ownerUsdtAta = await getOrCreateAssociatedTokenAccount(connection, OWNER_KEYPAIR, USDT_TOKEN.publicKey, OWNER_KEYPAIR.publicKey);
  const gpuOwnerUsdtAta = await getOrCreateAssociatedTokenAccount(connection, OWNER_KEYPAIR, USDT_TOKEN.publicKey, GPU_OWNER_ACCOUNT_KEYPAIR.publicKey);
  const gpuRenterUsdtAta = await getOrCreateAssociatedTokenAccount(connection, OWNER_KEYPAIR, USDT_TOKEN.publicKey, GPU_RENTER_ACCOUNT_KEYPAIR.publicKey);

  await mintTo(
    connection,
    OWNER_KEYPAIR,
    AITECH_TOKEN.publicKey,
    ownerAitechAta.address,
    OWNER_KEYPAIR.publicKey,
    mintAmount,
  );
  await mintTo(
    connection,
    OWNER_KEYPAIR,
    AITECH_TOKEN.publicKey,
    gpuOwnerAitechAta.address,
    OWNER_KEYPAIR.publicKey,
    mintAmount,
  )
  await mintTo(
    connection,
    OWNER_KEYPAIR,
    AITECH_TOKEN.publicKey,
    gpuRenterAitechAta.address,
    OWNER_KEYPAIR.publicKey,
    mintAmount,
  )
  console.info("Minted AITECH_TOKEN")

  await mintTo(
    connection,
    OWNER_KEYPAIR,
    USDT_TOKEN.publicKey,
    ownerUsdtAta.address,
    OWNER_KEYPAIR.publicKey,
    mintAmount,
  )
  await mintTo(
    connection,
    OWNER_KEYPAIR,
    USDT_TOKEN.publicKey,
    gpuOwnerUsdtAta.address,
    OWNER_KEYPAIR.publicKey,
    mintAmount,
  )
  await mintTo(
    connection,
    OWNER_KEYPAIR,
    USDT_TOKEN.publicKey,
    gpuRenterUsdtAta.address,
    OWNER_KEYPAIR.publicKey,
    mintAmount,
  )
  console.info("Minted USDT_TOKEN")

}