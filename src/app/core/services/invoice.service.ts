import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, ApiResponse } from '../../models';
import { BaseStoreService } from './base-store.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService extends BaseStoreService<Invoice[]> {
  private apiUrl = `${environment.apiUrl}/invoices`;
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoicesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    super();
    this.defaultCacheConfig = {
      ttl: 5 * 60 * 1000, // 5 minutes cache
      enabled: true
    };
  }

  /**
   * Get all invoices
   * GET /api/v1/invoices
   */
  getAllInvoices(forceRefresh = false): Observable<Invoice[]> {
    const cacheKey = 'invoices_all';

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Invoice[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        tap(invoices => {
          this.invoicesSubject.next(invoices);
          this.setData(invoices);
        })
      );

    this.loadingService.setLoading('invoices_list', true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading('invoices_list', false))
    );
  }

  /**
   * Get invoice by ID
   * GET /api/v1/invoices/{id}
   */
  getInvoiceById(id: number, forceRefresh = false): Observable<Invoice> {
    const cacheKey = `invoice_${id}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));

    this.loadingService.setLoading(`invoice_${id}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 3 * 60 * 1000,
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading(`invoice_${id}`, false))
    );
  }

  /**
   * Get invoices by appointment ID
   * GET /api/v1/invoices?appointment_id={id}
   */
  getInvoicesByAppointmentId(appointmentId: number, forceRefresh = false): Observable<Invoice[]> {
    const cacheKey = `invoices_appointment_${appointmentId}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}?appointment_id=${appointmentId}`)
      .pipe(map(response => response.data || []));

    this.loadingService.setLoading(`invoices_appointment_${appointmentId}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading(`invoices_appointment_${appointmentId}`, false))
    );
  }

  /**
   * Get invoices by date range
   * GET /api/v1/invoices?start_date={start}&end_date={end}
   */
  getInvoicesByDateRange(startDate: string, endDate: string, forceRefresh = false): Observable<Invoice[]> {
    const cacheKey = `invoices_range_${startDate}_${endDate}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const params = `?start_date=${startDate}&end_date=${endDate}`;
    const request = this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}${params}`)
      .pipe(map(response => response.data || []));

    this.loadingService.setLoading('invoices_range', true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 2 * 60 * 1000,
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading('invoices_range', false))
    );
  }

  /**
   * Create a new invoice
   * POST /api/v1/invoices
   */
  createInvoice(invoice: Invoice): Observable<Invoice> {
    this.loadingService.setLoading('invoice_create', true);

    return this.http.post<ApiResponse<Invoice>>(this.apiUrl, invoice)
      .pipe(
        map(response => response.data!),
        tap(newInvoice => {
          // Invalidate cache
          this.invalidateAllCache();
          
          // Update local state
          const currentInvoices = this.invoicesSubject.value;
          this.invoicesSubject.next([...currentInvoices, newInvoice]);
          
          this.loadingService.setLoading('invoice_create', false);
        })
      );
  }

  /**
   * Update an existing invoice
   * PUT /api/v1/invoices/{id}
   */
  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    this.loadingService.setLoading(`invoice_update_${id}`, true);

    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, invoice)
      .pipe(
        map(response => response.data!),
        tap(updatedInvoice => {
          // Invalidate cache
          this.invalidateAllCache();
          
          // Update local state
          const currentInvoices = this.invoicesSubject.value;
          const index = currentInvoices.findIndex(i => i.invoice_id === id);
          if (index !== -1) {
            currentInvoices[index] = updatedInvoice;
            this.invoicesSubject.next([...currentInvoices]);
          }
          
          this.loadingService.setLoading(`invoice_update_${id}`, false);
        })
      );
  }

  /**
   * Delete an invoice
   * DELETE /api/v1/invoices/{id}
   */
  deleteInvoice(id: number): Observable<void> {
    this.loadingService.setLoading(`invoice_delete_${id}`, true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Invalidate cache
          this.invalidateAllCache();
          
          // Update local state
          const currentInvoices = this.invoicesSubject.value;
          this.invoicesSubject.next(currentInvoices.filter(i => i.invoice_id !== id));
          
          this.loadingService.setLoading(`invoice_delete_${id}`, false);
        })
      );
  }

  /**
   * Get current invoices from local state
   */
  getCurrentInvoices(): Invoice[] {
    return this.invoicesSubject.value;
  }

  /**
   * Calculate total amount from all invoices
   */
  getTotalAmount(): number {
    return this.getCurrentInvoices()
      .reduce((sum, invoice) => sum + invoice.total, 0);
  }
}
