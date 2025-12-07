import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Veterinarian, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VeterinarianService {
  private apiUrl = `${environment.apiUrl}/veterinarians`;

  constructor(private http: HttpClient) {}

  getAllVeterinarians(): Observable<Veterinarian[]> {
    return this.http.get<ApiResponse<Veterinarian[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getVeterinarianById(id: number): Observable<Veterinarian> {
    return this.http.get<ApiResponse<Veterinarian>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  createVeterinarian(veterinarian: Veterinarian): Observable<Veterinarian> {
    return this.http.post<ApiResponse<Veterinarian>>(this.apiUrl, veterinarian)
      .pipe(map(response => response.data!));
  }

  updateVeterinarian(id: number, veterinarian: Veterinarian): Observable<Veterinarian> {
    return this.http.put<ApiResponse<Veterinarian>>(`${this.apiUrl}/${id}`, veterinarian)
      .pipe(map(response => response.data!));
  }

  deleteVeterinarian(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Legacy methods for backward compatibility
  getVeterinarians(): Observable<Veterinarian[]> {
    return this.getAllVeterinarians();
  }

  getVeterinarian(id: number): Observable<Veterinarian> {
    return this.getVeterinarianById(id);
  }
}