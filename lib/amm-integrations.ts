import axios from "axios";
import { AMM_ENDPOINTS } from "@/config/constants";
import type { SwapRequest, CreateTokenRequest, StakeRequest } from "@/types/api";
import { Connection, PublicKey, Transaction, VersionedTransaction, Keypair, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { NATIVE_MINT, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { API_URLS } from "@raydium-io/raydium-sdk-v2";
import { connection } from "./solana";

async function fetchOrCreateTokenAccount(owner: PublicKey, mint: PublicKey): Promise<PublicKey | null> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    try {
      await connection.getAccountInfo(tokenAccount);
      return tokenAccount; // Аккаунт существует
    } catch (e) {
      // Аккаунт не существует, создаём новый
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          owner,
          tokenAccount,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          SystemProgram.programId
        )
      );
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = owner;

      // Здесь нужна подпись, но на сервере это невозможно без ключа
      // Поэтому вернём null и обработаем на клиенте
      console.warn("Token account not found, creation required on client side:", tokenAccount.toBase58());
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch or create token account:", error);
    return null;
  }
}

export async function swapOnPump(request: SwapRequest) {
  try {
    const response = await axios.post(AMM_ENDPOINTS.PUMP, {
      publicKey: request.walletAddress,
      action: request.fromToken === "SOL" ? "buy" : "sell",
      mint: request.fromToken === "SOL" ? request.toToken : request.fromToken,
      denominatedInSol: request.fromToken === "SOL" ? "true" : "false",
      amount: request.amount,
      slippage: request.slippage * 100,
      priorityFee: 0.00001,
      pool: "pump",
    });

    return {
      success: true,
      serializedTransaction: response.data,
    };
  } catch (error) {
    console.error("Pump.fun swap error:", error);
    return {
      success: false,
      error: "Failed to execute swap on Pump.fun",
    };
  }
}

export async function createTokenOnPump(request: CreateTokenRequest) {
  try {
    const response = await axios.post(`${AMM_ENDPOINTS.PUMP}/create`, {
      name: request.name,
      symbol: request.symbol,
      initialSupply: request.supply,
      creator: request.walletAddress,
    });

    return {
      success: true,
      mintAddress: response.data.mint,
    };
  } catch (error) {
    console.error("Pump.fun token creation error:", error);
    return {
      success: false,
      error: "Failed to create token on Pump.fun",
    };
  }
}

export async function swapOnRaydium(request: SwapRequest) {
  try {
    const { walletAddress, fromToken, toToken, amount, slippage = 0.5 } = request;

    if (!walletAddress || !amount || isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid input data" };
    }

    const walletPublicKey = new PublicKey(walletAddress);
    const isInputSol = fromToken === NATIVE_MINT.toBase58();
    const isOutputSol = toToken === NATIVE_MINT.toBase58();

    // Получение или создание токеновых аккаунтов
    const inputTokenAcc = isInputSol ? null : await fetchOrCreateTokenAccount(walletPublicKey, new PublicKey(fromToken));
    const outputTokenAcc = isOutputSol ? null : await fetchOrCreateTokenAccount(walletPublicKey, new PublicKey(toToken));

    if (!isInputSol && !inputTokenAcc) {
      return { success: false, error: "Input token account not found or requires client-side creation" };
    }
    if (!isOutputSol && !outputTokenAcc) {
      return { success: false, error: "Output token account not found or requires client-side creation" };
    }

    // Получение котировки
    const swapComputeResponse = await axios.get(`${API_URLS.SWAP_HOST}/compute/swap-base-in`, {
      params: {
        inputMint: fromToken,
        outputMint: toToken,
        amount: amount.toString(),
        slippageBps: (slippage * 100).toString(),
        txVersion: "0",
      },
    });

    const swapResponse = swapComputeResponse.data;

    // Создание транзакции
    const swapTransactionResponse = await axios.post(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
      computeUnitPriceMicroLamports: "1000",
      swapResponse,
      txVersion: "0",
      wallet: walletPublicKey.toBase58(),
      wrapSol: isInputSol,
      unwrapSol: isOutputSol,
      inputAccount: inputTokenAcc?.toBase58(),
      outputAccount: outputTokenAcc?.toBase58(),
    });

    const { data } = swapTransactionResponse;
    if (!data.success) {
      return { success: false, error: data.error || "Failed to create swap transaction" };
    }

    const allTxBuf = data.data.transaction.map((tx: string) => Buffer.from(tx, "base64"));
    const allTransactions = allTxBuf.map((txBuf) => VersionedTransaction.deserialize(txBuf));

    // Возвращаем не подписанную транзакцию
    const serializedTransaction = allTransactions[0].serialize({
      requireAllSignatures: false,
    }).toString("base64");

    return {
      success: true,
      serializedTransaction,
      transactionDetails: {
        fromToken,
        toToken,
        amount,
        slippage,
      },
    };
  } catch (error) {
    console.error("Raydium swap error:", error);
    return {
      success: false,
      error: error.message || "Failed to prepare Raydium swap",
    };
  }
}

export async function swapOnMeteora(request: SwapRequest) {
  try {
    console.log("Meteora swap not implemented yet");
    return {
      success: false,
      error: "Meteora integration coming soon",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to execute swap on Meteora",
    };
  }
}

export async function stakeTokens(request: StakeRequest) {
  try {
    console.log("Staking not implemented yet");
    return {
      success: false,
      error: "Staking integration coming soon",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to stake tokens",
    };
  }
}