import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { getConfigPda, getProgramTokenVaultPda, pause, PaymentGpuMarketplace, setMaximumWithdraw, setMinimumWithdraw, unpause, withdraw } from "../sdk";
import { boilerPlateReduction, sleepSeconds } from "./utils/helpers";
import { AITECH_TOKEN, DENOMINATION, FEE_WALLET_KEYPAIR, GPU_OWNER_ACCOUNT_KEYPAIR, OWNER_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR } from "./utils/consts";
import { PublicKey } from "@solana/web3.js";
import { createTransferInstruction, getAccount, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { BN } from "bn.js";


describe("03. Payment: withdraw unit test", async function () {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const PaymentContract = anchor.workspace
      .PaymentGpuMarketplace as anchor.Program<PaymentGpuMarketplace>;

  const { expectIxToSucceed, expectIxToFailWithError } = boilerPlateReduction(
      provider.connection,
      OWNER_KEYPAIR
  );

  let programTokenVaultPda: PublicKey;
  let configPda: PublicKey,
    configData: Awaited<ReturnType<typeof PaymentContract.account.config.fetch>>;

  let withdrawRequestId = 0;

  before(async () => {
    programTokenVaultPda = getProgramTokenVaultPda(PaymentContract.programId, AITECH_TOKEN.publicKey)[0];
    configPda = getConfigPda(PaymentContract.programId)[0];
    configData = await PaymentContract.account.config.fetch(configPda);

    const feeWallet = await getOrCreateAssociatedTokenAccount(provider.connection, FEE_WALLET_KEYPAIR, AITECH_TOKEN.publicKey, FEE_WALLET_KEYPAIR.publicKey);
    expect(feeWallet.address.toString()).eq(configData.feeWallet.toString());
    const ownerAitechTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, OWNER_KEYPAIR, AITECH_TOKEN.publicKey, OWNER_KEYPAIR.publicKey);
    const transferIx = createTransferInstruction(
      ownerAitechTokenAccount.address,
      programTokenVaultPda,
      OWNER_KEYPAIR.publicKey,
      BigInt(configData.maximumWithdraw.muln(10).toString()),
    )
    await expectIxToSucceed(transferIx, [OWNER_KEYPAIR]);
  });

  it("TC-201: withdraw AITECH success: transfer amount calculation", async () => {
    withdrawRequestId++;

    const preProgramTokenVaultBalance = (await getAccount(provider.connection, programTokenVaultPda)).amount;
    const preGpuOwnerAccountBalance = (await getOrCreateAssociatedTokenAccount(provider.connection, GPU_OWNER_ACCOUNT_KEYPAIR, AITECH_TOKEN.publicKey, GPU_OWNER_ACCOUNT_KEYPAIR.publicKey)).amount;
    const preFeeWalletBalance = (await getAccount(provider.connection, configData.feeWallet)).amount;

    const amount = BigInt(configData.minimumWithdraw.toString());
    const feeRate = BigInt(configData.stakingRate);
    const feeAmount = (amount * feeRate) / DENOMINATION;

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      WITHDRAW_SIGNER_KEYPAIR.publicKey,
      {
        amount: new BN(amount.toString()),
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );
    await expectIxToSucceed(withdrawIx, [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]);

    const postProgramTokenVaultBalance = (await getAccount(provider.connection, programTokenVaultPda)).amount;
    const postGpuOwnerAccountBalance = (await getOrCreateAssociatedTokenAccount(provider.connection, GPU_OWNER_ACCOUNT_KEYPAIR, AITECH_TOKEN.publicKey, GPU_OWNER_ACCOUNT_KEYPAIR.publicKey)).amount;
    const postFeeWalletBalance = (await getAccount(provider.connection, configData.feeWallet)).amount;

    expect(preProgramTokenVaultBalance - postProgramTokenVaultBalance).to.be.equal(
      amount
    );
    expect(
      postGpuOwnerAccountBalance - preGpuOwnerAccountBalance
    ).to.be.equal(amount - feeAmount);
    expect(postFeeWalletBalance - preFeeWalletBalance).to.be.equal(
      feeAmount
    );
  });

  // it("TC-202: withdraw USDT success: transfer amount calculation", async () => {
  //   // TODO
  // });

  it("TC-203: withdraw AITECH success: emit event", async () => {
    withdrawRequestId++;
    const amount = BigInt(configData.minimumWithdraw.toString());
    const feeRate = BigInt(configData.feeRate);
    const feeAmount = (amount * feeRate) / DENOMINATION;
    const transferAmount = amount - feeAmount;
    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    let listener = null
    let event = {
      to: PublicKey.default,
      tokenOut: PublicKey.default,
      amount: new BN(0),
      swapAmount: new BN(0),
      feeAmount: new BN(0),
      withdrawRequestId: new BN(0),
    }

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      WITHDRAW_SIGNER_KEYPAIR.publicKey,
      {
        amount: new BN(amount.toString()),
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );

    await new Promise(async (resolve) => {
      listener = PaymentContract.addEventListener("Withdraw", (eventData) => {
        event = eventData;
        resolve(1);
      });
      await expectIxToSucceed(withdrawIx, [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]).catch((err) => {
        console.log(err);
        resolve(0)
      });
    });
    PaymentContract.removeEventListener(listener);

    expect(event.to.toString()).eq(GPU_OWNER_ACCOUNT_KEYPAIR.publicKey.toString());
    expect(event.tokenOut.toString()).eq(AITECH_TOKEN.publicKey.toString());
    expect(event.amount.toString()).eq(transferAmount.toString());
    expect(event.swapAmount.toString()).eq('0');
    expect(event.feeAmount.toString()).eq(feeAmount.toString());
    expect(event.withdrawRequestId.toString()).eq(withdrawRequestId.toString());
  });

  // it("TC-204: withdraw USDT success: emit event", async () => {
  //   // TODO
  // });

  it("TC-205: withdraw fail: withdraw AmountLowerThanMinimum", async () => {
    withdrawRequestId++;
    const amount = configData.minimumWithdraw.subn(1000)

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      WITHDRAW_SIGNER_KEYPAIR.publicKey,
      {
        amount: amount,
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );

    expectIxToFailWithError(withdrawIx, "AmountLowerThanMinimumWithdraw", [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]);
  });

  it("TC-206: withdraw fail: withdraw AmountHigherThanMaximum", async () => {
    withdrawRequestId++;
    const amount = configData.maximumWithdraw.addn(1000);

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      WITHDRAW_SIGNER_KEYPAIR.publicKey,
      {
        amount: amount,
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );
    
    expectIxToFailWithError(withdrawIx, "AmountGreaterThanMaximumWithdraw", [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]);
  });

  // it("TC-207: withdraw USDT fail: withdraw AmountLowerThanMinimum", async () => {
  //   // TODO
  // });

  // it("TC-208: withdraw USDT fail: withdraw AmountHigherThanMaximum", async () => {
  //   // TODO
  // });

  it("TC-209: withdraw fail: replay signature", async () => {
    withdrawRequestId++;
    const amount = configData.minimumWithdraw.addn(100);

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      WITHDRAW_SIGNER_KEYPAIR.publicKey,
      {
        amount: amount,
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );

    expectIxToSucceed(withdrawIx, [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]);
    expectIxToFailWithError(withdrawIx, "AccountAlreadyInitialized", [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]);
  });

  it("TC-210: withdraw fail: wrong signature", async () => {
    withdrawRequestId++;
    const amount = configData.minimumWithdraw.addn(100);

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      OWNER_KEYPAIR.publicKey,
      {
        amount: amount,
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );

    expectIxToFailWithError(withdrawIx, "", [OWNER_KEYPAIR, GPU_OWNER_ACCOUNT_KEYPAIR]);
  });

  it("TC-211: withdraw fail: paused contract", async () => {
    withdrawRequestId++;

    const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);

    const amount = configData.minimumWithdraw.addn(100);

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      OWNER_KEYPAIR.publicKey,
      {
        amount: amount,
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );

    expectIxToFailWithError([pauseIx, withdrawIx], "Paused", [OWNER_KEYPAIR, GPU_OWNER_ACCOUNT_KEYPAIR]);
  });

  it("TC-212: min max withdraw: set new min max", async () => {
    const newMinimumWithdraw = new BN(1);
    const newMaximumWithdraw = new BN(1000000);
    let listeners = []
    let setMinimumWithdrawEvent = {
      newMinimumWithdraw: new BN(0),
    }
    let setMaximumWithdrawEvent = {
      newMaximumWithdraw: new BN(0),
    }
    
    const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
    const { instruction: setMinimumWithdrawIx } = await setMinimumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { minimumWithdraw: newMinimumWithdraw });
    const { instruction: setMaximumWithdrawIx } = await setMaximumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { maximumWithdraw: newMaximumWithdraw });
    const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);


    listeners = await Promise.all([
      PaymentContract.addEventListener("MinimumWithdrawChange", (eventData) => {
        setMinimumWithdrawEvent = eventData;
      }),
      PaymentContract.addEventListener("MaximumWithdrawChange", (eventData) => {
        setMaximumWithdrawEvent = eventData;
      }),
    ]) 
    await expectIxToSucceed([pauseIx, setMinimumWithdrawIx, setMaximumWithdrawIx, unpauseIx], [OWNER_KEYPAIR]);


    await sleepSeconds(1);
    await Promise.all(
      listeners.map((l) => PaymentContract.removeEventListener(l))
    )

    expect(setMinimumWithdrawEvent.newMinimumWithdraw.toString()).to.be.equal(new BN(1).toString());
    expect(setMaximumWithdrawEvent.newMaximumWithdraw.toString()).to.be.equal(new BN(1000000).toString());

    configData = await PaymentContract.account.config.fetch(configPda);
    expect(configData.minimumWithdraw.toString()).to.be.equal(newMinimumWithdraw.toString());
    expect(configData.maximumWithdraw.toString()).to.be.equal(newMaximumWithdraw.toString());
  });

  it("TC-213: withdraw fail: withdraw over contract balance", async () => {
    withdrawRequestId++;
    const preProgramTokenVaultBalance = (await getAccount(provider.connection, programTokenVaultPda)).amount;
    const amount = preProgramTokenVaultBalance + 100n;

    const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

    const { instruction: withdrawIx } = await withdraw(
      PaymentContract,
      GPU_OWNER_ACCOUNT_KEYPAIR.publicKey,
      WITHDRAW_SIGNER_KEYPAIR.publicKey,
      {
        amount: new BN(amount.toString()),
        amountInMaximum: new BN(0),
        withdrawRequestId: new BN(withdrawRequestId),
        withdrawRequestTimestamp: new BN(withdrawRequestTimestamp),
      }
    );

    expectIxToFailWithError(withdrawIx, "InsufficientBalance", [GPU_OWNER_ACCOUNT_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR]);
  });

  // it("TC-203: withdraw token ount fail param amountMaximum = 0", async () => {
  //     // TODO
  // });
});
