import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Queue for requests waiting for token refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Auth Interceptor
 * Adds JWT token to requests and handles token refresh on 401 errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Skip auth header for auth endpoints
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh')) {
    return next(req);
  }

  // Add auth token to request
  const token = authService.getToken();
  if (token) {
    req = addToken(req, token);
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - try to refresh token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handle401Error(req, next, authService);
      }
      
      // Let error interceptor handle other errors
      return throwError(() => error);
    })
  );
};

/**
 * Add authorization token to request
 */
function addToken(request: HttpRequest<unknown>, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Handle 401 Unauthorized error by refreshing token
 */
function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        const newToken = response.data?.token;
        
        if (newToken) {
          refreshTokenSubject.next(newToken);
          // Retry original request with new token
          return next(addToken(request, newToken));
        }
        
        // If no token in response, logout
        authService.logout();
        return throwError(() => new Error('Token refresh failed'));
      }),
      catchError((error) => {
        isRefreshing = false;
        // Refresh failed, logout user
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    // Wait for token refresh to complete, then retry request
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token!));
      })
    );
  }
}
