# Solana API Service

A Next.js-based API service for interacting with the Solana blockchain, providing endpoints for token swaps, creation, and staking across multiple AMMs.

## Features

- **Token Swaps**: Execute swaps across Pump.fun, Raydium, and Meteora
- **Token Creation**: Create new tokens on Solana
- **Staking**: Stake tokens in supported AMMs
- **Wallet Integration**: Check balances and token holdings
- **Rate Limiting**: Token holders get unlimited access, non-holders are limited
- **Simple Frontend**: Minimal UI for wallet connection and API interaction

## Setup

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   
   Update `.env.local` with your configuration:
   - `SOLANA_RPC_URL`: Your Solana RPC endpoint
   - `PROJECT_TOKEN_ADDRESS`: Your project token mint address
   - `API_RATE_LIMIT`: Daily request limit for non-token holders

3. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### POST /api/swap
Execute token swaps across supported AMMs.

**Parameters:**
- `fromToken`: Source token address
- `toToken`: Destination token address
- `amount`: Amount to swap
- `amm`: AMM to use ("pump", "raydium", "meteora")
- `slippage`: Slippage tolerance
- `walletAddress`: User wallet address

### POST /api/create-token
Create a new token on Solana.

**Parameters:**
- `name`: Token name
- `symbol`: Token symbol
- `supply`: Initial supply
- `walletAddress`: Creator wallet address

### POST /api/stake
Stake tokens in supported AMMs.

**Parameters:**
- `tokenAddress`: Token to stake
- `amount`: Amount to stake
- `amm`: AMM to stake in
- `walletAddress`: User wallet address

### POST /api/wallet/balance
Check wallet balance for SOL and tokens.

**Parameters:**
- `walletAddress`: Wallet address to check
- `tokenAddress`: Specific token address (optional)

### POST /api/wallet/holding
Check if wallet holds a specific token.

**Parameters:**
- `walletAddress`: Wallet address to check
- `tokenAddress`: Token address to check

## Rate Limiting

- **Non-token holders**: 100 requests per day
- **Token holders**: Unlimited access
- Rate limits reset daily at midnight UTC

## Frontend Pages

- `/`: Homepage with wallet connection and token utility explanation
- `/docs`: API documentation for developers
- `/dashboard`: User dashboard showing balances and API usage

## Project Structure

\`\`\`
├── app/
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard page
│   ├── docs/               # Documentation page
│   └── page.tsx            # Homepage
├── components/             # React components
├── config/                # Configuration files
├── lib/                   # Utility functions
├── middleware/            # Rate limiting middleware
└── types/                 # TypeScript types
\`\`\`

## Development Notes

- AMM integrations are currently placeholders - implement actual SDK calls
- Rate limiting uses in-memory storage - use Redis for production
- Wallet adapter is configured for mainnet - adjust for development
- Add proper error handling and logging for production use

## Deployment

1. Set up environment variables in your deployment platform
2. Configure Solana RPC endpoint (recommend Helius or QuickNode)
3. Set up Redis for production rate limiting
4. Deploy to Vercel or similar platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
