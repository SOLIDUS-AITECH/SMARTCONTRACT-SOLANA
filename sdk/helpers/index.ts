import fs from 'node:fs';
import { Keypair } from '@solana/web3.js';

export function u16ToBytes(num: number) {
    const arr = new ArrayBuffer(2);
    const view = new DataView(arr);
    view.setUint16(0, num, false);
    return new Uint8Array(arr);
}

export function i16ToBytes(num: number) {
    const arr = new ArrayBuffer(2);
    const view = new DataView(arr);
    view.setInt16(0, num, false);
    return new Uint8Array(arr);
}

export function u32ToBytes(num: number) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, num, false);
    return new Uint8Array(arr);
}

export function i32ToBytes(num: number) {
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setInt32(0, num, false);
    return new Uint8Array(arr);
}

export function u64ToBytes(num: bigint) {
    const arr = new ArrayBuffer(8);
    const view = new DataView(arr);
    view.setBigUint64(0, num, true);
    return new Uint8Array(arr);
}

export function loadKeypair(path: string) {
    const keypairData = JSON.parse(fs.readFileSync(path, "utf8"));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
}
