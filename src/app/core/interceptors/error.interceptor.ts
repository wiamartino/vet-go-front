import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

/**
 * Global Error Interceptor
 * Handles HTTP errors globally and provides user feedback
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different types of errors
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        console.error('Client-side error:', error.error.message);
        notificationService.error(
          'A network error occurred. Please check your connection and try again.',
          'Connection Error'
        );
      } else {
        // Server-side error
        console.error(`Server error ${error.status}:`, error.error);

        // Handle specific HTTP status codes
        switch (error.status) {
          case 401:
            // Unauthorized - logout and redirect to login
            handleUnauthorized(authService, router, notificationService);
            break;

          case 403:
            // Forbidden
            notificationService.error(
              'You do not have permission to perform this action.',
              'Access Denied'
            );
            break;

          case 404:
            // Not found - only show notification if it's not a silent request
            if (!req.headers.has('X-Silent-Error')) {
              notificationService.error(
                'The requested resource was not found.',
                'Not Found'
              );
            }
            break;

          case 409:
            // Conflict
            const conflictMessage = error.error?.message || 'A conflict occurred.';
            notificationService.warning(conflictMessage, 'Conflict');
            break;

          case 422:
            // Validation error
            handleValidationError(error, notificationService);
            break;

          case 500:
            // Internal server error
            notificationService.error(
              'An internal server error occurred. Our team has been notified.',
              'Server Error'
            );
            break;

          case 503:
            // Service unavailable
            notificationService.error(
              'The service is temporarily unavailable. Please try again later.',
              'Service Unavailable'
            );
            break;

          case 0:
            // Network error (server not reachable)
            notificationService.error(
              'Unable to connect to the server. Please check your internet connection.',
              'Connection Failed'
            );
            break;

          default:
            // Generic error
            const message = error.error?.message || 'An unexpected error occurred.';
            notificationService.error(message, 'Error');
        }
      }

      // Re-throw the error for further handling if needed
      return throwError(() => error);
    })
  );
};

/**
 * Handle 401 Unauthorized errors
 */
function handleUnauthorized(
  authService: AuthService,
  router: Router,
  notificationService: NotificationService
): void {
  // Clear authentication
  authService.logout();

  // Show notification
  notificationService.warning(
    'Your session has expired. Please log in again.',
    'Session Expired'
  );

  // Redirect to login
  router.navigate(['/login'], {
    queryParams: { returnUrl: router.url }
  });
}

/**
 * Handle 422 Validation errors
 */
function handleValidationError(
  error: HttpErrorResponse,
  notificationService: NotificationService
): void {
  if (error.error?.errors && typeof error.error.errors === 'object') {
    // Multiple validation errors
    const errors = error.error.errors;
    const errorMessages = Object.keys(errors)
      .map(key => `${key}: ${errors[key]}`)
      .join(', ');
    
    notificationService.error(
      errorMessages,
      'Validation Failed',
      10000 // Longer duration for validation errors
    );
  } else {
    // Single validation error
    const message = error.error?.message || 'Validation failed. Please check your input.';
    notificationService.error(message, 'Validation Failed');
  }
}
