import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<ApiResponse<Invoice[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getInvoicesByAppointmentId(appointmentId: number): Observable<Invoice[]> {
    return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}?appointment_id=${appointmentId}`)
      .pipe(map(response => response.data || []));
  }

  getInvoicesByDateRange(startDate: Date, endDate: Date): Observable<Invoice[]> {
    const params = `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
    return this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}${params}`)
      .pipe(map(response => response.data || []));
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(this.apiUrl, invoice)
      .pipe(map(response => response.data!));
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, invoice)
      .pipe(map(response => response.data!));
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
