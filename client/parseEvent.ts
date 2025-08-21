import { BorshCoder, EventParser } from "@coral-xyz/anchor";
import {
    scaffoldProgram,
} from "../sdk";

async function main() {
    const { PaymentGpuMarketplaceProgram } =
        scaffoldProgram("owner.json");

    const tx = await PaymentGpuMarketplaceProgram.provider.connection.getTransaction("5co2wbb8zp8uW38rhxaTxZ3VeixdJoPxxnDQYC1bGCk7gc7A33QVTLR7krpQG5rrg7YmFjw2vFzdxNvS9KLGperM");
    const eventParser = new EventParser(
        PaymentGpuMarketplaceProgram.programId,
        new BorshCoder(PaymentGpuMarketplaceProgram.idl)
    );
    const events = eventParser.parseLogs(tx.meta.logMessages);
    for (let event of events) {
        console.log("\n ================== \n");
        console.log(event);
    }
    return events;
}

main();
