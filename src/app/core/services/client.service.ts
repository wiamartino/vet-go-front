import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<Client[]> {
    return this.http.get<ApiResponse<Client[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<ApiResponse<Client>>(this.apiUrl, client)
      .pipe(map(response => response.data!));
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/${id}`, client)
      .pipe(map(response => response.data!));
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
