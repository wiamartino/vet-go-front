import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Client } from '../../../models';
import { CancellableComponent } from '../../../core/utils/request-cancellation.util';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent extends CancellableComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private clientService: ClientService,
    private loadingService: LoadingService
  ) {
    super();
  }

  ngOnInit(): void {
    // Subscribe to clients observable for real-time updates (auto-cancelled on destroy)
    this.autoCancel(this.clientService.clients$)
      .subscribe(clients => {
        this.clients = clients;
        this.onSearch(); // Re-apply search filter
      });

    // Subscribe to loading state (auto-cancelled on destroy)
    this.autoCancel(this.loadingService.getLoading$('clients_list'))
      .subscribe(loading => this.isLoading = loading);

    // Subscribe to error state (auto-cancelled on destroy)
    this.autoCancel(this.clientService.state$)
      .subscribe(state => {
        if (state.error) {
          this.errorMessage = state.error;
        }
      });

    // Load clients (uses cache if available)
    this.loadClients();
  }
  loadClients(forceRefresh = false): void {
    this.errorMessage = '';
    this.clientService.getAllClients(forceRefresh).subscribe({
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  refresh(): void {
    // Force refresh bypasses cache
    this.loadClients(true);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClients = this.clients;
      return;
    }

    // Use the service's local search for better performance
    this.filteredClients = this.clientService.searchClientsLocally(this.searchTerm);
  }

  deleteClient(id: number): void {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    this.clientService.deleteClient(id).subscribe({
      next: () => {
        // State is automatically updated by the service
        // No need to manually filter the array
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete client';
        console.error('Error deleting client:', error);
      }
    });
  }
}
