interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warning' | 'debug';
  component: string;
  action: string;
  data?: any;
  error?: any;
}

class OrderLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private addLog(level: LogEntry['level'], component: string, action: string, data?: any, error?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      action,
      data,
      error: error ? {
        message: error.message || String(error),
        stack: error.stack,
        ...error
      } : undefined
    };

    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Store in localStorage
    try {
      localStorage.setItem('orderLogs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save logs to localStorage:', e);
    }

    // Console output with styling
    const styles = {
      info: 'color: #3b82f6',
      error: 'color: #ef4444; font-weight: bold',
      warning: 'color: #f59e0b',
      debug: 'color: #6b7280'
    };

    console.log(
      `%c[${entry.timestamp}] [${level.toUpperCase()}] ${component} - ${action}`,
      styles[level],
      data || '',
      error || ''
    );
  }

  info(component: string, action: string, data?: any) {
    this.addLog('info', component, action, data);
  }

  error(component: string, action: string, error?: any, data?: any) {
    this.addLog('error', component, action, data, error);
  }

  warning(component: string, action: string, data?: any) {
    this.addLog('warning', component, action, data);
  }

  debug(component: string, action: string, data?: any) {
    this.addLog('debug', component, action, data);
  }

  getLogs(): LogEntry[] {
    // Try to load from localStorage first
    try {
      const stored = localStorage.getItem('orderLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load logs from localStorage:', e);
    }
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('orderLogs');
  }

  downloadLogs() {
    const logsData = {
      exportDate: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const logger = new OrderLogger();