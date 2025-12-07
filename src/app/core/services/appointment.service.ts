import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getAppointmentsByDateRange(startDate: Date, endDate: Date): Observable<Appointment[]> {
    const params = `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}${params}`)
      .pipe(map(response => response.data || []));
  }

  getAppointmentsByVeterinarianId(veterinarianId: number): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}?veterinarian_id=${veterinarianId}`)
      .pipe(map(response => response.data || []));
  }

  getAppointmentsByPetId(petId: number): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}?pet_id=${petId}`)
      .pipe(map(response => response.data || []));
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, appointment)
      .pipe(map(response => response.data!));
  }

  updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, appointment)
      .pipe(map(response => response.data!));
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
