

// Расширяем тип AMM
export type AMMType = "pump" | "raydium" | "meteora" | "jupiter" | "orca"

export interface SwapRequest {
  fromMint: string;
  toMint: string;
  amount: number;
  slippage?: number;
  walletAddress: string;
}

export interface SwapResponse {
  success: boolean;
  data?: {
    serializedTransaction: string;
    estimatedOutput?: string;
    priceImpact?: number;
    fees?: {
      networkFee: number;
      platformFee?: number;
    };
    route?: {
      from: string;
      to: string;
      amount: string;
      amm: string;
    };
  };
  error?: string;
  errorCode?: string;
}

export interface QuoteRequest {
  fromMint: string;
  toMint: string;
  amount: number;
}

export interface QuoteResponse {
  success: boolean;
  data?: {
    inputAmount: string;
    outputAmount: string;
    priceImpact: number;
    minimumReceived: string;
    fees: {
      networkFee: number;
      platformFee?: number;
    };
    route: string[];
  };
  error?: string;
}

export interface SwapResponse {
  success: boolean
  serializedTransaction?: string // Используем ваше поле вместо transactionId
  error?: string
  estimatedOutput?: number
}

export interface CreateTokenRequest {
  name: string
  symbol: string
  supply: number
  walletAddress: string
}

export interface CreateTokenResponse {
  success: boolean
  mintAddress?: string
  error?: string
}

export interface StakeRequest {
  tokenAddress: string
  amount: number
  amm: AMMType
  walletAddress: string
}

export interface StakeResponse {
  success: boolean
  stakingId?: string
  error?: string
}

export interface BalanceRequest {
  walletAddress: string
  tokenAddress?: string
}

export interface BalanceResponse {
  success: boolean
  balances?: {
    sol: number
    tokens?: { [address: string]: number }
  }
  error?: string
}

export interface HoldingRequest {
  walletAddress: string
  tokenAddress: string
}

export interface HoldingResponse {
  success: boolean
  isHolder: boolean
  amount: number
  error?: string
}