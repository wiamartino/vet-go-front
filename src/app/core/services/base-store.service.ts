import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  enabled: boolean;
}

/**
 * Retry configuration for HTTP requests
 */
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  idempotent?: boolean;
  skipRetry?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface StoreState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Base Store Service
 * Provides centralized state management with caching capabilities
 */
export abstract class BaseStoreService<T> {
  protected cache = new Map<string, CacheEntry<any>>();
  protected defaultCacheConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes default
    enabled: true
  };

  protected stateSubject = new BehaviorSubject<StoreState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  public state$: Observable<StoreState<T>> = this.stateSubject.asObservable();

  /**
   * Get current state value
   */
  protected get state(): StoreState<T> {
    return this.stateSubject.value;
  }

  /**
   * Update state
   */
  protected setState(partial: Partial<StoreState<T>>): void {
    this.stateSubject.next({
      ...this.state,
      ...partial
    });
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.setState({ error, loading: false });
  }

  /**
   * Set data state
   */
  protected setData(data: T): void {
    this.setState({
      data,
      loading: false,
      error: null,
      lastUpdated: Date.now()
    });
  }

  /**
   * Clear state
   */
  public clearState(): void {
    this.setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }

  /**
   * Check if cache is valid
   */
  protected isCacheValid(key: string, config: CacheConfig = this.defaultCacheConfig): boolean {
    if (!config.enabled) return false;

    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age < config.ttl;
  }

  /**
   * Get cached data
   */
  protected getCachedData<D>(key: string): D | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Set cached data
   */
  protected setCachedData<D>(key: string, data: D): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate specific cache entry
   */
  protected invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache
   */
  public invalidateAllCache(): void {
    this.cache.clear();
  }

  /**
   * Execute request with caching
   */
  protected executeWithCache<D>(
    key: string,
    request: Observable<D>,
    config: CacheConfig = this.defaultCacheConfig,
    retryConfig?: RetryConfig
  ): Observable<D> {
    // Check cache first
    if (this.isCacheValid(key, config)) {
      const cachedData = this.getCachedData<D>(key);
      if (cachedData !== null) {
        return of(cachedData);
      }
    }

    // Execute request and cache result
    // Retry config is handled by retry interceptor via HTTP headers
    return request.pipe(
      tap(data => this.setCachedData(key, data)),
      catchError(error => {
        this.invalidateCache(key);
        return throwError(() => error);
      })
    );
  }

  /**
   * Execute request with loading state
   */
  protected executeWithLoading<D>(
    request: Observable<D>,
    onSuccess?: (data: D) => void,
    onError?: (error: any) => void,
    retryConfig?: RetryConfig
  ): Observable<D> {
    this.setLoading(true);
    this.setError(null);

    // Retry config is handled by retry interceptor via HTTP headers
    return request.pipe(
      tap(data => {
        this.setLoading(false);
        if (onSuccess) onSuccess(data);
      }),
      catchError(error => {
        const errorMessage = error?.error?.message || error?.message || 'An error occurred';
        this.setError(errorMessage);
        if (onError) onError(error);
        return throwError(() => error);
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Get data with caching and loading state
   */
  protected fetchWithCacheAndLoading<D>(
    key: string,
    request: Observable<D>,
    config: CacheConfig = this.defaultCacheConfig,
    retryConfig?: RetryConfig
  ): Observable<D> {
    // Check cache first
    if (this.isCacheValid(key, config)) {
      const cachedData = this.getCachedData<D>(key);
      if (cachedData !== null) {
        return of(cachedData);
      }
    }

    // Execute with loading state
    return this.executeWithLoading(
      request,
      data => this.setCachedData(key, data),
      undefined,
      retryConfig
    );
  }

  /**
   * Helper method to apply retry configuration to HTTP headers
   * Services can use this to configure retry behavior for specific requests
   */
  protected applyRetryConfig(headers: HttpHeaders = new HttpHeaders(), config: RetryConfig): HttpHeaders {
    let updatedHeaders = headers;
    
    if (config.maxRetries !== undefined) {
      updatedHeaders = updatedHeaders.set('X-Retry-Max', config.maxRetries.toString());
    }
    if (config.retryDelay !== undefined) {
      updatedHeaders = updatedHeaders.set('X-Retry-Delay', config.retryDelay.toString());
    }
    if (config.skipRetry) {
      updatedHeaders = updatedHeaders.set('X-No-Retry', 'true');
    }
    if (config.idempotent) {
      updatedHeaders = updatedHeaders.set('X-Idempotent', 'true');
    }
    
    return updatedHeaders;
  }
}
