'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

interface AnalyticsData {
  salesOverTime: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    avgOrderValue: number;
    lifetimeValue: number;
    churnRate: number;
    retentionRate: number;
  };
  topStates: Array<{
    state: string;
    customers: number;
    revenue: number;
    growth: number;
  }>;
  productPerformance: Array<{
    product: string;
    views: number;
    addToCart: number;
    purchased: number;
    conversionRate: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    conversion: number;
  }>;
}

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/admin/analytics?days=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No analytics data available</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Date Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-1">New Customers</p>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.customerMetrics.newCustomers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-1">Returning</p>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.customerMetrics.returningCustomers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(analyticsData.customerMetrics.avgOrderValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-1">Lifetime Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(analyticsData.customerMetrics.lifetimeValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-1">Churn Rate</p>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.customerMetrics.churnRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-1">Retention</p>
          <p className="text-2xl font-bold text-gray-900">{analyticsData.customerMetrics.retentionRate}%</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {analyticsData.salesOverTime.map((data, idx) => {
            const maxRevenue = Math.max(...analyticsData.salesOverTime.map(d => d.revenue));
            const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${heightPercentage}%` }}>
                  <div className="text-xs text-white text-center p-1">
                    {formatPrice(data.revenue)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">{data.date}</div>
                <div className="text-xs text-gray-500">{data.orders} orders</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top States */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sales by State</h3>
          </div>
          <div className="p-6">
            {analyticsData.topStates.map((state, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{state.state}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">{state.customers} customers</span>
                    <span className={`ml-2 text-xs ${state.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {state.growth >= 0 ? '+' : ''}{state.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{formatPrice(state.revenue)}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${Math.min((state.revenue / (analyticsData.topStates[0]?.revenue || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-2">Source</th>
                  <th className="pb-2 text-right">Sessions</th>
                  <th className="pb-2 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.trafficSources.map((source, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 text-sm text-gray-900">{source.source}</td>
                    <td className="py-2 text-sm text-right text-gray-600">{source.sessions.toLocaleString()}</td>
                    <td className="py-2 text-sm text-right text-gray-600">{source.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Add to Cart
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchased
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.productPerformance.map((product, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {product.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {product.addToCart.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {product.purchased.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      product.conversionRate > 5
                        ? 'bg-green-100 text-green-800'
                        : product.conversionRate > 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.conversionRate.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}