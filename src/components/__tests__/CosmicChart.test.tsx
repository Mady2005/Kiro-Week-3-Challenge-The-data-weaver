import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CosmicChart from '../CosmicChart';
import { ChartDataPoint } from '../../types';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ name }: any) => <div data-testid={`line-${name}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: ({ yAxisId }: any) => <div data-testid={`y-axis-${yAxisId}`}>YAxis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  Legend: () => <div data-testid="legend">Legend</div>,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

describe('CosmicChart', () => {
  const mockData: ChartDataPoint[] = [
    { date: '2023-01-01', bitcoinPrice: 45000, asteroidCount: 5 },
    { date: '2023-01-02', bitcoinPrice: 46000, asteroidCount: 3 },
    { date: '2023-01-03', bitcoinPrice: 44000, asteroidCount: 7 },
  ];

  it('renders loading spinner when loading is true', () => {
    render(<CosmicChart data={[]} loading={true} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Chart should not be rendered
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders "No data available" message when data is empty', () => {
    render(<CosmicChart data={[]} loading={false} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Chart will appear when data is loaded')).toBeInTheDocument();
    
    // Chart should not be rendered
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('renders "No data available" message when data is null/undefined', () => {
    render(<CosmicChart data={null as any} loading={false} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    render(<CosmicChart data={mockData} loading={false} />);
    
    expect(screen.getByText('7-Day Trend Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders chart components when data is available', () => {
    render(<CosmicChart data={mockData} loading={false} />);
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-bitcoin')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis-asteroids')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders both Bitcoin and Asteroid lines', () => {
    render(<CosmicChart data={mockData} loading={false} />);
    
    expect(screen.getByTestId('line-Bitcoin Price')).toBeInTheDocument();
    expect(screen.getByTestId('line-Asteroid Count')).toBeInTheDocument();
  });

  it('has proper container styling', () => {
    render(<CosmicChart data={mockData} loading={false} />);
    
    const container = screen.getByText('7-Day Trend Analysis').closest('div');
    expect(container).toHaveClass(
      'bg-gray-900',
      'border',
      'border-purple-500/30',
      'rounded-lg',
      'p-6'
    );
  });

  it('has proper title styling', () => {
    render(<CosmicChart data={mockData} loading={false} />);
    
    const title = screen.getByText('7-Day Trend Analysis');
    expect(title).toHaveClass('text-xl', 'font-bold', 'text-white', 'mb-6');
  });
});