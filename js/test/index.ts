import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { encodeURL } from '../src/app';
import { createTransaction, parseURL } from '../src/wallet';

const NATIVE_URL = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId1234';
const USDC_URL = 'solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId5678';

(async function() {
    const cluster = 'devnet';
    const endpoint = clusterApiUrl(cluster);
    const connection = new Connection(endpoint, 'confirmed');

    const originalURL = NATIVE_URL;

    // Wallet gets URL from deep link / QR code
    const { recipient, amount, token, references, label, message, memo } = parseURL(originalURL);

    // Apps can encode the URL from the required and optional parameters
    const encodedURL = encodeURL(recipient, amount, token, references, label, message, memo);

    console.log(originalURL);
    console.log(encodedURL);

    // This just represents the wallet's keypair for testing, in practice it will have a way of signing already
    const wallet = Keypair.generate();

    await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a transaction to transfer native SOL or SPL tokens
    const transaction = await createTransaction(
        connection,
        wallet.publicKey,
        recipient,
        amount,
        token,
        references,
        memo,
    );

    // Sign and send the transaction
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.sign(wallet);

    const rawTransaction = transaction.serialize();

    const signature = await connection.sendRawTransaction(rawTransaction);

    // Confirm the transaction
    const result = await connection.confirmTransaction(signature, 'confirmed');

    console.log(result);

    // Deep link back to the merchant app, or if using a QR code, just tell the user to go back to it
})();

