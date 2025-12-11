import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DollarSign } from 'lucide-react';
import MetricCard from '../MetricCard';

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Bitcoin Price',
    value: 45000,
    icon: DollarSign,
  };

  it('renders with basic props', () => {
    render(<MetricCard {...defaultProps} />);
    
    expect(screen.getByText('Bitcoin Price')).toBeInTheDocument();
    expect(screen.getByText('45,000')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(
      <MetricCard 
        title="Status" 
        value="Active" 
        icon={DollarSign} 
      />
    );
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('formats number values with locale string', () => {
    render(
      <MetricCard 
        title="Large Number" 
        value={1234567} 
        icon={DollarSign} 
      />
    );
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    render(<MetricCard {...defaultProps} loading={true} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Value should not be displayed when loading
    expect(screen.queryByText('45,000')).not.toBeInTheDocument();
  });

  it('does not show loading spinner when loading is false', () => {
    render(<MetricCard {...defaultProps} loading={false} />);
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('45,000')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<MetricCard {...defaultProps} />);
    
    const card = screen.getByText('Bitcoin Price').closest('div');
    expect(card).toHaveClass(
      'bg-gray-900',
      'border',
      'border-purple-500/30',
      'rounded-lg',
      'p-6',
      'shadow-lg'
    );
  });

  it('displays title with proper styling', () => {
    render(<MetricCard {...defaultProps} />);
    
    const title = screen.getByText('Bitcoin Price');
    expect(title).toHaveClass(
      'text-gray-300',
      'text-sm',
      'font-medium',
      'uppercase',
      'tracking-wide'
    );
  });
});