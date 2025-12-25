'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Order System Logs</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded ${
                  autoRefresh 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                {autoRefresh ? '⟳ Auto-Refresh ON' : '⟳ Auto-Refresh OFF'}
              </button>
              <button
                onClick={() => logger.downloadLogs()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                📥 Download Logs
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all logs?')) {
                    logger.clearLogs();
                    loadLogs();
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                🗑️ Clear Logs
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${
                filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1 rounded ${
                filter === 'error' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Errors ({logs.filter(l => l.level === 'error').length})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1 rounded ${
                filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Warnings ({logs.filter(l => l.level === 'warning').length})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-3 py-1 rounded ${
                filter === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Info ({logs.filter(l => l.level === 'info').length})
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No logs found. Try making a purchase to generate logs.
              </div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-3 items-center mb-1">
                        <span className="font-bold text-xs uppercase">{log.level}</span>
                        <span className="font-semibold">{log.component}</span>
                        <span className="text-gray-600">→</span>
                        <span>{log.action}</span>
                      </div>
                      {log.data && (
                        <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                      {log.error && (
                        <div className="text-xs bg-red-50 p-2 rounded mt-2">
                          <div className="font-semibold text-red-700">Error: {log.error.message}</div>
                          {log.error.stack && (
                            <pre className="text-xs mt-1 text-red-600">{log.error.stack}</pre>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 ml-4">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">How to Use:</h2>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Keep this page open while testing orders</li>
              <li>Auto-refresh will update logs every second</li>
              <li>Look for red ERROR entries to identify issues</li>
              <li>Download logs to share for debugging</li>
              <li>Check the data field for request/response details</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}