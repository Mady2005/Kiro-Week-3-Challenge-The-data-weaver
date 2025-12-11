// Bitcoin API Types
export interface BitcoinPriceData {
  prices: [number, number][]; // [timestamp, price]
}

export interface CurrentBitcoinPrice {
  bitcoin: {
    usd: number;
  };
}

// NASA API Types
export interface CloseApproachData {
  close_approach_date: string;
  relative_velocity: {
    kilometers_per_hour: string;
  };
  miss_distance: {
    kilometers: string;
  };
}

export interface NEOObject {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
}

export interface NASAResponse {
  near_earth_objects: {
    [date: string]: NEOObject[];
  };
}

export interface ProcessedAsteroidData {
  date: string;
  count: number;
  hazardousCount: number;
}

// Chart and Dashboard Types
export interface ChartDataPoint {
  date: string;
  bitcoinPrice: number;
  asteroidCount: number;
}

export interface CosmicData {
  bitcoinPrice: number | null;
  asteroidCount: number;
  hazardScore: number;
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Component Props Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any; // React component or element
  loading?: boolean;
}

export interface HeaderProps {
  onRefresh: () => void;
  loading?: boolean;
}

export interface CosmicChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}