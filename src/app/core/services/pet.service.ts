import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pet, ApiResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = `${environment.apiUrl}/pets`;

  constructor(private http: HttpClient) {}

  getAllPets(): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(this.apiUrl)
      .pipe(map(response => response.data || []));
  }

  getPetById(id: number): Observable<Pet> {
    return this.http.get<ApiResponse<Pet>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));
  }

  getPetsByClientId(clientId: number): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(`${this.apiUrl}?client_id=${clientId}`)
      .pipe(map(response => response.data || []));
  }

  createPet(pet: Pet): Observable<Pet> {
    return this.http.post<ApiResponse<Pet>>(this.apiUrl, pet)
      .pipe(map(response => response.data!));
  }

  updatePet(id: number, pet: Pet): Observable<Pet> {
    return this.http.put<ApiResponse<Pet>>(`${this.apiUrl}/${id}`, pet)
      .pipe(map(response => response.data!));
  }

  deletePet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
