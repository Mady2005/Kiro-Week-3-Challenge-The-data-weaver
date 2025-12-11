import axios from 'axios';
import { BitcoinPriceData, CurrentBitcoinPrice } from '../types';
import { formatDateForAPI } from '../utils/dateUtils';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Fetches current Bitcoin price in USD from CoinGecko API
 * @returns Promise<number> Current Bitcoin price in USD
 * @throws Error if API request fails or response is invalid
 */
export const getCurrentBitcoinPrice = async (): Promise<number> => {
  try {
    const response = await axios.get<CurrentBitcoinPrice>(
      `${COINGECKO_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd`,
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Validate response structure
    if (!response.data || !response.data.bitcoin || typeof response.data.bitcoin.usd !== 'number') {
      throw new Error('Invalid response format from CoinGecko API');
    }

    const price = response.data.bitcoin.usd;
    
    // Validate price is a positive number
    if (price <= 0 || !isFinite(price)) {
      throw new Error('Invalid Bitcoin price received from API');
    }

    return price;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Bitcoin API request timed out. Please try again.');
      }
      if (error.response?.status === 429) {
        throw new Error('Bitcoin API rate limit exceeded. Please wait before retrying.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Bitcoin API server error. Please try again later.');
      }
      throw new Error(`Bitcoin API request failed: ${error.message}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred while fetching Bitcoin price');
  }
};

/**
 * Fetches Bitcoin price history for the last N days from CoinGecko API
 * @param days Number of days of history to fetch (default: 7)
 * @returns Promise<BitcoinPriceData> Historical price data
 * @throws Error if API request fails or response is invalid
 */
export const getBitcoinPriceHistory = async (days: number = 7): Promise<BitcoinPriceData> => {
  try {
    // Validate input
    if (!Number.isInteger(days) || days <= 0 || days > 365) {
      throw new Error('Days parameter must be a positive integer between 1 and 365');
    }

    const response = await axios.get<BitcoinPriceData>(
      `${COINGECKO_BASE_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        timeout: 15000, // 15 second timeout for historical data
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.prices)) {
      throw new Error('Invalid response format from CoinGecko historical API');
    }

    const { prices } = response.data;

    // Validate prices array
    if (prices.length === 0) {
      throw new Error('No historical price data available');
    }

    // Validate each price entry
    for (const priceEntry of prices) {
      if (!Array.isArray(priceEntry) || priceEntry.length !== 2) {
        throw new Error('Invalid price entry format in API response');
      }
      
      const [timestamp, price] = priceEntry;
      
      if (typeof timestamp !== 'number' || typeof price !== 'number') {
        throw new Error('Invalid timestamp or price type in API response');
      }
      
      if (timestamp <= 0 || price <= 0 || !isFinite(timestamp) || !isFinite(price)) {
        throw new Error('Invalid timestamp or price value in API response');
      }
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Bitcoin historical API request timed out. Please try again.');
      }
      if (error.response?.status === 429) {
        throw new Error('Bitcoin API rate limit exceeded. Please wait before retrying.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Bitcoin API server error. Please try again later.');
      }
      throw new Error(`Bitcoin historical API request failed: ${error.message}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred while fetching Bitcoin price history');
  }
};

/**
 * Converts Bitcoin price history to a more usable format with date strings
 * @param priceData Raw price data from CoinGecko API
 * @returns Array of objects with date strings and prices
 */
export const formatBitcoinPriceHistory = (priceData: BitcoinPriceData): Array<{ date: string; price: number }> => {
  return priceData.prices.map(([timestamp, price]) => ({
    date: formatDateForAPI(new Date(timestamp)),
    price: Math.round(price * 100) / 100, // Round to 2 decimal places
  }));
};