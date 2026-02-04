/**
 * Structured logger for executive-grade observability
 * Development: console output
 * Production: structured JSON (ready for Sentry/CloudWatch)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  private formatEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry = this.formatEntry(level, message, context, error);

    if (this.isDev) {
      // Development: readable console output
      const prefix = `[${level.toUpperCase()}]`;
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();

      switch (level) {
        case 'debug':
          console.debug(prefix, timestamp, message, context || '', error || '');
          break;
        case 'info':
          console.info(prefix, timestamp, message, context || '');
          break;
        case 'warn':
          console.warn(prefix, timestamp, message, context || '');
          break;
        case 'error':
          console.error(prefix, timestamp, message, context || '', error || '');
          if (error?.stack) {
            console.error(error.stack);
          }
          break;
      }
    } else {
      // Production: structured JSON
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();
