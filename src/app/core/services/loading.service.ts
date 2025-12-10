import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  [key: string]: boolean;
}

/**
 * Global Loading State Service
 * Manages loading states across the application
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({});
  public loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  /**
   * Get current loading state
   */
  private get state(): LoadingState {
    return this.loadingSubject.value;
  }

  /**
   * Set loading state for a specific key
   */
  setLoading(key: string, loading: boolean): void {
    const currentState = this.state;
    
    if (loading) {
      this.loadingSubject.next({
        ...currentState,
        [key]: true
      });
    } else {
      const newState = { ...currentState };
      delete newState[key];
      this.loadingSubject.next(newState);
    }
  }

  /**
   * Check if specific key is loading
   */
  isLoading(key: string): boolean {
    return this.state[key] === true;
  }

  /**
   * Check if any operation is loading
   */
  isAnyLoading(): boolean {
    return Object.keys(this.state).length > 0;
  }

  /**
   * Get observable for specific loading key
   */
  getLoading$(key: string): Observable<boolean> {
    return new Observable(observer => {
      const subscription = this.loading$.subscribe(state => {
        observer.next(state[key] === true);
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingSubject.next({});
  }

  /**
   * Execute operation with loading state
   */
  withLoading<T>(key: string, operation: Promise<T> | Observable<T>): Promise<T> | Observable<T> {
    this.setLoading(key, true);

    if (operation instanceof Promise) {
      return operation.finally(() => this.setLoading(key, false));
    } else {
      // It's an Observable
      return new Observable(observer => {
        const subscription = operation.subscribe({
          next: value => observer.next(value),
          error: err => {
            this.setLoading(key, false);
            observer.error(err);
          },
          complete: () => {
            this.setLoading(key, false);
            observer.complete();
          }
        });
        return () => subscription.unsubscribe();
      }) as any;
    }
  }
}
