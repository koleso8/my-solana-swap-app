
import axios from 'axios';

interface TokenMetadata {
  name: string;
  symbol: string;
  logo?: string;
  decimals?: number;
}

export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      throw new Error('MORALIS_API_KEY is not defined in environment variables');
    }

    const url = `https://solana-gateway.moralis.io/token/mainnet/${mintAddress}/metadata`;
    console.log('Requesting token metadata for:', mintAddress); // Лог запроса
    const response = await axios.get(url, {
      headers: {
        'X-API-Key': apiKey,
        'accept': 'application/json',
      },
    });

    const data = response.data;
  

    // Проверяем, что данные содержат ожидаемые поля
    if (data && data.name && data.symbol) {
      return {
        name: data.name,
        symbol: data.symbol,
        logo: data.logo || undefined,
        decimals: data.decimals || undefined,
      };
    } else {
      console.warn('Incomplete token metadata for mint:', mintAddress, data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching token metadata from Moralis for mint:', mintAddress, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Moralis API error:', error.response.status, error.response.data);
    }
    return null;
  }
}