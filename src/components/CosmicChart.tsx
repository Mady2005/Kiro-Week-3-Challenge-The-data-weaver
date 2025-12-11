import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CosmicChartProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

const CosmicChart: React.FC<CosmicChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">Chart will appear when data is loaded</p>
        </div>
      </div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-purple-500/50 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.name === 'Bitcoin Price' 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">7-Day Trend Analysis</h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            yAxisId="bitcoin"
            orientation="left"
            stroke="#10B981"
            fontSize={12}
          />
          <YAxis 
            yAxisId="asteroids"
            orientation="right"
            stroke="#EF4444"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#E5E7EB' }}
          />
          <Line
            yAxisId="bitcoin"
            type="monotone"
            dataKey="bitcoinPrice"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            name="Bitcoin Price"
          />
          <Line
            yAxisId="asteroids"
            type="monotone"
            dataKey="asteroidCount"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            name="Asteroid Count"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CosmicChart;