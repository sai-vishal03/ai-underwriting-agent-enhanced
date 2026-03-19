export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(entry);
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    console.error(this.formatMessage('error', message, { ...context, error: error?.message, stack: error?.stack }));
  }

  // Specialized logging for specific metrics
  logMetric(metricName: 'underwriting_count' | 'acceptance_rate' | 'tier_distribution', value: any, context?: Record<string, any>) {
    this.info(`Metric tracked: ${metricName}`, { metric: metricName, value, ...context });
  }

  logApiRequest(method: string, url: string, merchantId?: string, action?: string) {
    this.info(`API Request: ${method} ${url}`, { method, url, merchant_id: merchantId, action });
  }

  logApiError(method: string, url: string, error: Error, merchantId?: string, action?: string) {
    this.error(`API Error: ${method} ${url}`, { method, url, merchant_id: merchantId, action }, error);
  }
}

export const logger = new Logger();
