import { formatBitcoinPriceHistory } from '../bitcoinService';
import { BitcoinPriceData } from '../../types';

describe('Bitcoin Service', () => {
  describe('formatBitcoinPriceHistory', () => {
    it('should format price history correctly', () => {
      const mockPriceData: BitcoinPriceData = {
        prices: [
          [1640995200000, 47123.45], // 2022-01-01
          [1641081600000, 47890.12], // 2022-01-02
        ]
      };

      const result = formatBitcoinPriceHistory(mockPriceData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2022-01-01',
        price: 47123.45
      });
      expect(result[1]).toEqual({
        date: '2022-01-02',
        price: 47890.12
      });
    });

    it('should round prices to 2 decimal places', () => {
      const mockPriceData: BitcoinPriceData = {
        prices: [
          [1640995200000, 47123.456789],
        ]
      };

      const result = formatBitcoinPriceHistory(mockPriceData);

      expect(result[0].price).toBe(47123.46);
    });

    it('should handle empty price data', () => {
      const mockPriceData: BitcoinPriceData = {
        prices: []
      };

      const result = formatBitcoinPriceHistory(mockPriceData);

      expect(result).toHaveLength(0);
    });
  });
});