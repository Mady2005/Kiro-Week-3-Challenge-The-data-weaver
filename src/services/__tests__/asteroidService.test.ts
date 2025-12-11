import * as fc from 'fast-check';
import { flattenNASAData, calculateHazardScore } from '../asteroidService';
import { NASAResponse, NEOObject } from '../../types';

/**
 * **Feature: cosmic-crypto-dashboard, Property 1: NASA data flattening preserves asteroid count**
 * **Validates: Requirements 1.4**
 */
describe('Property-Based Tests for Asteroid Service', () => {
  describe('NASA data flattening preserves asteroid count', () => {
    it('should preserve total asteroid count when flattening date-keyed objects', () => {
      fc.assert(
        fc.property(
          // Generator for NASA API response structure
          fc.dictionary(
            // Date keys in YYYY-MM-DD format
            fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
              .map(date => date.toISOString().split('T')[0]),
            // Arrays of NEO objects
            fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 20 }),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                is_potentially_hazardous_asteroid: fc.boolean(),
                close_approach_data: fc.array(
                  fc.record({
                    close_approach_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
                      .map(date => date.toISOString().split('T')[0]),
                    relative_velocity: fc.record({
                      kilometers_per_hour: fc.float({ min: 1, max: 100000 }).map(String)
                    }),
                    miss_distance: fc.record({
                      kilometers: fc.float({ min: 1000, max: 10000000 }).map(String)
                    })
                  }),
                  { minLength: 1, maxLength: 5 }
                )
              }) as fc.Arbitrary<NEOObject>,
              { minLength: 0, maxLength: 20 }
            ),
            { minKeys: 1, maxKeys: 7 } // NASA API supports max 7 days
          ).map(near_earth_objects => ({ near_earth_objects }) as NASAResponse),
          (nasaResponse) => {
            // Calculate expected total count from input
            const expectedTotalCount = Object.values(nasaResponse.near_earth_objects)
              .reduce((total, asteroids) => total + asteroids.length, 0);

            // Flatten the data
            const flattened = flattenNASAData(nasaResponse);

            // Calculate actual total count from flattened result
            const actualTotalCount = flattened.reduce((total, data) => total + data.count, 0);

            // Property: Total count should be preserved
            expect(actualTotalCount).toBe(expectedTotalCount);

            // Additional invariants
            expect(flattened.length).toBe(Object.keys(nasaResponse.near_earth_objects).length);
            
            // Each flattened entry should correspond to a date in the original data
            flattened.forEach(data => {
              expect(nasaResponse.near_earth_objects).toHaveProperty(data.date);
              expect(data.count).toBe(nasaResponse.near_earth_objects[data.date].length);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: cosmic-crypto-dashboard, Property 4: Hazard score calculation accuracy**
   * **Validates: Requirements 5.4**
   */
  describe('Hazard score calculation accuracy', () => {
    it('should calculate hazard score as (hazardous count / total count) * 100', () => {
      fc.assert(
        fc.property(
          // Generator for arrays of NEO objects
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              is_potentially_hazardous_asteroid: fc.boolean(),
              close_approach_data: fc.array(
                fc.record({
                  close_approach_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
                    .map(date => date.toISOString().split('T')[0]),
                  relative_velocity: fc.record({
                    kilometers_per_hour: fc.float({ min: 1, max: 100000 }).map(String)
                  }),
                  miss_distance: fc.record({
                    kilometers: fc.float({ min: 1000, max: 10000000 }).map(String)
                  })
                }),
                { minLength: 1, maxLength: 5 }
              )
            }) as fc.Arbitrary<NEOObject>,
            { minLength: 1, maxLength: 100 } // At least 1 asteroid to avoid division by zero
          ),
          (asteroids) => {
            // Calculate expected hazard score
            const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
            const totalCount = asteroids.length;
            const expectedPercentage = (hazardousCount / totalCount) * 100;
            const expectedRounded = Math.round(expectedPercentage * 10) / 10;

            // Calculate actual hazard score
            const actualScore = calculateHazardScore(asteroids);

            // Property: Hazard score should match expected calculation
            expect(actualScore).toBe(expectedRounded);

            // Additional invariants
            expect(actualScore).toBeGreaterThanOrEqual(0);
            expect(actualScore).toBeLessThanOrEqual(100);
            expect(Number.isFinite(actualScore)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for empty asteroid arrays', () => {
      const result = calculateHazardScore([]);
      expect(result).toBe(0);
    });
  });
});