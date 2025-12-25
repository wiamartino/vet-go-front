import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vaccination, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class VaccinationService {
  private apiUrl = `${environment.apiUrl}/vaccinations`;

  constructor(private http: HttpClient) {}

  getAllVaccinations(): Observable<Vaccination[]> {
    return this.http.get<ApiResponse<Vaccination[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getVaccinationById(id: number): Observable<Vaccination> {
    return this.http.get<ApiResponse<Vaccination>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getVaccinationsByPetId(petId: number): Observable<Vaccination[]> {
    return this.http.get<ApiResponse<Vaccination[]>>(`${this.apiUrl}?pet_id=${petId}`)
      .pipe(map(response => response.data || []));
  }

  getDueVaccinations(): Observable<Vaccination[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return this.getAllVaccinations().pipe(
      map(vaccinations => vaccinations.filter(v => {
        const due = new Date(v.next_due_date);
        if (Number.isNaN(due.getTime())) return false;
        return due <= thirtyDaysFromNow;
      }))
    );
  }

  getOverdueVaccinations(): Observable<Vaccination[]> {
    const today = new Date();
    
    return this.getAllVaccinations().pipe(
      map(vaccinations => vaccinations.filter(v => {
        const due = new Date(v.next_due_date);
        if (Number.isNaN(due.getTime())) return false;
        return due < today;
      }))
    );
  }

  createVaccination(vaccination: Vaccination): Observable<Vaccination> {
    return this.http.post<ApiResponse<Vaccination>>(this.apiUrl, vaccination)
      .pipe(map(response => response.data!));
  }

  updateVaccination(id: number, vaccination: Vaccination): Observable<Vaccination> {
    return this.http.put<ApiResponse<Vaccination>>(`${this.apiUrl}/${id}`, vaccination)
      .pipe(map(response => response.data!));
  }

  deleteVaccination(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
