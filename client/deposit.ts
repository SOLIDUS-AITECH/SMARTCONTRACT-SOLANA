import { Wallet } from "@coral-xyz/anchor";
import { deposit, loadKeypair, PaymentGpuMarketplaceProgram, sendTransaction } from "../sdk";
import path from "node:path";
  import { BN } from "bn.js";

async function main() {
  const deployerKp = loadKeypair(path.join(__dirname, "..", "keys", "deployer.json"));
  const deployerWallet = new Wallet(deployerKp);

  const extraData = Buffer.from([12, 22]);
  const amount = new BN(100000);

  const { instruction: initializeIx } = await deposit(
    PaymentGpuMarketplaceProgram,
    deployerKp.publicKey,
    {
      amountAitech: amount,
      extraData: extraData
    },
  );

  await sendTransaction(initializeIx, { loggerIdentity: "initialize" }, deployerWallet);
}

main()