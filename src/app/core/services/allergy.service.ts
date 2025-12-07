import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Allergy, AllergySeverity, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AllergyService {
  private apiUrl = `${environment.apiUrl}/allergies`;

  constructor(private http: HttpClient) {}

  getAllAllergies(): Observable<Allergy[]> {
    return this.http.get<ApiResponse<Allergy[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getAllergyById(id: number): Observable<Allergy> {
    return this.http.get<ApiResponse<Allergy>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getAllergiesByPetId(petId: number): Observable<Allergy[]> {
    return this.http.get<ApiResponse<Allergy[]>>(`${this.apiUrl}?pet_id=${petId}`)
      .pipe(map(response => response.data || []));
  }

  getAllergiesBySeverity(severity: AllergySeverity): Observable<Allergy[]> {
    return this.http.get<ApiResponse<Allergy[]>>(`${this.apiUrl}?severity=${severity}`)
      .pipe(map(response => response.data || []));
  }

  createAllergy(allergy: Allergy): Observable<Allergy> {
    return this.http.post<ApiResponse<Allergy>>(this.apiUrl, allergy)
      .pipe(map(response => response.data!));
  }

  updateAllergy(id: number, allergy: Allergy): Observable<Allergy> {
    return this.http.put<ApiResponse<Allergy>>(`${this.apiUrl}/${id}`, allergy)
      .pipe(map(response => response.data!));
  }

  deleteAllergy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
