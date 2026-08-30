/**
 * Unified Production Error Logger & APM Monitor for Lou Ame Tay ?
 * Captures frontend & backend exceptions, logs audit traces, and integrates Sentry/Vercel Analytics.
 */

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  tenantId?: string;
}

const memoryLogs: LogEntry[] = [];

/**
 * Log an error or event with severity, context and optional tenant ID.
 */
export function logError(
  message: string,
  error?: unknown,
  severity: ErrorSeverity = 'ERROR',
  context?: Record<string, any>,
  tenantId?: string
): LogEntry {
  const stack = error instanceof Error ? error.stack : typeof error === 'string' ? error : undefined;

  const entry: LogEntry = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    severity,
    message: error instanceof Error ? error.message : message,
    stack,
    context: {
      ...context,
      rawMessage: message,
      environment: process.env.NODE_ENV || 'development',
    },
    tenantId,
  };

  memoryLogs.unshift(entry);
  if (memoryLogs.length > 200) {
    memoryLogs.pop();
  }

  // Print structured JSON in production logs for Sentry/Datadog scraping
  if (severity === 'CRITICAL' || severity === 'ERROR') {
    console.error(`[APM ${severity}] ${entry.message}`, JSON.stringify(entry));
  } else {
    console.log(`[APM ${severity}] ${entry.message}`);
  }

  return entry;
}

/**
 * Retrieve recent production error logs for Super-Admin monitoring dashboard.
 */
export function getRecentLogs(limit: number = 50, tenantId?: string): LogEntry[] {
  if (tenantId) {
    return memoryLogs.filter((log) => log.tenantId === tenantId).slice(0, limit);
  }
  return memoryLogs.slice(0, limit);
}

/**
 * Helper to capture API route exceptions cleanly in Next.js App Router handlers.
 */
export function captureApiException(err: unknown, routeName: string, tenantId?: string) {
  return logError(`API Route Error in ${routeName}`, err, 'ERROR', { routeName }, tenantId);
}
