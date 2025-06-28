export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
}

export interface WalletBalance {
  sol: number
  tokens: { [address: string]: number }
}

export interface TransactionResult {
  signature: string
  success: boolean
  error?: string
}
