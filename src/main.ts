import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { userKeyPair } from "./helpers";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { TokenStandard, createV1, mintV1, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

//instantiate a new instance of our umi client running on the devnet cluster. 
const umi = createUmi('https://api.devnet.solana.com');

/* 
we will register our keyPair to be used as the default signer 
when making any and all transactions, using the use method. 
It is a method that will allow us to inject plugins to our umi instance 
such as programs, signers and payers for transactions. 
*/
/* 
Let’s register our paper wallet keyPair as the signer for all our transactions and register the mplMetadataProgram 
which we will be calling to create our token.
You will notice that directly using the `keyPair` with the `keypairIdentity` interface will result in an error. 
This is because umi’s public key interface is defined differently from the one that @solana/web3.js uses. 
The fix is quite easy as we only need to wrap our keypair around umi’s eddsa interface,
*/
const keyPair = umi.eddsa.createKeypairFromSecretKey(userKeyPair.secretKey);
umi.use(keypairIdentity(keyPair))
    .use(mplTokenMetadata());

/* 
  Minting process
  1. Uploading our asset metadata to an off-chain or centralized storage provider. We will not carry out this process and shall be using a URI we uploaded earlier.
  2. Creating the on-chain metadata account that will hold our asset data such as the off-chain URI, mint, symbol …
  3. Finally, we mint our token with the associated accounts.
*/
const metadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/vikashruhilgit/ts-token-solana/main/src/assets/spl-token.json",
};

const mint = generateSigner(umi);

// Using the CreateV1 method we here define the metadata and behaviour of our token such as the number of decimals… 
// CreateV1 is a generic function that can also be used to create a token that’s Non-Fungible
async function createMetadataDetails() {
  await createV1(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: 9,
      tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi)
}

/* 
It’s worth also noting that if the Mint account does not exist, it will be automatically created for us. 
If you pass a mint account that exists, then this function is able to determine the type of token(tokenStandard) and 
thus you can omit the field if you already have a mint account already initialized. 
To finish off our build, We will need to call the instruction to mint our tokens using the Mintv1 function.
*/
async function mintToken() {
  await mintV1(umi, {
      mint: mint.publicKey,
      authority: umi.identity,
      amount: 10_000,
      tokenOwner: umi.identity.publicKey,
      tokenStandard: TokenStandard.Fungible,
  }).sendAndConfirm(umi)
}

async function createToken(){
  await createMetadataDetails();
  await mintToken();
}

createToken();

/* 
To make the process of creating tokens easier, 
umi also provides methods that abstract creating tokens into a two-step process and into one function. 
Using the createFungible method, we are able to easily reduce the number of functions we are writing.
createFungible(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 9,
}).sendAndConfirm(umi);
*/