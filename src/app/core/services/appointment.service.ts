import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, ApiResponse } from '../../models';
import { BaseStoreService } from './base-store.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends BaseStoreService<Appointment[]> {
  private apiUrl = `${environment.apiUrl}/appointments`;
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    super();
    // Shorter cache for appointments (5 minutes) since they change frequently
    this.defaultCacheConfig = {
      ttl: 5 * 60 * 1000,
      enabled: true
    };
  }

  /**
   * Get all appointments with caching
   */
  getAllAppointments(forceRefresh = false): Observable<Appointment[]> {
    const cacheKey = 'appointments_all';

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Appointment[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        tap(appointments => {
          this.appointmentsSubject.next(appointments);
          this.setData(appointments);
        })
      );

    this.loadingService.setLoading('appointments_list', true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading('appointments_list', false))
    );
  }

  /**
   * Get appointment by ID with caching
   */
  getAppointmentById(id: number, forceRefresh = false): Observable<Appointment> {
    const cacheKey = `appointment_${id}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));

    this.loadingService.setLoading(`appointment_${id}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 3 * 60 * 1000, // 3 minutes
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading(`appointment_${id}`, false))
    );
  }

  /**
   * Get appointments by date range with caching
   */
  getAppointmentsByDateRange(startDate: Date, endDate: Date, forceRefresh = false): Observable<Appointment[]> {
    const cacheKey = `appointments_range_${startDate.toISOString()}_${endDate.toISOString()}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const params = `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
    const request = this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}${params}`)
      .pipe(map(response => response.data || []));

    this.loadingService.setLoading('appointments_range', true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 2 * 60 * 1000, // 2 minutes for date ranges
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading('appointments_range', false))
    );
  }

  /**
   * Get appointments by veterinarian ID with caching
   */
  getAppointmentsByVeterinarianId(veterinarianId: number, forceRefresh = false): Observable<Appointment[]> {
    const cacheKey = `appointments_vet_${veterinarianId}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}?veterinarian_id=${veterinarianId}`)
      .pipe(map(response => response.data || []));

    this.loadingService.setLoading(`appointments_vet_${veterinarianId}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading(`appointments_vet_${veterinarianId}`, false))
    );
  }

  /**
   * Get appointments by pet ID with caching
   */
  getAppointmentsByPetId(petId: number, forceRefresh = false): Observable<Appointment[]> {
    const cacheKey = `appointments_pet_${petId}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}?pet_id=${petId}`)
      .pipe(map(response => response.data || []));

    this.loadingService.setLoading(`appointments_pet_${petId}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading(`appointments_pet_${petId}`, false))
    );
  }

  /**
   * Create appointment and invalidate caches
   */
  createAppointment(appointment: Appointment): Observable<Appointment> {
    this.loadingService.setLoading('appointment_create', true);

    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, appointment)
      .pipe(
        map(response => response.data!),
        tap(newAppointment => {
          // Invalidate all appointment-related caches
          this.invalidateAllCache();
          
          // Update local state
          const currentAppointments = this.appointmentsSubject.value;
          this.appointmentsSubject.next([...currentAppointments, newAppointment]);
          
          this.loadingService.setLoading('appointment_create', false);
        })
      );
  }

  /**
   * Update appointment and invalidate caches
   */
  updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
    this.loadingService.setLoading(`appointment_update_${id}`, true);

    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, appointment)
      .pipe(
        map(response => response.data!),
        tap(updatedAppointment => {
          // Invalidate all appointment-related caches
          this.invalidateAllCache();
          
          // Update local state
          const currentAppointments = this.appointmentsSubject.value;
          const index = currentAppointments.findIndex(a => a.appointment_id === id);
          if (index !== -1) {
            currentAppointments[index] = updatedAppointment;
            this.appointmentsSubject.next([...currentAppointments]);
          }
          
          this.loadingService.setLoading(`appointment_update_${id}`, false);
        })
      );
  }

  /**
   * Delete appointment and invalidate caches
   */
  deleteAppointment(id: number): Observable<void> {
    this.loadingService.setLoading(`appointment_delete_${id}`, true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Invalidate all appointment-related caches
          this.invalidateAllCache();
          
          // Update local state
          const currentAppointments = this.appointmentsSubject.value;
          this.appointmentsSubject.next(currentAppointments.filter(a => a.appointment_id !== id));
          
          this.loadingService.setLoading(`appointment_delete_${id}`, false);
        })
      );
  }

  /**
   * Get current appointments from local state
   */
  getCurrentAppointments(): Appointment[] {
    return this.appointmentsSubject.value;
  }

  /**
   * Get today's appointments from local state
   */
  getTodayAppointmentsLocally(): Appointment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getCurrentAppointments().filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });
  }
}
