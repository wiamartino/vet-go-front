import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medication, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private apiUrl = `${environment.apiUrl}/medications`;

  constructor(private http: HttpClient) {}

  getAllMedications(): Observable<Medication[]> {
    return this.http.get<ApiResponse<Medication[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getMedicationById(id: number): Observable<Medication> {
    return this.http.get<ApiResponse<Medication>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  createMedication(medication: Medication): Observable<Medication> {
    return this.http.post<ApiResponse<Medication>>(this.apiUrl, medication)
      .pipe(map(response => response.data!));
  }

  updateMedication(id: number, medication: Medication): Observable<Medication> {
    return this.http.put<ApiResponse<Medication>>(`${this.apiUrl}/${id}`, medication)
      .pipe(map(response => response.data!));
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
