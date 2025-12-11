import React from 'react';
import { DollarSign, Zap, Shield } from 'lucide-react';
import { useCosmicData } from '../hooks/useCosmicData';
import Header from './Header';
import MetricCard from './MetricCard';
import CosmicChart from './CosmicChart';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const {
    bitcoinPrice,
    asteroidCount,
    hazardScore,
    chartData,
    loading,
    error,
    refresh,
  } = useCosmicData();

  // Error boundary display
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onRefresh={refresh} loading={loading} />
        <div className="container mx-auto px-6">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <div className="text-red-400 mb-4">
              <Shield size={48} className="mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-red-300 mb-2">
              Error Loading Data
            </h2>
            <p className="text-red-200 mb-4">
              {error}
            </p>
            <button
              onClick={refresh}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onRefresh={refresh} loading={loading} />
      
      <div className="container mx-auto px-6">
        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Bitcoin Price"
            value={bitcoinPrice ? `$${bitcoinPrice.toLocaleString()}` : 'Loading...'}
            icon={DollarSign}
            loading={loading}
          />
          
          <MetricCard
            title="Asteroids Today"
            value={asteroidCount}
            icon={Zap}
            loading={loading}
          />
          
          <MetricCard
            title="Hazard Score"
            value={`${hazardScore.toFixed(1)}%`}
            icon={Shield}
            loading={loading}
          />
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <CosmicChart data={chartData} loading={loading} />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8 border-t border-purple-500/30">
          <p>
            Data provided by CoinGecko API and NASA NeoWs API
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;