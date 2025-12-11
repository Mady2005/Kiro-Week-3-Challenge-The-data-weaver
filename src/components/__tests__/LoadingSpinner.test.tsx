import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    
    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinnerDiv = screen.getByRole('status').firstChild;
    expect(spinnerDiv).toHaveClass('w-4', 'h-4');
  });

  it('renders with medium size (default)', () => {
    render(<LoadingSpinner size="md" />);
    
    const spinnerDiv = screen.getByRole('status').firstChild;
    expect(spinnerDiv).toHaveClass('w-8', 'h-8');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinnerDiv = screen.getByRole('status').firstChild;
    expect(spinnerDiv).toHaveClass('w-12', 'h-12');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has proper styling classes', () => {
    render(<LoadingSpinner />);
    
    const spinnerDiv = screen.getByRole('status').firstChild;
    expect(spinnerDiv).toHaveClass(
      'border-4',
      'border-purple-200',
      'border-t-purple-500',
      'rounded-full',
      'animate-spin'
    );
  });
});