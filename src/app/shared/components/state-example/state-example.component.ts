import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../../core/services/client.service';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Example component demonstrating state management usage
 * Shows how to use the new centralized state with caching and loading states
 */
@Component({
  selector: 'app-state-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Global loading indicator -->
      <div *ngIf="loadingService.isAnyLoading()" class="global-loading">
        Loading...
      </div>

      <!-- Section with specific loading state -->
      <div class="section">
        <h2>Clients</h2>
        
        <!-- Show loading for this specific operation -->
        <div *ngIf="isLoadingClients" class="loading-spinner">
          Loading clients...
        </div>

        <!-- Show error if any -->
        <div *ngIf="clientError" class="error-message">
          {{ clientError }}
        </div>

        <!-- Show data -->
        <div *ngIf="!isLoadingClients && !clientError">
          <ul>
            <li *ngFor="let client of clients">
              {{ client.first_name }} {{ client.last_name }}
            </li>
          </ul>
        </div>

        <!-- Refresh button -->
        <button (click)="refreshClients()">
          Refresh (Force)
        </button>

        <!-- Load cached button -->
        <button (click)="loadClients()">
          Load (Use Cache)
        </button>
      </div>

      <!-- Show state from observable -->
      <div class="section">
        <h2>Client State</h2>
        <pre>{{ clientState$ | async | json }}</pre>
      </div>

      <!-- Search example using local cache -->
      <div class="section">
        <h2>Search Locally</h2>
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          (input)="searchLocally()"
          placeholder="Search clients..."
        >
        <ul>
          <li *ngFor="let client of searchResults">
            {{ client.first_name }} {{ client.last_name }}
          </li>
        </ul>
      </div>
    </div>
  `
})
export class StateExampleComponent implements OnInit, OnDestroy {
  clients: any[] = [];
  searchResults: any[] = [];
  searchQuery = '';
  isLoadingClients = false;
  clientError: string | null = null;
  
  // Observable from service state
  clientState$;

  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    public loadingService: LoadingService
  ) {
    // Initialize in constructor
    this.clientState$ = this.clientService.state$;
  }

  ngOnInit(): void {
    // Method 1: Subscribe to specific loading state
    this.loadingService.getLoading$('clients_list')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoadingClients = loading;
      });

    // Method 2: Subscribe to clients observable from service
    this.clientService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => {
        this.clients = clients;
      });

    // Method 3: Subscribe to full state (includes data, loading, error)
    this.clientService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.error) {
          this.clientError = state.error;
        }
      });

    // Initial load (will use cache if available)
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load clients - uses cache if available
   */
  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        console.log('Clients loaded from cache or API:', clients.length);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  /**
   * Force refresh - bypasses cache
   */
  refreshClients(): void {
    this.clientService.getAllClients(true).subscribe({
      next: (clients) => {
        console.log('Clients refreshed from API:', clients.length);
      },
      error: (error) => {
        console.error('Error refreshing clients:', error);
      }
    });
  }

  /**
   * Search locally using cached data
   */
  searchLocally(): void {
    if (this.searchQuery.trim()) {
      this.searchResults = this.clientService.searchClientsLocally(this.searchQuery);
    } else {
      this.searchResults = [];
    }
  }

  /**
   * Get current clients without subscription
   */
  getCurrentData(): void {
    const clients = this.clientService.getCurrentClients();
    console.log('Current cached clients:', clients.length);
  }
}
