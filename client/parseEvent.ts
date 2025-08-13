import { BorshCoder, EventParser } from "@coral-xyz/anchor";
import {
    scaffoldProgram,
} from "../sdk";

async function main() {
    const { PaymentGpuMarketplaceProgram } =
        scaffoldProgram("owner.json");

    const tx = await PaymentGpuMarketplaceProgram.provider.connection.getTransaction("5NDZSE6HbK6Q8ukV1p6YSZU9qLME2qH1pqW4gkyzEA8ooGv2u9SFi3gparLTbfK6fWN1WuTC58fYh17uMyMgxgzK");
    const eventParser = new EventParser(
        PaymentGpuMarketplaceProgram.programId,
        new BorshCoder(PaymentGpuMarketplaceProgram.idl)
    );
    const events = eventParser.parseLogs(tx.meta.logMessages);
    for (let event of events) {
        console.log("\n ================== \n");
        console.log(event);
        console.log(event.data.amountAitech.toString());
    }
    return events;
}

main();
