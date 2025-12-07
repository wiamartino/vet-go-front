import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalRecord, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private apiUrl = `${environment.apiUrl}/medical-records`;

  constructor(private http: HttpClient) {}

  getAllMedicalRecords(): Observable<MedicalRecord[]> {
    return this.http.get<ApiResponse<MedicalRecord[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getMedicalRecordById(id: number): Observable<MedicalRecord> {
    return this.http.get<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getMedicalRecordsByPetId(petId: number): Observable<MedicalRecord[]> {
    return this.http.get<ApiResponse<MedicalRecord[]>>(`${this.apiUrl}?pet_id=${petId}`)
      .pipe(map(response => response.data || []));
  }

  createMedicalRecord(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.post<ApiResponse<MedicalRecord>>(this.apiUrl, record)
      .pipe(map(response => response.data!));
  }

  updateMedicalRecord(id: number, record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`, record)
      .pipe(map(response => response.data!));
  }

  deleteMedicalRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
