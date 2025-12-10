import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications"
        [class]="getNotificationClass(notification)"
        [@slideIn]
      >
        <div class="notification-content">
          <!-- Icon -->
          <div class="notification-icon">
            <svg *ngIf="notification.type === 'success'" class="icon-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="notification.type === 'error'" class="icon-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="notification.type === 'warning'" class="icon-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg *ngIf="notification.type === 'info'" class="icon-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="notification-body">
            <p *ngIf="notification.title" class="notification-title">{{ notification.title }}</p>
            <p class="notification-message">{{ notification.message }}</p>
            
            <!-- Action button -->
            <button 
              *ngIf="notification.action"
              (click)="onAction(notification)"
              class="notification-action"
            >
              {{ notification.action.label }}
            </button>
          </div>

          <!-- Dismiss button -->
          <button 
            *ngIf="notification.dismissible"
            (click)="dismiss(notification.id)"
            class="notification-dismiss"
            aria-label="Dismiss"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 24rem;
      width: 100%;
      pointer-events: none;
    }

    .notification {
      pointer-events: auto;
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      color: #065f46;
    }

    .notification-error {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
    }

    .notification-warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }

    .notification-info {
      background-color: #dbeafe;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }

    .notification-content {
      display: flex;
      align-items: start;
      gap: 0.75rem;
    }

    .notification-icon {
      flex-shrink: 0;
    }

    .notification-icon svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .icon-success {
      color: #10b981;
    }

    .icon-error {
      color: #ef4444;
    }

    .icon-warning {
      color: #f59e0b;
    }

    .icon-info {
      color: #3b82f6;
    }

    .notification-body {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .notification-action {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      border: 1px solid currentColor;
      background-color: transparent;
      cursor: pointer;
      transition: all 0.2s;
    }

    .notification-action:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .notification-dismiss {
      flex-shrink: 0;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .notification-dismiss:hover {
      opacity: 1;
    }

    .notification-dismiss svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    @media (max-width: 640px) {
      .notification-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getNotificationClass(notification: Notification): string {
    return `notification notification-${notification.type}`;
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  onAction(notification: Notification): void {
    if (notification.action) {
      notification.action.callback();
      this.dismiss(notification.id);
    }
  }
}
