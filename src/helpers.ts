import { readFileSync } from "fs";
import { homedir } from "os";
import  { Keypair } from "@solana/web3.js"

//Extracts your paper wallet keypair.
const USER_KEY_PAIR_PATH = homedir() + "/.config/solana/id.json";
export const userKeyPair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(USER_KEY_PAIR_PATH, "utf-8")))
);
