import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { userKeyPair } from "./helpers";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

//instantiate a new instance of our umi client running on the devnet cluster. 
const umi = createUmi('https://api.devnet.solana.com');

/* 
we will register our keypair to be used as the default signer 
when making any and all transactions, using the use method. 
It is a method that will allow us to inject plugins to our umi instance 
such as programs, signers and payers for transactions. 
*/
/* 
Let’s register our paper wallet keypair as the signer for all our transactions and register the mplMetadataProgram 
which we will be calling to create our token.
You will notice that directly using the `userKeypair` with the `keypairIdentity` interface will result in an error. 
This is because umi’s public key interface is defined differently from the one that @solana/web3.js uses. 
The fix is quite easy as we only need to wrap our keypair around umi’s eddsa interface,
*/
const keyPair = umi.eddsa.createKeypairFromSecretKey(userKeyPair.secretKey);
umi.use(keypairIdentity(keyPair))
    .use(mplTokenMetadata());