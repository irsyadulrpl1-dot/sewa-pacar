/**
 * Global Error Handler
 * Centralized error handling and logging
 */

import { toast } from "sonner";
import { ApiError } from "@/services/api";

export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
  timestamp: string;
}

class ErrorHandler {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  /**
   * Log an error or message
   */
  log(level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging based on level
    switch (level) {
      case LogLevel.INFO:
        console.info(`[INFO] ${message}`, context || "");
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${message}`, context || "", error || "");
        break;
      case LogLevel.ERROR:
        console.error(`[ERROR] ${message}`, context || "", error || "");
        break;
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: unknown, defaultMessage = "Terjadi kesalahan"): string {
    const apiError = error instanceof ApiError ? error : new ApiError(String(error));

    let userMessage = defaultMessage;

    // Map error codes to user-friendly messages
    switch (apiError.code) {
      case "PGRST116":
        userMessage = "Data tidak ditemukan";
        break;
      case "23505":
        userMessage = "Data sudah ada";
        break;
      case "23503":
        userMessage = "Data tidak valid";
        break;
      case "42501":
        userMessage = "Tidak memiliki izin untuk melakukan aksi ini";
        break;
      case "42P01":
        userMessage = "Tabel belum dibuat. Silakan hubungi admin.";
        break;
      default:
        if (apiError.message) {
          userMessage = apiError.message;
        }
    }

    this.log(LogLevel.ERROR, userMessage, apiError, {
      code: apiError.code,
      statusCode: apiError.statusCode,
    });

    return userMessage;
  }

  /**
   * Show error toast to user
   */
  showError(error: unknown, defaultMessage = "Terjadi kesalahan") {
    const message = this.handleApiError(error, defaultMessage);
    toast.error(message);
  }

  /**
   * Show success toast
   */
  showSuccess(message: string) {
    toast.success(message);
    this.log(LogLevel.INFO, message);
  }

  /**
   * Show warning toast
   */
  showWarning(message: string) {
    toast.warning(message);
    this.log(LogLevel.WARN, message);
  }

  /**
   * Get recent logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Wrapper for async functions with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    errorHandler.showError(error, errorMessage);
    return null;
  }
}

/**
 * Wrapper for async functions that throw errors
 */
export async function withErrorHandlingThrow<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = errorHandler.handleApiError(error, errorMessage);
    throw new Error(message);
  }
}

