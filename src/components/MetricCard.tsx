import React from 'react';
import { MetricCardProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  loading = false 
}) => {
  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-purple-400">
          <Icon size={24} />
        </div>
      </div>
      
      <div className="flex items-center">
        {loading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <div className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;