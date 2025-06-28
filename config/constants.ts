
export const SOLANA_CONFIG = {
  RPC_URL: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  PROJECT_TOKEN_ADDRESS: process.env.PROJECT_TOKEN_ADDRESS || "",
  API_RATE_LIMIT: Number.parseInt(process.env.API_RATE_LIMIT || "100"),
}

export const AMM_ENDPOINTS = {
  PUMP: process.env.PUMP_API_URL || 'https://pumpportal.fun/api/trade-local',
  RAYDIUM: process.env.RAYDIUM_API_URL ||'https://api.raydium.io/v2', 
  METEORA: process.env.METEORA_API_URL ||'https://api.meteora.ag',
  JUPITER: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
  ORCA: 'https://api.orca.so', // Placeholder for future
 
}


export const API_CONFIG = {
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 минута
    MAX_REQUESTS: 30,
  },
  FEES: {
    PLATFORM_FEE_BPS: 0, // Ваша комиссия в базисных пунктах
  },
};

// Расширяем список поддерживаемых AMM
export const SUPPORTED_AMMS = ["pump", "raydium", "meteora", "jupiter", "orca"] as const

export const Project_Name = process.env.PROJECT_NAME || "Solana Developer Tools"
export const Project_Domain = process.env.PROJECT_DOMAIN || process.env.NEXT_PUBLIC_PROJECT_DOMAIN || "https://soldev.tools"; 


// Информация о статусе AMM
export const AMM_STATUS = {
  pump: 'active',
  raydium: 'coming_soon', 
  meteora: 'coming_soon',
  jupiter: 'planned',
  orca: 'planned'
} as const

// Эндпоинты для API
export const API_ENDPOINTS = {
  pump: '/api/swap/pump',
  raydium: '/api/swap/raydium', 
  meteora: '/api/swap/meteora',
  jupiter: '/api/swap/jupiter',
  orca: '/api/swap/orca'
} as const