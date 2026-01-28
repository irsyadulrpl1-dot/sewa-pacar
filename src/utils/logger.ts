/**
 * Logger Utility
 * Structured logging for debugging and monitoring
 */

import { LogLevel, errorHandler } from "./errorHandler";

interface LoggerContext {
  userId?: string;
  action?: string;
  component?: string;
  [key: string]: unknown;
}

class Logger {
  /**
   * Log info message
   */
  info(message: string, context?: LoggerContext) {
    errorHandler.log(LogLevel.INFO, message, undefined, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LoggerContext) {
    errorHandler.log(LogLevel.WARN, message, undefined, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LoggerContext) {
    errorHandler.log(LogLevel.ERROR, message, error, context);
  }

  /**
   * Log user action
   */
  action(action: string, userId?: string, details?: Record<string, unknown>) {
    this.info(`User action: ${action}`, {
      action,
      userId,
      ...details,
    });
  }

  /**
   * Log API call
   */
  apiCall(method: string, endpoint: string, statusCode?: number, error?: Error) {
    const context: LoggerContext = {
      method,
      endpoint,
      statusCode,
    };

    if (error) {
      this.error(`API call failed: ${method} ${endpoint}`, error, context);
    } else {
      this.info(`API call: ${method} ${endpoint}`, context);
    }
  }

  /**
   * Log component render
   */
  componentRender(componentName: string, props?: Record<string, unknown>) {
    this.info(`Component rendered: ${componentName}`, {
      component: componentName,
      ...props,
    });
  }
}

export const logger = new Logger();

