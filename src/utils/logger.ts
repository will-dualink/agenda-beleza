/**
 * Centralized error logging and monitoring
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private listeners: ((entry: LogEntry) => void)[] = [];

  log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    this.logs.push(entry);
    
    // Keep logs under limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(entry));

    // Console output
    this.logToConsole(entry);

    // Send critical errors to backend (optional)
    if (level === LogLevel.CRITICAL) {
      this.sendToBackend(entry).catch(err => console.error('Failed to send critical log:', err));
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  critical(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  getLogs(filter?: { level?: LogLevel; startTime?: Date; endTime?: Date }): LogEntry[] {
    return this.logs.filter(log => {
      if (filter?.level && log.level !== filter.level) return false;
      if (filter?.startTime && new Date(log.timestamp) < filter.startTime) return false;
      if (filter?.endTime && new Date(log.timestamp) > filter.endTime) return false;
      return true;
    });
  }

  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clear(): void {
    this.logs = [];
  }

  private logToConsole(entry: LogEntry): void {
    const style = {
      [LogLevel.DEBUG]: 'color: #666; font-weight: normal;',
      [LogLevel.INFO]: 'color: #0066cc; font-weight: bold;',
      [LogLevel.WARN]: 'color: #ff9900; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #cc0000; font-weight: bold;',
      [LogLevel.CRITICAL]: 'color: #fff; background-color: #cc0000; font-weight: bold; padding: 2px 4px;'
    };

    const logFn = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
      [LogLevel.CRITICAL]: console.error
    }[entry.level];

    logFn(
      `%c[${entry.level}] ${entry.message}`,
      style[entry.level],
      entry.context || '',
      entry.error || ''
    );
  }

  private async sendToBackend(entry: LogEntry): Promise<void> {
    try {
      // Implement backend logging endpoint
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }
}

export const logger = new Logger();
