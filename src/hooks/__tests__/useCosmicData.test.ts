import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { useCosmicData } from '../useCosmicData';
import * as bitcoinService from '../../services/bitcoinService';
import * as asteroidService from '../../services/asteroidService';
import { ProcessedAsteroidData, ChartDataPoint } from '../../types';

// Mock the services
jest.mock('../../services/bitcoinService');
jest.mock('../../services/asteroidService');

const mockedBitcoinService = bitcoinService as jest.Mocked<typeof bitcoinService>;
const mockedAsteroidService = asteroidService as jest.Mocked<typeof asteroidService>;

describe('useCosmicData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockedBitcoinService.getCurrentBitcoinPrice.mockResolvedValue(50000);
    mockedBitcoinService.getBitcoinPriceHistory.mockResolvedValue({
      prices: [[Date.now(), 50000]]
    });
    mockedBitcoinService.formatBitcoinPriceHistory.mockReturnValue([
      { date: '2023-12-11', price: 50000 }
    ]);
    
    mockedAsteroidService.getTodayAsteroidData.mockResolvedValue({
      date: '2023-12-11',
      count: 5,
      hazardousCount: 1
    });
    mockedAsteroidService.getAsteroidHistory.mockResolvedValue([
      { date: '2023-12-11', count: 5, hazardousCount: 1 }
    ]);
    mockedAsteroidService.getOverallHazardScore.mockReturnValue(20);
  });

  /**
   * **Feature: cosmic-crypto-dashboard, Property 2: Date alignment produces consistent merged data**
   * **Validates: Requirements 2.5**
   * 
   * For any Bitcoin price data and asteroid data with overlapping dates, 
   * the merged result should contain exactly one entry per matching date 
   * with both Bitcoin price and asteroid count
   */
  describe('Property 2: Date alignment produces consistent merged data', () => {
    it('should produce consistent merged data for any overlapping dates', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate Bitcoin history data
          fc.array(
            fc.record({
              date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
                .map(d => d.toISOString().split('T')[0]),
              price: fc.float({ min: 1, max: 100000, noNaN: true })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          // Generate asteroid history data
          fc.array(
            fc.record({
              date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
                .map(d => d.toISOString().split('T')[0]),
              count: fc.integer({ min: 0, max: 50 }),
              hazardousCount: fc.integer({ min: 0, max: 10 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (bitcoinHistory, asteroidHistory) => {
            // Mock the services to return our generated data
            mockedBitcoinService.formatBitcoinPriceHistory.mockReturnValue(bitcoinHistory);
            mockedAsteroidService.getAsteroidHistory.mockResolvedValue(asteroidHistory);

            const { result } = renderHook(() => useCosmicData());

            // Wait for the hook to complete loading
            await act(async () => {
              await new Promise(resolve => setTimeout(resolve, 100));
            });

            const chartData = result.current.chartData;

            // Find overlapping dates
            const bitcoinDates = new Set(bitcoinHistory.map(b => b.date));
            const asteroidDates = new Set(asteroidHistory.map(a => a.date));
            const overlappingDates = [...bitcoinDates].filter(date => asteroidDates.has(date));

            // Property: merged data should have exactly one entry per overlapping date
            expect(chartData.length).toBe(overlappingDates.length);

            // Property: each entry should have both Bitcoin price and asteroid count
            chartData.forEach(dataPoint => {
              expect(typeof dataPoint.bitcoinPrice).toBe('number');
              expect(typeof dataPoint.asteroidCount).toBe('number');
              expect(typeof dataPoint.date).toBe('string');
              
              // Verify the data point corresponds to overlapping dates
              expect(overlappingDates).toContain(dataPoint.date);
              
              // Verify the Bitcoin price matches the original data
              const originalBitcoin = bitcoinHistory.find(b => b.date === dataPoint.date);
              expect(originalBitcoin).toBeDefined();
              expect(dataPoint.bitcoinPrice).toBe(originalBitcoin!.price);
              
              // Verify the asteroid count matches the original data
              const originalAsteroid = asteroidHistory.find(a => a.date === dataPoint.date);
              expect(originalAsteroid).toBeDefined();
              expect(dataPoint.asteroidCount).toBe(originalAsteroid!.count);
            });

            // Property: no duplicate dates in merged data
            const chartDates = chartData.map(d => d.date);
            const uniqueChartDates = [...new Set(chartDates)];
            expect(chartDates.length).toBe(uniqueChartDates.length);

            // Property: chart data should be sorted by date
            const sortedDates = [...chartDates].sort();
            expect(chartDates).toEqual(sortedDates);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: cosmic-crypto-dashboard, Property 3: Refresh idempotence prevents duplicate calls**
   * **Validates: Requirements 3.5**
   * 
   * For any sequence of rapid refresh requests, only one set of API calls 
   * should be active at any given time
   */
  describe('Property 3: Refresh idempotence prevents duplicate calls', () => {
    it('should prevent duplicate API calls during rapid refresh requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a sequence of refresh calls (1 to 10 rapid calls)
          fc.integer({ min: 1, max: 10 }),
          async (numberOfRefreshCalls) => {
            // Reset mocks to track call counts
            jest.clearAllMocks();
            
            // Mock services with delayed responses to simulate real API calls
            const mockDelay = 50; // 50ms delay
            mockedBitcoinService.getCurrentBitcoinPrice.mockImplementation(
              () => new Promise(resolve => setTimeout(() => resolve(50000), mockDelay))
            );
            mockedBitcoinService.getBitcoinPriceHistory.mockImplementation(
              () => new Promise(resolve => setTimeout(() => resolve({ prices: [[Date.now(), 50000]] }), mockDelay))
            );
            mockedAsteroidService.getTodayAsteroidData.mockImplementation(
              () => new Promise(resolve => setTimeout(() => resolve({
                date: '2023-12-11',
                count: 5,
                hazardousCount: 1
              }), mockDelay))
            );
            mockedAsteroidService.getAsteroidHistory.mockImplementation(
              () => new Promise(resolve => setTimeout(() => resolve([
                { date: '2023-12-11', count: 5, hazardousCount: 1 }
              ]), mockDelay))
            );

            const { result } = renderHook(() => useCosmicData());

            // Wait for initial load to complete
            await act(async () => {
              await new Promise(resolve => setTimeout(resolve, mockDelay * 2));
            });

            // Clear mocks after initial load
            jest.clearAllMocks();

            // Perform rapid refresh calls
            await act(async () => {
              const refreshPromises = Array.from({ length: numberOfRefreshCalls }, () => {
                return new Promise<void>((resolve) => {
                  result.current.refresh();
                  resolve();
                });
              });
              
              await Promise.all(refreshPromises);
              
              // Wait for all potential API calls to complete
              await new Promise(resolve => setTimeout(resolve, mockDelay * 2));
            });

            // Property: Each API should be called at most once per refresh cycle
            // Since we have idempotence, even with multiple refresh calls,
            // each API should only be called once (or a small number of times due to timing)
            expect(mockedBitcoinService.getCurrentBitcoinPrice).toHaveBeenCalledTimes(1);
            expect(mockedBitcoinService.getBitcoinPriceHistory).toHaveBeenCalledTimes(1);
            expect(mockedAsteroidService.getTodayAsteroidData).toHaveBeenCalledTimes(1);
            expect(mockedAsteroidService.getAsteroidHistory).toHaveBeenCalledTimes(1);

            // Property: The hook should not be in loading state after completion
            expect(result.current.loading).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit Tests
  describe('Unit Tests', () => {
    describe('Hook initialization and state management', () => {
      it('should initialize with correct default values', () => {
        const { result } = renderHook(() => useCosmicData());

        expect(result.current.bitcoinPrice).toBeNull();
        expect(result.current.asteroidCount).toBe(0);
        expect(result.current.hazardScore).toBe(0);
        expect(result.current.chartData).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.refresh).toBe('function');
      });

      it('should update state after successful data fetch', async () => {
        const { result } = renderHook(() => useCosmicData());

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.bitcoinPrice).toBe(50000);
        expect(result.current.asteroidCount).toBe(5);
        expect(result.current.hazardScore).toBe(20);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    describe('Error handling and loading states', () => {
      it('should handle Bitcoin API errors gracefully', async () => {
        mockedBitcoinService.getCurrentBitcoinPrice.mockRejectedValue(
          new Error('Bitcoin API failed')
        );

        const { result } = renderHook(() => useCosmicData());

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Bitcoin API failed');
      });

      it('should handle asteroid API errors gracefully', async () => {
        mockedAsteroidService.getTodayAsteroidData.mockRejectedValue(
          new Error('NASA API failed')
        );

        const { result } = renderHook(() => useCosmicData());

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('NASA API failed');
      });

      it('should maintain previous data when refresh fails', async () => {
        const { result } = renderHook(() => useCosmicData());

        // Wait for initial successful load
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        const initialBitcoinPrice = result.current.bitcoinPrice;
        const initialAsteroidCount = result.current.asteroidCount;

        // Mock API failure for refresh
        mockedBitcoinService.getCurrentBitcoinPrice.mockRejectedValue(
          new Error('API temporarily unavailable')
        );

        // Trigger refresh
        await act(async () => {
          result.current.refresh();
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        // Should maintain previous data
        expect(result.current.bitcoinPrice).toBe(initialBitcoinPrice);
        expect(result.current.asteroidCount).toBe(initialAsteroidCount);
        expect(result.current.error).toBe('API temporarily unavailable');
      });
    });

    describe('Refresh functionality', () => {
      it('should call all APIs when refresh is triggered', async () => {
        const { result } = renderHook(() => useCosmicData());

        // Wait for initial load
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        // Clear mocks
        jest.clearAllMocks();

        // Trigger refresh
        await act(async () => {
          result.current.refresh();
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(mockedBitcoinService.getCurrentBitcoinPrice).toHaveBeenCalledTimes(1);
        expect(mockedBitcoinService.getBitcoinPriceHistory).toHaveBeenCalledWith(7);
        expect(mockedAsteroidService.getTodayAsteroidData).toHaveBeenCalledTimes(1);
        expect(mockedAsteroidService.getAsteroidHistory).toHaveBeenCalledWith(7);
      });

      it('should set loading state during refresh', async () => {
        // Mock with delayed response
        mockedBitcoinService.getCurrentBitcoinPrice.mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(55000), 50))
        );

        const { result } = renderHook(() => useCosmicData());

        // Wait for initial load
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.loading).toBe(false);

        // Trigger refresh and check loading state
        act(() => {
          result.current.refresh();
        });

        expect(result.current.loading).toBe(true);

        // Wait for completion
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.loading).toBe(false);
      });

      it('should clear error state on successful refresh', async () => {
        // Start with an error
        mockedBitcoinService.getCurrentBitcoinPrice.mockRejectedValueOnce(
          new Error('Initial error')
        );

        const { result } = renderHook(() => useCosmicData());

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.error).toBe('Initial error');

        // Mock successful response for refresh
        mockedBitcoinService.getCurrentBitcoinPrice.mockResolvedValue(60000);

        await act(async () => {
          result.current.refresh();
          await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.error).toBeNull();
        expect(result.current.bitcoinPrice).toBe(60000);
      });
    });
  });
});