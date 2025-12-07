import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      // Optionally decode token to get user info
      // For now, we just set a flag that user exists
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
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('jwt_token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
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

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return Math.floor(new Date().getTime() / 1000) < expiry;
    } catch (e) {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
