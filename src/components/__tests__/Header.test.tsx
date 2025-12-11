import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

describe('Header', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    mockOnRefresh.mockClear();
  });

  it('renders title and refresh button', () => {
    render(<Header onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('Cosmic Crypto Tracker')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh data/i })).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<Header onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows "Refresh" text when not loading', () => {
    render(<Header onRefresh={mockOnRefresh} loading={false} />);
    
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument();
  });

  it('shows "Refreshing..." text when loading', () => {
    render(<Header onRefresh={mockOnRefresh} loading={true} />);
    
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
  });

  it('disables refresh button when loading', () => {
    render(<Header onRefresh={mockOnRefresh} loading={true} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    expect(refreshButton).toBeDisabled();
  });

  it('enables refresh button when not loading', () => {
    render(<Header onRefresh={mockOnRefresh} loading={false} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    expect(refreshButton).not.toBeDisabled();
  });

  it('does not call onRefresh when button is disabled', () => {
    render(<Header onRefresh={mockOnRefresh} loading={true} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh data/i });
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it('has proper header styling', () => {
    render(<Header onRefresh={mockOnRefresh} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass(
      'bg-gray-900',
      'border-b',
      'border-purple-500/30',
      'px-6',
      'py-4',
      'mb-8'
    );
  });

  it('has proper title styling', () => {
    render(<Header onRefresh={mockOnRefresh} />);
    
    const title = screen.getByText('Cosmic Crypto Tracker');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-white');
  });
});