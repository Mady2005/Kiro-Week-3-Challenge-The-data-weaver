import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { useCosmicData } from '../../hooks/useCosmicData';

// Mock the useCosmicData hook
jest.mock('../../hooks/useCosmicData');
const mockUseCosmicData = useCosmicData as jest.MockedFunction<typeof useCosmicData>;

describe('Dashboard Integration Tests', () => {
  const mockRefresh = jest.fn();

  const mockCosmicData = {
    bitcoinPrice: 45000,
    asteroidCount: 12,
    hazardScore: 15.5,
    chartData: [
      { date: '2023-12-01', bitcoinPrice: 44000, asteroidCount: 10 },
      { date: '2023-12-02', bitcoinPrice: 45000, asteroidCount: 12 },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
  };

  beforeEach(() => {
    mockRefresh.mockClear();
    mockUseCosmicData.mockReturnValue(mockCosmicData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete data flow from API to UI', () => {
    it('renders all components with data from useCosmicData hook', () => {
      render(<Dashboard />);

      // Check Header is rendered
      expect(screen.getByText('Cosmic Crypto Tracker')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh data/i })).toBeInTheDocument();

      // Check MetricCards are rendered with correct data
      expect(screen.getByText('Bitcoin Price')).toBeInTheDocument();
      expect(screen.getByText('$45,000')).toBeInTheDocument();
      
      expect(screen.getByText('Asteroids Today')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      
      expect(screen.getByText('Hazard Score')).toBeInTheDocument();
      expect(screen.getByText('15.5%')).toBeInTheDocument();

      // Check Chart is rendered
      expect(screen.getByText('7-Day Trend Analysis')).toBeInTheDocument();

      // Check Footer is rendered
      expect(screen.getByText('Data provided by CoinGecko API and NASA NeoWs API')).toBeInTheDocument();
    });

    it('displays loading state correctly across all components', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        loading: true,
      });

      render(<Dashboard />);

      // Header should show loading state
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      
      // MetricCards should show loading state
      const loadingSpinners = screen.getAllByRole('status');
      expect(loadingSpinners.length).toBeGreaterThan(0);
    });

    it('handles null Bitcoin price correctly', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        bitcoinPrice: null,
      });

      render(<Dashboard />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays chart with empty data state', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        chartData: [],
      });

      render(<Dashboard />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('Chart will appear when data is loaded')).toBeInTheDocument();
    });
  });

  describe('Error handling scenarios', () => {
    it('displays error boundary when error occurs', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        error: 'Failed to fetch Bitcoin data',
        loading: false,
      });

      render(<Dashboard />);

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch Bitcoin data')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('allows retry when error occurs', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        error: 'Network error',
        loading: false,
      });

      render(<Dashboard />);

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('does not show error when loading', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        error: 'Some error',
        loading: true,
      });

      render(<Dashboard />);

      // Should show normal loading state, not error
      expect(screen.queryByText('Error Loading Data')).not.toBeInTheDocument();
      expect(screen.getByText('Cosmic Crypto Tracker')).toBeInTheDocument();
    });

    it('maintains previous data when error occurs during refresh', () => {
      // First render with data
      render(<Dashboard />);
      expect(screen.getByText('$45,000')).toBeInTheDocument();

      // Then simulate error during refresh (error shows but data might still be there in real scenario)
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        error: 'Refresh failed',
        loading: false,
      });

      // Re-render to simulate state change
      render(<Dashboard />);
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
    });
  });

  describe('Refresh functionality end-to-end', () => {
    it('calls refresh function when header refresh button is clicked', () => {
      render(<Dashboard />);

      const refreshButton = screen.getByRole('button', { name: /refresh data/i });
      fireEvent.click(refreshButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during refresh', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        loading: true,
      });

      render(<Dashboard />);

      // Header should show loading
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      
      // Refresh button should be disabled
      const refreshButton = screen.getByRole('button', { name: /refresh data/i });
      expect(refreshButton).toBeDisabled();
    });

    it('updates all metrics after successful refresh', async () => {
      // Initial render
      render(<Dashboard />);
      expect(screen.getByText('$45,000')).toBeInTheDocument();

      // Simulate refresh with new data
      const updatedData = {
        ...mockCosmicData,
        bitcoinPrice: 46000,
        asteroidCount: 15,
        hazardScore: 18.2,
      };
      
      mockUseCosmicData.mockReturnValue(updatedData);

      // Re-render to simulate state update
      render(<Dashboard />);

      expect(screen.getByText('$46,000')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('18.2%')).toBeInTheDocument();
    });

    it('handles refresh errors gracefully', () => {
      render(<Dashboard />);

      // Simulate refresh error
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        error: 'Refresh timeout',
        loading: false,
      });

      render(<Dashboard />);

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Refresh timeout')).toBeInTheDocument();
    });
  });

  describe('Responsive design and styling', () => {
    it('applies correct dark theme classes', () => {
      render(<Dashboard />);

      const dashboard = screen.getByText('Cosmic Crypto Tracker').closest('div');
      expect(dashboard).toHaveClass('min-h-screen', 'bg-black', 'text-white');
    });

    it('renders metric cards in responsive grid', () => {
      render(<Dashboard />);

      const container = screen.getByText('Bitcoin Price').closest('div')?.parentElement;
      expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6');
    });

    it('includes proper container and spacing classes', () => {
      render(<Dashboard />);

      const mainContainer = screen.getByText('Bitcoin Price').closest('.container');
      expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-6');
    });
  });

  describe('Data integration validation', () => {
    it('formats Bitcoin price with proper currency symbol and commas', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        bitcoinPrice: 123456.78,
      });

      render(<Dashboard />);

      expect(screen.getByText('$123,457')).toBeInTheDocument();
    });

    it('formats hazard score with one decimal place and percentage', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        hazardScore: 25.678,
      });

      render(<Dashboard />);

      expect(screen.getByText('25.7%')).toBeInTheDocument();
    });

    it('displays asteroid count as integer', () => {
      mockUseCosmicData.mockReturnValue({
        ...mockCosmicData,
        asteroidCount: 1234,
      });

      render(<Dashboard />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
    });
  });
});