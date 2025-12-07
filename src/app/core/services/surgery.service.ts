import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Surgery, SurgeryStatus, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class SurgeryService {
  private apiUrl = `${environment.apiUrl}/surgeries`;

  constructor(private http: HttpClient) {}

  getAllSurgeries(): Observable<Surgery[]> {
    return this.http.get<ApiResponse<Surgery[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getSurgeryById(id: number): Observable<Surgery> {
    return this.http.get<ApiResponse<Surgery>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getSurgeriesByPetId(petId: number): Observable<Surgery[]> {
    return this.http.get<ApiResponse<Surgery[]>>(`${this.apiUrl}?pet_id=${petId}`)
      .pipe(map(response => response.data || []));
  }

  getSurgeriesByStatus(status: SurgeryStatus): Observable<Surgery[]> {
    return this.http.get<ApiResponse<Surgery[]>>(`${this.apiUrl}?status=${status}`)
      .pipe(map(response => response.data || []));
  }

  createSurgery(surgery: Surgery): Observable<Surgery> {
    return this.http.post<ApiResponse<Surgery>>(this.apiUrl, surgery)
      .pipe(map(response => response.data!));
  }

  updateSurgery(id: number, surgery: Surgery): Observable<Surgery> {
    return this.http.put<ApiResponse<Surgery>>(`${this.apiUrl}/${id}`, surgery)
      .pipe(map(response => response.data!));
  }

  updateSurgeryStatus(id: number, status: SurgeryStatus): Observable<Surgery> {
    return this.http.patch<ApiResponse<Surgery>>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map(response => response.data!));
  }

  deleteSurgery(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  canTransitionStatus(currentStatus: SurgeryStatus, newStatus: SurgeryStatus): boolean {
    const validTransitions: Record<SurgeryStatus, SurgeryStatus[]> = {
      'scheduled': ['in_progress', 'completed'],
      'in_progress': ['completed'],
      'completed': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
