import { useState, useEffect, useCallback, useRef } from 'react';
import { CosmicData, ChartDataPoint, ProcessedAsteroidData } from '../types';
import { getCurrentBitcoinPrice, getBitcoinPriceHistory, formatBitcoinPriceHistory } from '../services/bitcoinService';
import { getTodayAsteroidData, getAsteroidHistory, getOverallHazardScore } from '../services/asteroidService';

/**
 * Custom hook for managing cosmic data (Bitcoin and asteroid data)
 * Handles data fetching, state management, and date alignment
 */
export const useCosmicData = (): CosmicData => {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [asteroidCount, setAsteroidCount] = useState<number>(0);
  const [hazardScore, setHazardScore] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if a refresh is in progress to prevent duplicate calls
  const refreshInProgress = useRef<boolean>(false);

  /**
   * Aligns Bitcoin and asteroid data by matching dates
   * Creates chart data points with both Bitcoin price and asteroid count
   */
  const alignDataByDate = useCallback((
    bitcoinHistory: Array<{ date: string; price: number }>,
    asteroidHistory: ProcessedAsteroidData[]
  ): ChartDataPoint[] => {
    const alignedData: ChartDataPoint[] = [];
    
    // Create a map of asteroid data by date for efficient lookup
    const asteroidMap = new Map<string, ProcessedAsteroidData>();
    asteroidHistory.forEach(data => {
      asteroidMap.set(data.date, data);
    });

    // Iterate through Bitcoin data and find matching asteroid data
    bitcoinHistory.forEach(bitcoinData => {
      const asteroidData = asteroidMap.get(bitcoinData.date);
      
      if (asteroidData) {
        alignedData.push({
          date: bitcoinData.date,
          bitcoinPrice: bitcoinData.price,
          asteroidCount: asteroidData.count,
        });
      }
    });

    // Sort by date to ensure consistent ordering
    return alignedData.sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  /**
   * Fetches all cosmic data (current prices, today's data, and historical data)
   */
  const fetchCosmicData = useCallback(async () => {
    // Prevent duplicate calls if refresh is already in progress
    if (refreshInProgress.current) {
      return;
    }

    refreshInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Fetch current data in parallel
      const [currentPrice, todayAsteroids] = await Promise.all([
        getCurrentBitcoinPrice(),
        getTodayAsteroidData(),
      ]);

      // Fetch historical data in parallel
      const [bitcoinHistory, asteroidHistory] = await Promise.all([
        getBitcoinPriceHistory(7),
        getAsteroidHistory(7),
      ]);

      // Format Bitcoin history
      const formattedBitcoinHistory = formatBitcoinPriceHistory(bitcoinHistory);

      // Align data by date for chart
      const alignedChartData = alignDataByDate(formattedBitcoinHistory, asteroidHistory);

      // Calculate overall hazard score from historical data
      const overallHazardScore = getOverallHazardScore(asteroidHistory);

      // Update state with fetched data
      setBitcoinPrice(currentPrice);
      setAsteroidCount(todayAsteroids.count);
      setHazardScore(overallHazardScore);
      setChartData(alignedChartData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // Don't clear existing data on error, just show error message
      console.error('Error fetching cosmic data:', err);
    } finally {
      setLoading(false);
      refreshInProgress.current = false;
    }
  }, [alignDataByDate]);

  /**
   * Refresh function that can be called manually
   * Implements idempotence to prevent duplicate API calls
   */
  const refresh = useCallback(() => {
    fetchCosmicData();
  }, [fetchCosmicData]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchCosmicData();
  }, [fetchCosmicData]);

  return {
    bitcoinPrice,
    asteroidCount,
    hazardScore,
    chartData,
    loading,
    error,
    refresh,
  };
};