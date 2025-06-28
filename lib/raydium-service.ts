import axios from "axios";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { NATIVE_MINT, getAssociatedTokenAddress } from "@solana/spl-token";
import { API_URLS } from "@raydium-io/raydium-sdk-v2";
import { connection } from "./solana";
import type { SwapRequest, QuoteRequest } from "@/types/api";

export class RaydiumService {
  private static instance: RaydiumService;
  private connection: Connection;

  constructor() {
    this.connection = connection;
  }

  static getInstance(): RaydiumService {
    if (!RaydiumService.instance) {
      RaydiumService.instance = new RaydiumService();
    }
    return RaydiumService.instance;
  }

  async getQuote(request: QuoteRequest) {
    try {
      const { fromMint, toMint, amount } = request;
      
      const response = await axios.get(`${API_URLS.SWAP_HOST}/compute/swap-base-in`, {
        params: {
          inputMint: fromMint,
          outputMint: toMint,
          amount: amount.toString(),
          slippageBps: "50", // 0.5% для котировки
          txVersion: "0",
        },
      });

      const data = response.data;
      
      return {
        success: true,
        data: {
          inputAmount: data.inputAmount,
          outputAmount: data.outputAmount,
          priceImpact: parseFloat(data.priceImpact || "0"),
          minimumReceived: data.minimumAmountOut,
          fees: {
            networkFee: parseFloat(data.fee || "0"),
            platformFee: 0, // Ваша комиссия
          },
          route: [fromMint, toMint],
        },
      };
    } catch (error) {
      console.error("Quote error:", error);
      return {
        success: false,
        error: "Failed to get quote",
        errorCode: "QUOTE_ERROR",
      };
    }
  }

  async prepareSwap(request: SwapRequest) {
    try {
      const { walletAddress, fromMint, toMint, amount, slippage = 0.5 } = request;

      // Валидация
      if (!this.validateSwapRequest(request)) {
        return {
          success: false,
          error: "Invalid swap parameters",
          errorCode: "INVALID_PARAMS",
        };
      }

      const walletPublicKey = new PublicKey(walletAddress);
      const isInputSol = fromMint === NATIVE_MINT.toBase58();
      const isOutputSol = toMint === NATIVE_MINT.toBase58();

      // Проверка токеновых аккаунтов
      const accountsValidation = await this.validateTokenAccounts(
        walletPublicKey,
        fromMint,
        toMint,
        isInputSol,
        isOutputSol
      );

      if (!accountsValidation.success) {
        return accountsValidation;
      }

      // Получение котировки
      const swapComputeResponse = await axios.get(`${API_URLS.SWAP_HOST}/compute/swap-base-in`, {
        params: {
          inputMint: fromMint,
          outputMint: toMint,
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
        inputAccount: accountsValidation.inputAccount,
        outputAccount: accountsValidation.outputAccount,
      });

      const { data } = swapTransactionResponse;
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || "Failed to create swap transaction",
          errorCode: "TRANSACTION_ERROR",
        };
      }

      const allTxBuf = data.data.transaction.map((tx: string) => Buffer.from(tx, "base64"));
      const allTransactions = allTxBuf.map((txBuf) => VersionedTransaction.deserialize(txBuf));

      const serializedTransaction = allTransactions[0].serialize({
        requireAllSignatures: false,
      }).toString("base64");

      return {
        success: true,
        data: {
          serializedTransaction,
          estimatedOutput: swapResponse.outputAmount,
          priceImpact: parseFloat(swapResponse.priceImpact || "0"),
          fees: {
            networkFee: parseFloat(swapResponse.fee || "0"),
            platformFee: 0,
          },
          route: {
            from: fromMint,
            to: toMint,
            amount: amount.toString(),
            amm: "Raydium",
          },
        },
      };
    } catch (error) {
      console.error("Raydium swap error:", error);
      return {
        success: false,
        error: "Failed to prepare swap transaction",
        errorCode: "SWAP_ERROR",
      };
    }
  }

  private validateSwapRequest(request: SwapRequest): boolean {
    const { walletAddress, fromMint, toMint, amount } = request;
    
    if (!walletAddress || !fromMint || !toMint || !amount) {
      return false;
    }

    if (isNaN(amount) || amount <= 0) {
      return false;
    }

    if (fromMint === toMint) {
      return false;
    }

    try {
      new PublicKey(walletAddress);
      new PublicKey(fromMint);
      new PublicKey(toMint);
    } catch {
      return false;
    }

    return true;
  }

  private async validateTokenAccounts(
    walletPublicKey: PublicKey,
    fromMint: string,
    toMint: string,
    isInputSol: boolean,
    isOutputSol: boolean
  ) {
    try {
      let inputAccount = null;
      let outputAccount = null;

      if (!isInputSol) {
        inputAccount = await getAssociatedTokenAddress(new PublicKey(fromMint), walletPublicKey);
        const inputAccountInfo = await this.connection.getAccountInfo(inputAccount);
        if (!inputAccountInfo) {
          return {
            success: false,
            error: "Input token account not found",
            errorCode: "INPUT_ACCOUNT_NOT_FOUND",
          };
        }
      }

      if (!isOutputSol) {
        outputAccount = await getAssociatedTokenAddress(new PublicKey(toMint), walletPublicKey);
        // Для выходного аккаунта не обязательно существование - он может быть создан
      }

      return {
        success: true,
        inputAccount: inputAccount?.toBase58(),
        outputAccount: outputAccount?.toBase58(),
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to validate token accounts",
        errorCode: "ACCOUNT_VALIDATION_ERROR",
      };
    }
  }
}