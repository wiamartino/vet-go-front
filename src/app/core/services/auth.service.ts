import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, switchMap, timer } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = environment.authUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  private refreshTokenTimeout?: any;
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      // Decode token to get user info
      const user = this.getUserFromToken(token);
      if (user) {
        this.currentUserSubject.next(user);
      }
      // Start token refresh timer
      this.startTokenRefreshTimer();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.status === 'success' && response.data.token) {
            this.setToken(response.data.token);
            if (response.data.user) {
              this.currentUserSubject.next(response.data.user);
            }
            // Start token refresh timer
            this.startTokenRefreshTimer();
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.status === 'success' && response.data.token) {
            this.setToken(response.data.token);
            if (response.data.user) {
              this.currentUserSubject.next(response.data.user);
            }
            // Start token refresh timer
            this.startTokenRefreshTimer();
          }
        })
      );
  }

  logout(): void {
    this.stopTokenRefreshTimer();
    if (this.isBrowser) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Refresh the access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing = true;

    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, { 
      refresh_token: refreshToken 
    }).pipe(
      tap(response => {
        if (response.status === 'success' && response.data.token) {
          this.setToken(response.data.token);
          if (response.data.refresh_token) {
            this.setRefreshToken(response.data.refresh_token);
          }
          if (response.data.user) {
            this.currentUserSubject.next(response.data.user);
          }
          // Restart refresh timer with new token
          this.startTokenRefreshTimer();
        }
        this.isRefreshing = false;
      }),
      catchError(error => {
        this.isRefreshing = false;
        // If refresh fails, logout user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('jwt_token', token);
    }
  }

  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('refresh_token', token);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;
      
      const expiry = payload.exp;
      const now = Math.floor(new Date().getTime() / 1000);
      return now < expiry;
    } catch (e) {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if token refresh is in progress
   */
  isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  /**
   * Get user info from token
   */
  private getUserFromToken(token: string): User | null {
    try {
      const payload = this.decodeToken(token);
      if (payload && payload.user) {
        return payload.user;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get token expiration time in milliseconds
   */
  private getTokenExpirationTime(token: string): number | null {
    try {
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        return payload.exp * 1000; // Convert to milliseconds
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Start automatic token refresh timer
   * Refreshes token 5 minutes before expiration
   */
  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();

    const token = this.getToken();
    if (!token) return;

    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) return;

    const now = Date.now();
    const refreshTime = expirationTime - (5 * 60 * 1000); // 5 minutes before expiration
    const timeout = refreshTime - now;

    // Only set timer if there's time left
    if (timeout > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe({
          error: (error) => {
            console.error('Token refresh failed:', error);
            // Logout if refresh fails
            this.logout();
          }
        });
      }, timeout);
    } else {
      // Token is about to expire or already expired, try to refresh immediately
      this.refreshToken().subscribe({
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.logout();
        }
      });
    }
  }

  /**
   * Stop token refresh timer
   */
  private stopTokenRefreshTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = undefined;
    }
  }
}
