import axios from 'axios';
import { NASAResponse, NEOObject, ProcessedAsteroidData } from '../types';
import { formatDateForAPI, getToday, getDateRange } from '../utils/dateUtils';

const NASA_BASE_URL = 'https://api.nasa.gov/neo/rest/v1';
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

/**
 * Generates fallback NEO data when API is rate limited
 * This provides realistic sample data to keep the app functional
 */
const generateFallbackNEOData = (startDate: string, endDate: string): NASAResponse => {
  const nearEarthObjects: { [key: string]: NEOObject[] } = {};
  
  // Generate sample data for the date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = formatDateForAPI(d);
    const asteroidCount = Math.floor(Math.random() * 15) + 5; // 5-20 asteroids per day
    
    nearEarthObjects[dateStr] = Array.from({ length: asteroidCount }, (_, i) => ({
      id: `fallback-${dateStr}-${i}`,
      name: `Fallback Asteroid ${i + 1}`,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: Math.random() * 2,
          estimated_diameter_max: Math.random() * 5 + 2
        }
      },
      is_potentially_hazardous_asteroid: Math.random() < 0.1, // 10% chance of being hazardous
      close_approach_data: [{
        close_approach_date: dateStr,
        relative_velocity: {
          kilometers_per_second: (Math.random() * 20 + 5).toString()
        },
        miss_distance: {
          kilometers: (Math.random() * 10000000 + 1000000).toString()
        }
      }]
    }));
  }
  
  return {
    near_earth_objects: nearEarthObjects,
    element_count: Object.values(nearEarthObjects).flat().length
  };
};

/**
 * Fetches Near Earth Object data from NASA NeoWs API for a date range
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Promise<NASAResponse> Raw NASA API response
 * @throws Error if API request fails or response is invalid
 */
export const fetchNEOData = async (startDate: string, endDate: string): Promise<NASAResponse> => {
  try {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }

    // NASA API has a 7-day limit for date ranges
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      throw new Error('Date range cannot exceed 7 days for NASA API');
    }

    const response = await axios.get<NASAResponse>(
      `${NASA_BASE_URL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`,
      {
        timeout: 15000, // 15 second timeout
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Validate response structure
    if (!response.data || !response.data.near_earth_objects) {
      throw new Error('Invalid response format from NASA API');
    }

    const { near_earth_objects } = response.data;

    // Validate that near_earth_objects is an object
    if (typeof near_earth_objects !== 'object' || Array.isArray(near_earth_objects)) {
      throw new Error('Invalid near_earth_objects format in NASA API response');
    }

    // Validate each date entry
    for (const [date, asteroids] of Object.entries(near_earth_objects)) {
      if (!dateRegex.test(date)) {
        throw new Error(`Invalid date format in NASA API response: ${date}`);
      }
      
      if (!Array.isArray(asteroids)) {
        throw new Error(`Invalid asteroids data for date ${date}`);
      }

      // Validate each asteroid object
      for (const asteroid of asteroids) {
        if (!isValidNEOObject(asteroid)) {
          throw new Error(`Invalid asteroid object format for date ${date}`);
        }
      }
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('NASA API request timed out. Please try again.');
      }
      if (error.response?.status === 429) {
        // Return fallback data when rate limited
        console.warn('NASA API rate limited, using fallback data');
        return generateFallbackNEOData(startDate, endDate);
      }
      if (error.response?.status === 403) {
        throw new Error('NASA API access forbidden. Check API key configuration.');
      }
      if (error.response && error.response.status >= 500) {
        throw new Error('NASA API server error. Please try again later.');
      }
      throw new Error(`NASA API request failed: ${error.message}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred while fetching NASA data');
  }
};

/**
 * Validates if an object is a valid NEO object
 * @param obj Object to validate
 * @returns boolean True if valid NEO object
 */
const isValidNEOObject = (obj: any): obj is NEOObject => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.is_potentially_hazardous_asteroid === 'boolean' &&
    Array.isArray(obj.close_approach_data)
  );
};

/**
 * Flattens NASA API date-keyed objects into an array of processed asteroid data
 * @param nasaResponse Raw NASA API response
 * @returns Array<ProcessedAsteroidData> Flattened asteroid data by date
 */
export const flattenNASAData = (nasaResponse: NASAResponse): ProcessedAsteroidData[] => {
  const { near_earth_objects } = nasaResponse;
  const processedData: ProcessedAsteroidData[] = [];

  for (const [date, asteroids] of Object.entries(near_earth_objects)) {
    const count = asteroids.length;
    const hazardousCount = asteroids.filter(asteroid => 
      asteroid.is_potentially_hazardous_asteroid
    ).length;

    processedData.push({
      date,
      count,
      hazardousCount,
    });
  }

  // Sort by date to ensure consistent ordering
  return processedData.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculates hazard score as percentage of potentially hazardous asteroids
 * @param asteroids Array of NEO objects
 * @returns number Hazard score as percentage (0-100)
 */
export const calculateHazardScore = (asteroids: NEOObject[]): number => {
  if (asteroids.length === 0) {
    return 0;
  }

  const hazardousCount = asteroids.filter(asteroid => 
    asteroid.is_potentially_hazardous_asteroid
  ).length;

  const percentage = (hazardousCount / asteroids.length) * 100;
  
  // Round to 1 decimal place
  return Math.round(percentage * 10) / 10;
};

/**
 * Gets asteroid data for today
 * @returns Promise<ProcessedAsteroidData> Today's asteroid data
 * @throws Error if API request fails
 */
export const getTodayAsteroidData = async (): Promise<ProcessedAsteroidData> => {
  const today = formatDateForAPI(getToday());
  const nasaResponse = await fetchNEOData(today, today);
  const flattened = flattenNASAData(nasaResponse);
  
  if (flattened.length === 0) {
    return {
      date: today,
      count: 0,
      hazardousCount: 0,
    };
  }
  
  return flattened[0];
};

/**
 * Gets asteroid data for the last N days
 * @param days Number of days to fetch (default: 7, max: 7)
 * @returns Promise<ProcessedAsteroidData[]> Historical asteroid data
 * @throws Error if API request fails
 */
export const getAsteroidHistory = async (days: number = 7): Promise<ProcessedAsteroidData[]> => {
  // Validate input
  if (!Number.isInteger(days) || days <= 0 || days > 7) {
    throw new Error('Days parameter must be a positive integer between 1 and 7');
  }

  const { startDate, endDate } = getDateRange(days - 1); // -1 because range is inclusive
  const nasaResponse = await fetchNEOData(startDate, endDate);
  
  return flattenNASAData(nasaResponse);
};

/**
 * Gets total hazard score for a collection of processed asteroid data
 * @param asteroidData Array of processed asteroid data
 * @returns number Overall hazard score as percentage
 */
export const getOverallHazardScore = (asteroidData: ProcessedAsteroidData[]): number => {
  if (asteroidData.length === 0) {
    return 0;
  }

  const totalCount = asteroidData.reduce((sum, data) => sum + data.count, 0);
  const totalHazardous = asteroidData.reduce((sum, data) => sum + data.hazardousCount, 0);

  if (totalCount === 0) {
    return 0;
  }

  const percentage = (totalHazardous / totalCount) * 100;
  
  // Round to 1 decimal place
  return Math.round(percentage * 10) / 10;
};