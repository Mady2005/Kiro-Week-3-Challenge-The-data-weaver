import React from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ onRefresh, loading = false }) => {
  return (
    <header className="bg-gray-900 border-b border-purple-500/30 px-6 py-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-purple-400">
            <Zap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Cosmic Crypto Tracker
          </h1>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg
            bg-purple-600 hover:bg-purple-700 
            text-white font-medium
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${loading ? 'cursor-not-allowed' : 'hover:shadow-lg hover:shadow-purple-500/25'}
          `}
          aria-label="Refresh data"
        >
          <RefreshCw 
            size={18} 
            className={loading ? 'animate-spin' : ''} 
          />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;