import { HttpInterceptorFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError, mergeMap } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // Initial delay in milliseconds
  retryableStatuses: number[];
  exponentialBackoff: boolean;
  maxDelay: number; // Maximum delay for exponential backoff
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Request Timeout, Too Many Requests, Server Errors
  exponentialBackoff: true,
  maxDelay: 30000 // 30 seconds max delay
};

/**
 * Retry Interceptor
 * Automatically retries failed HTTP requests with exponential backoff
 */
export const retryInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const notificationService = inject(NotificationService);

  // Check if request has custom retry config
  const retryConfig = getRetryConfig(req);
  
  // Skip retry for certain request types
  if (shouldSkipRetry(req)) {
    return next(req);
  }

  let retryCount = 0;

  return next(req).pipe(
    retry({
      count: retryConfig.maxRetries,
      delay: (error: HttpErrorResponse, retryAttempt: number) => {
        // Only retry on retryable status codes
        if (!isRetryable(error, retryConfig)) {
          throw error;
        }

        retryCount = retryAttempt;

        // Calculate delay with exponential backoff
        const delay = calculateRetryDelay(
          retryAttempt,
          retryConfig.retryDelay,
          retryConfig.exponentialBackoff,
          retryConfig.maxDelay
        );

        console.log(
          `Retrying request (attempt ${retryAttempt}/${retryConfig.maxRetries}) after ${delay}ms:`,
          req.url
        );

        // Show notification for retries (only on second attempt and after)
        if (retryAttempt > 1) {
          notificationService.info(
            `Retrying request... (attempt ${retryAttempt}/${retryConfig.maxRetries})`,
            'Connection Issue',
            2000
          );
        }

        return timer(delay);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // All retries exhausted or non-retryable error
      if (retryCount >= retryConfig.maxRetries) {
        console.error(
          `Request failed after ${retryConfig.maxRetries} retries:`,
          req.url,
          error
        );
      }
      return throwError(() => error);
    })
  ) as Observable<HttpEvent<unknown>>;
};

/**
 * Get retry configuration from request headers
 */
function getRetryConfig(req: any): RetryConfig {
  const config = { ...DEFAULT_RETRY_CONFIG };

  // Check for custom retry headers
  if (req.headers.has('X-Retry-Max')) {
    config.maxRetries = parseInt(req.headers.get('X-Retry-Max'), 10);
  }
  if (req.headers.has('X-Retry-Delay')) {
    config.retryDelay = parseInt(req.headers.get('X-Retry-Delay'), 10);
  }
  if (req.headers.has('X-Retry-Exponential')) {
    config.exponentialBackoff = req.headers.get('X-Retry-Exponential') === 'true';
  }

  return config;
}

/**
 * Determine if request should skip retry logic
 */
function shouldSkipRetry(req: any): boolean {
  // Skip retry for certain request types
  if (req.headers.has('X-No-Retry')) {
    return true;
  }

  // Skip retry for authentication endpoints (handled separately)
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/refresh')) {
    return true;
  }

  // Skip retry for DELETE requests (not idempotent by default)
  if (req.method === 'DELETE') {
    return true;
  }

  // Skip retry for POST requests that are not idempotent
  // (unless explicitly marked as safe to retry)
  if (req.method === 'POST' && !req.headers.has('X-Idempotent')) {
    return true;
  }

  return false;
}

/**
 * Check if error is retryable
 */
function isRetryable(error: HttpErrorResponse, config: RetryConfig): boolean {
  // Network errors (status 0) are retryable
  if (error.status === 0) {
    return true;
  }

  // Check if status code is in retryable list
  return config.retryableStatuses.includes(error.status);
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(
  retryAttempt: number,
  baseDelay: number,
  exponentialBackoff: boolean,
  maxDelay: number
): number {
  if (!exponentialBackoff) {
    return baseDelay;
  }

  // Exponential backoff: delay = baseDelay * 2^(retryAttempt - 1)
  // Plus random jitter to prevent thundering herd
  const exponentialDelay = baseDelay * Math.pow(2, retryAttempt - 1);
  const jitter = Math.random() * 1000; // 0-1000ms jitter
  const delay = Math.min(exponentialDelay + jitter, maxDelay);

  return Math.floor(delay);
}

/**
 * Helper function to create retry headers for requests
 */
export function withRetryConfig(config: Partial<RetryConfig>): { [key: string]: string } {
  const headers: { [key: string]: string } = {};

  if (config.maxRetries !== undefined) {
    headers['X-Retry-Max'] = config.maxRetries.toString();
  }
  if (config.retryDelay !== undefined) {
    headers['X-Retry-Delay'] = config.retryDelay.toString();
  }
  if (config.exponentialBackoff !== undefined) {
    headers['X-Retry-Exponential'] = config.exponentialBackoff.toString();
  }

  return headers;
}

/**
 * Helper to mark request as idempotent (safe to retry POST requests)
 */
export function markAsIdempotent(): { [key: string]: string } {
  return { 'X-Idempotent': 'true' };
}

/**
 * Helper to disable retry for specific request
 */
export function disableRetry(): { [key: string]: string } {
  return { 'X-No-Retry': 'true' };
}
