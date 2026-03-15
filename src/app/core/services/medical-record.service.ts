import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalRecord, ApiResponse } from '../../models';
import { BaseStoreService } from './base-store.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService extends BaseStoreService<MedicalRecord[]> {
  private apiUrl = `${environment.apiUrl}/medical-records`;
  private petsApiUrl = `${environment.apiUrl}/pets`;
  private medicalRecordsSubject = new BehaviorSubject<MedicalRecord[]>([]);
  public medicalRecords$ = this.medicalRecordsSubject.asObservable();

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
   * Get all medical records
   * GET /api/v1/medical-records
   */
  getAllMedicalRecords(forceRefresh = false): Observable<MedicalRecord[]> {
    const cacheKey = 'medical_records_all';

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<MedicalRecord[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        tap(records => {
          this.medicalRecordsSubject.next(records);
          this.setData(records);
        })
      );

    this.loadingService.setLoading('medical_records_list', true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading('medical_records_list', false))
    );
  }

  /**
   * Get medical record by ID
   * GET /api/v1/medical-records/{id}
   */
  getMedicalRecordById(id: number, forceRefresh = false): Observable<MedicalRecord> {
    const cacheKey = `medical_record_${id}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));

    this.loadingService.setLoading(`medical_record_${id}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 3 * 60 * 1000,
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading(`medical_record_${id}`, false))
    );
  }

  /**
   * Get medical records by pet ID
   * GET /api/v1/pets/{id}/medical-records
   */
  getMedicalRecordsByPetId(petId: number, forceRefresh = false): Observable<MedicalRecord[]> {
    const cacheKey = `medical_records_pet_${petId}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<MedicalRecord[]>>(`${this.petsApiUrl}/${petId}/medical-records`)
      .pipe(map(response => response.data || []));

    this.loadingService.setLoading(`medical_records_pet_${petId}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading(`medical_records_pet_${petId}`, false))
    );
  }

  /**
   * Create a new medical record
   * POST /api/v1/medical-records
   */
  createMedicalRecord(record: MedicalRecord): Observable<MedicalRecord> {
    this.loadingService.setLoading('medical_record_create', true);

    return this.http.post<ApiResponse<MedicalRecord>>(this.apiUrl, record)
      .pipe(
        map(response => response.data!),
        tap(newRecord => {
          // Invalidate related caches
          this.invalidateAllCache();
          
          // Update local state
          const currentRecords = this.medicalRecordsSubject.value;
          this.medicalRecordsSubject.next([...currentRecords, newRecord]);
          
          this.loadingService.setLoading('medical_record_create', false);
        })
      );
  }

  /**
   * Update an existing medical record
   * PUT /api/v1/medical-records/{id}
   */
  updateMedicalRecord(id: number, record: MedicalRecord): Observable<MedicalRecord> {
    this.loadingService.setLoading(`medical_record_update_${id}`, true);

    return this.http.put<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`, record)
      .pipe(
        map(response => response.data!),
        tap(updatedRecord => {
          // Invalidate related caches
          this.invalidateAllCache();
          
          // Update local state
          const currentRecords = this.medicalRecordsSubject.value;
          const index = currentRecords.findIndex(r => r.medical_record_id === id);
          if (index !== -1) {
            currentRecords[index] = updatedRecord;
            this.medicalRecordsSubject.next([...currentRecords]);
          }
          
          this.loadingService.setLoading(`medical_record_update_${id}`, false);
        })
      );
  }

  /**
   * Delete a medical record
   * DELETE /api/v1/medical-records/{id}
   */
  deleteMedicalRecord(id: number): Observable<void> {
    this.loadingService.setLoading(`medical_record_delete_${id}`, true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Invalidate related caches
          this.invalidateAllCache();
          
          // Update local state
          const currentRecords = this.medicalRecordsSubject.value;
          this.medicalRecordsSubject.next(currentRecords.filter(r => r.medical_record_id !== id));
          
          this.loadingService.setLoading(`medical_record_delete_${id}`, false);
        })
      );
  }

  /**
   * Get current medical records from local state
   */
  getCurrentMedicalRecords(): MedicalRecord[] {
    return this.medicalRecordsSubject.value;
  }
}
