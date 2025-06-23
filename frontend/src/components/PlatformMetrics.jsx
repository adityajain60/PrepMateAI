import React, { useState, useEffect } from 'react';
import { getPlatformMetrics } from '../services/api';

const PlatformMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await getPlatformMetrics();
      setMetrics(response.data.metrics);
    } catch (err) {
      setError('Failed to load platform metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Metrics</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Metrics</h2>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">
            {formatNumber(metrics?.resumesAnalyzed || 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Resumes Analyzed</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">
            {formatNumber(metrics?.questionsGenerated || 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Questions Generated</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-3xl font-bold text-orange-600">
            {formatNumber(metrics?.totalUsers || 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Users</div>
        </div>
      </div>
      
      {metrics?.lastUpdated && (
        <div className="text-xs text-gray-500 mt-4 text-center">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default PlatformMetrics; 