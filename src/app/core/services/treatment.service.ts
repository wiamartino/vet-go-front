import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Treatment, ApiResponse } from '../../models';
import { BaseStoreService } from './base-store.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class TreatmentService extends BaseStoreService<Treatment[]> {
  private apiUrl = `${environment.apiUrl}/treatments`;
  private treatmentsSubject = new BehaviorSubject<Treatment[]>([]);
  public treatments$ = this.treatmentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    super();
    this.defaultCacheConfig = {
      ttl: 10 * 60 * 1000, // 10 minutes cache for treatments
      enabled: true
    };
  }

  /**
   * Get all treatments
   * GET /api/v1/treatments
   */
  getAllTreatments(forceRefresh = false): Observable<Treatment[]> {
    const cacheKey = 'treatments_all';

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Treatment[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        tap(treatments => {
          this.treatmentsSubject.next(treatments);
          this.setData(treatments);
        })
      );

    this.loadingService.setLoading('treatments_list', true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading('treatments_list', false))
    );
  }

  /**
   * Get treatment by ID
   * GET /api/v1/treatments/{id}
   */
  getTreatmentById(id: number, forceRefresh = false): Observable<Treatment> {
    const cacheKey = `treatment_${id}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Treatment>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));

    this.loadingService.setLoading(`treatment_${id}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 5 * 60 * 1000,
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading(`treatment_${id}`, false))
    );
  }

  /**
   * Create a new treatment
   * POST /api/v1/treatments
   */
  createTreatment(treatment: Treatment): Observable<Treatment> {
    this.loadingService.setLoading('treatment_create', true);

    return this.http.post<ApiResponse<Treatment>>(this.apiUrl, treatment)
      .pipe(
        map(response => response.data!),
        tap(newTreatment => {
          // Invalidate cache
          this.invalidateAllCache();
          
          // Update local state
          const currentTreatments = this.treatmentsSubject.value;
          this.treatmentsSubject.next([...currentTreatments, newTreatment]);
          
          this.loadingService.setLoading('treatment_create', false);
        })
      );
  }

  /**
   * Update an existing treatment
   * PUT /api/v1/treatments/{id}
   */
  updateTreatment(id: number, treatment: Treatment): Observable<Treatment> {
    this.loadingService.setLoading(`treatment_update_${id}`, true);

    return this.http.put<ApiResponse<Treatment>>(`${this.apiUrl}/${id}`, treatment)
      .pipe(
        map(response => response.data!),
        tap(updatedTreatment => {
          // Invalidate cache
          this.invalidateAllCache();
          
          // Update local state
          const currentTreatments = this.treatmentsSubject.value;
          const index = currentTreatments.findIndex(t => t.treatment_id === id);
          if (index !== -1) {
            currentTreatments[index] = updatedTreatment;
            this.treatmentsSubject.next([...currentTreatments]);
          }
          
          this.loadingService.setLoading(`treatment_update_${id}`, false);
        })
      );
  }

  /**
   * Delete a treatment
   * DELETE /api/v1/treatments/{id}
   */
  deleteTreatment(id: number): Observable<void> {
    this.loadingService.setLoading(`treatment_delete_${id}`, true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Invalidate cache
          this.invalidateAllCache();
          
          // Update local state
          const currentTreatments = this.treatmentsSubject.value;
          this.treatmentsSubject.next(currentTreatments.filter(t => t.treatment_id !== id));
          
          this.loadingService.setLoading(`treatment_delete_${id}`, false);
        })
      );
  }

  /**
   * Get current treatments from local state
   */
  getCurrentTreatments(): Treatment[] {
    return this.treatmentsSubject.value;
  }

  /**
   * Search treatments locally
   */
  searchTreatmentsLocally(query: string): Treatment[] {
    const treatments = this.getCurrentTreatments();
    const lowerQuery = query.toLowerCase();
    return treatments.filter(treatment =>
      treatment.name?.toLowerCase().includes(lowerQuery) ||
      treatment.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
