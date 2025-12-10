import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Notification Service
 * Manages toast notifications and user feedback throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private defaultDuration = 5000; // 5 seconds

  /**
   * Get observable of all active notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Show success notification
   */
  success(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'success',
      message,
      title: title || 'Success',
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Show error notification
   */
  error(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'error',
      message,
      title: title || 'Error',
      duration: duration || 8000, // Longer duration for errors
      dismissible: true
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'warning',
      message,
      title: title || 'Warning',
      duration: duration || 6000
    });
  }

  /**
   * Show info notification
   */
  info(message: string, title?: string, duration?: number): string {
    return this.show({
      type: 'info',
      message,
      title: title || 'Info',
      duration: duration || this.defaultDuration
    });
  }

  /**
   * Show notification with custom configuration
   */
  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || this.defaultDuration,
      dismissible: notification.dismissible !== false
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, newNotification]);

    // Auto-dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newNotification.duration);
    }

    return id;
  }

  /**
   * Dismiss specific notification
   */
  dismiss(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications$.next([]);
  }

  /**
   * Show notification with action button
   */
  showWithAction(
    message: string,
    actionLabel: string,
    actionCallback: () => void,
    type: NotificationType = 'info',
    title?: string
  ): string {
    return this.show({
      type,
      message,
      title,
      duration: 0, // Don't auto-dismiss with action
      dismissible: true,
      action: {
        label: actionLabel,
        callback: actionCallback
      }
    });
  }

  /**
   * Handle API error and show appropriate notification
   */
  handleError(error: any, customMessage?: string): void {
    let message = customMessage || 'An unexpected error occurred';

    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Handle specific HTTP status codes
    if (error?.status) {
      switch (error.status) {
        case 400:
          message = customMessage || error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Your session has expired. Please log in again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = customMessage || 'The requested resource was not found.';
          break;
        case 409:
          message = error.error?.message || 'A conflict occurred. The resource may already exist.';
          break;
        case 422:
          message = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 500:
          message = 'A server error occurred. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
      }
    }

    this.error(message);
  }

  /**
   * Show loading notification (doesn't auto-dismiss)
   */
  loading(message: string = 'Loading...'): string {
    return this.show({
      type: 'info',
      message,
      duration: 0,
      dismissible: false
    });
  }

  /**
   * Generate unique ID for notification
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get count of active notifications
   */
  getNotificationCount(): number {
    return this.notifications$.value.length;
  }

  /**
   * Check if there are any active notifications
   */
  hasNotifications(): boolean {
    return this.notifications$.value.length > 0;
  }
}
