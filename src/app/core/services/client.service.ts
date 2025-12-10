import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ApiResponse } from '../../models';
import { BaseStoreService } from './base-store.service';
import { LoadingService } from './loading.service';

/**
 * Client Service
 * 
 * Retry Behavior:
 * - GET requests: Automatically retried on network failures (408, 429, 500, 502, 503, 504)
 * - POST/PUT requests: Retried only if marked as idempotent
 * - DELETE requests: Never retried (safety measure)
 * 
 * All retry behavior is configured via the retry interceptor.
 */

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseStoreService<Client[]> {
  private apiUrl = `${environment.apiUrl}/clients`;
  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    super();
    // Set longer cache for client list (10 minutes)
    this.defaultCacheConfig = {
      ttl: 10 * 60 * 1000,
      enabled: true
    };
  }

  /**
   * Get all clients with caching and state management
   */
  getAllClients(forceRefresh = false): Observable<Client[]> {
    const cacheKey = 'clients_all';

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Client[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        tap(clients => {
          this.clientsSubject.next(clients);
          this.setData(clients);
        })
      );

    this.loadingService.setLoading('clients_list', true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading('clients_list', false))
    );
  }

  /**
   * Get client by ID with caching
   */
  getClientById(id: number, forceRefresh = false): Observable<Client> {
    const cacheKey = `client_${id}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Client>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));

    this.loadingService.setLoading(`client_${id}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 5 * 60 * 1000, // 5 minutes for individual client
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading(`client_${id}`, false))
    );
  }

  /**
   * Create new client and invalidate cache
   */
  createClient(client: Client): Observable<Client> {
    this.loadingService.setLoading('client_create', true);

    return this.http.post<ApiResponse<Client>>(this.apiUrl, client)
      .pipe(
        map(response => response.data!),
        tap(newClient => {
          // Invalidate list cache to force refresh
          this.invalidateCache('clients_all');
          // Update local state
          const currentClients = this.clientsSubject.value;
          this.clientsSubject.next([...currentClients, newClient]);
          this.loadingService.setLoading('client_create', false);
        })
      );
  }

  /**
   * Update client and invalidate related caches
   */
  updateClient(id: number, client: Client): Observable<Client> {
    this.loadingService.setLoading(`client_update_${id}`, true);

    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/${id}`, client)
      .pipe(
        map(response => response.data!),
        tap(updatedClient => {
          // Invalidate caches
          this.invalidateCache('clients_all');
          this.invalidateCache(`client_${id}`);
          // Update local state
          const currentClients = this.clientsSubject.value;
          const index = currentClients.findIndex(c => c.client_id === id);
          if (index !== -1) {
            currentClients[index] = updatedClient;
            this.clientsSubject.next([...currentClients]);
          }
          this.loadingService.setLoading(`client_update_${id}`, false);
        })
      );
  }

  /**
   * Delete client and invalidate caches
   * Note: DELETE requests should not be retried automatically (handled by interceptor)
   */
  deleteClient(id: number): Observable<void> {
    this.loadingService.setLoading(`client_delete_${id}`, true);

    // DELETE operations are automatically skipped by retry interceptor for safety
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Invalidate caches
          this.invalidateCache('clients_all');
          this.invalidateCache(`client_${id}`);
          // Update local state
          const currentClients = this.clientsSubject.value;
          this.clientsSubject.next(currentClients.filter(c => c.client_id !== id));
          this.loadingService.setLoading(`client_delete_${id}`, false);
        })
      );
  }

  /**
   * Get current clients from local state
   */
  getCurrentClients(): Client[] {
    return this.clientsSubject.value;
  }

  /**
   * Search clients locally (from cached data)
   */
  searchClientsLocally(query: string): Client[] {
    const clients = this.getCurrentClients();
    const lowerQuery = query.toLowerCase();
    return clients.filter(client =>
      client.first_name?.toLowerCase().includes(lowerQuery) ||
      client.last_name?.toLowerCase().includes(lowerQuery) ||
      client.email?.toLowerCase().includes(lowerQuery) ||
      client.phone?.toLowerCase().includes(lowerQuery)
    );
  }
}
