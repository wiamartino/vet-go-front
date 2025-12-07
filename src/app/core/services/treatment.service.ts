import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Treatment, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TreatmentService {
  private apiUrl = `${environment.apiUrl}/treatments`;

  constructor(private http: HttpClient) {}

  getAllTreatments(): Observable<Treatment[]> {
    return this.http.get<ApiResponse<Treatment[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getTreatmentById(id: number): Observable<Treatment> {
    return this.http.get<ApiResponse<Treatment>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  createTreatment(treatment: Treatment): Observable<Treatment> {
    return this.http.post<ApiResponse<Treatment>>(this.apiUrl, treatment)
      .pipe(map(response => response.data!));
  }

  updateTreatment(id: number, treatment: Treatment): Observable<Treatment> {
    return this.http.put<ApiResponse<Treatment>>(`${this.apiUrl}/${id}`, treatment)
      .pipe(map(response => response.data!));
  }

  deleteTreatment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
