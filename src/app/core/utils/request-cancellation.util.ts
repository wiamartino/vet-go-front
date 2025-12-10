import { OnDestroy, Directive } from '@angular/core';
import { Subject, Observable, takeUntil, finalize } from 'rxjs';

/**
 * Base class for components that need request cancellation
 * Automatically cancels all pending requests when component is destroyed
 */
@Directive()
export abstract class CancellableComponent implements OnDestroy {
  protected destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Wrap observable to automatically cancel on component destroy
   */
  protected autoCancel<T>(observable: Observable<T>): Observable<T> {
    return observable.pipe(takeUntil(this.destroy$));
  }

  /**
   * Wrap observable with loading state management and auto-cancel
   */
  protected withLoadingState<T>(
    observable: Observable<T>,
    loadingRef: { loading: boolean }
  ): Observable<T> {
    loadingRef.loading = true;
    return observable.pipe(
      takeUntil(this.destroy$),
      finalize(() => (loadingRef.loading = false))
    );
  }
}

/**
 * Request Cancellation Service
 * Manages request cancellation tokens for fine-grained control
 */
export class RequestCancellation {
  private cancellationTokens = new Map<string, Subject<void>>();

  /**
   * Create a new cancellation token
   */
  createToken(key: string): Subject<void> {
    // Cancel any existing token with the same key
    this.cancel(key);

    const token = new Subject<void>();
    this.cancellationTokens.set(key, token);
    return token;
  }

  /**
   * Cancel requests associated with a token
   */
  cancel(key: string): void {
    const token = this.cancellationTokens.get(key);
    if (token) {
      token.next();
      token.complete();
      this.cancellationTokens.delete(key);
    }
  }

  /**
   * Cancel all requests
   */
  cancelAll(): void {
    this.cancellationTokens.forEach(token => {
      token.next();
      token.complete();
    });
    this.cancellationTokens.clear();
  }

  /**
   * Get cancellation token for a key
   */
  getToken(key: string): Observable<void> | null {
    const token = this.cancellationTokens.get(key);
    return token ? token.asObservable() : null;
  }

  /**
   * Wrap observable with cancellation token
   */
  withCancellation<T>(key: string, observable: Observable<T>): Observable<T> {
    const token = this.createToken(key);
    return observable.pipe(
      takeUntil(token),
      finalize(() => this.cancel(key))
    );
  }
}

/**
 * Utility functions for request cancellation
 */

/**
 * Create an observable that auto-cancels on destroy
 */
export function autoCancellable<T>(
  observable: Observable<T>,
  destroy$: Observable<void>
): Observable<T> {
  return observable.pipe(takeUntil(destroy$));
}

/**
 * Create an observable with timeout and auto-cancel
 */
export function withTimeout<T>(
  observable: Observable<T>,
  timeoutMs: number,
  destroy$: Observable<void>
): Observable<T> {
  return observable.pipe(
    takeUntil(destroy$),
    finalize(() => {
      // Cleanup logic if needed
    })
  );
}

/**
 * Debounced request helper (useful for search)
 */
export function debouncedRequest<T>(
  request: () => Observable<T>,
  debounceMs: number,
  destroy$: Observable<void>
): Observable<T> {
  return new Observable(observer => {
    const timeoutId = setTimeout(() => {
      request()
        .pipe(takeUntil(destroy$))
        .subscribe({
          next: value => observer.next(value),
          error: error => observer.error(error),
          complete: () => observer.complete()
        });
    }, debounceMs);

    // Cleanup on unsubscribe
    return () => clearTimeout(timeoutId);
  });
}
