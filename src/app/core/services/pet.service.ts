import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pet, ApiResponse } from '../../models';
import { BaseStoreService } from './base-store.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class PetService extends BaseStoreService<Pet[]> {
  private apiUrl = `${environment.apiUrl}/pets`;
  private petsSubject = new BehaviorSubject<Pet[]>([]);
  public pets$ = this.petsSubject.asObservable();

  // Cache for pets by client
  private petsByClientCache = new Map<number, BehaviorSubject<Pet[]>>();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    super();
    this.defaultCacheConfig = {
      ttl: 10 * 60 * 1000, // 10 minutes
      enabled: true
    };
  }

  /**
   * Get all pets with caching and state management
   */
  getAllPets(forceRefresh = false): Observable<Pet[]> {
    const cacheKey = 'pets_all';

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Pet[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        tap(pets => {
          this.petsSubject.next(pets);
          this.setData(pets);
        })
      );

    this.loadingService.setLoading('pets_list', true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading('pets_list', false))
    );
  }

  /**
   * Get pet by ID with caching
   */
  getPetById(id: number, forceRefresh = false): Observable<Pet> {
    const cacheKey = `pet_${id}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    const request = this.http.get<ApiResponse<Pet>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data!));

    this.loadingService.setLoading(`pet_${id}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request, {
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: true
    }).pipe(
      tap(() => this.loadingService.setLoading(`pet_${id}`, false))
    );
  }

  /**
   * Get pets by client ID with caching
   */
  getPetsByClientId(clientId: number, forceRefresh = false): Observable<Pet[]> {
    const cacheKey = `pets_client_${clientId}`;

    if (forceRefresh) {
      this.invalidateCache(cacheKey);
    }

    // Get or create subject for this client
    if (!this.petsByClientCache.has(clientId)) {
      this.petsByClientCache.set(clientId, new BehaviorSubject<Pet[]>([]));
    }

    const request = this.http.get<ApiResponse<Pet[]>>(`${this.apiUrl}?client_id=${clientId}`)
      .pipe(
        map(response => response.data || []),
        tap(pets => {
          const subject = this.petsByClientCache.get(clientId);
          if (subject) {
            subject.next(pets);
          }
        })
      );

    this.loadingService.setLoading(`pets_client_${clientId}`, true);

    return this.fetchWithCacheAndLoading(cacheKey, request).pipe(
      tap(() => this.loadingService.setLoading(`pets_client_${clientId}`, false))
    );
  }

  /**
   * Get observable for pets by client ID
   */
  getPetsByClient$(clientId: number): Observable<Pet[]> {
    if (!this.petsByClientCache.has(clientId)) {
      this.petsByClientCache.set(clientId, new BehaviorSubject<Pet[]>([]));
    }
    return this.petsByClientCache.get(clientId)!.asObservable();
  }

  /**
   * Create new pet and invalidate caches
   */
  createPet(pet: Pet): Observable<Pet> {
    this.loadingService.setLoading('pet_create', true);

    return this.http.post<ApiResponse<Pet>>(this.apiUrl, pet)
      .pipe(
        map(response => response.data!),
        tap(newPet => {
          // Invalidate caches
          this.invalidateCache('pets_all');
          if (newPet.client_id) {
            this.invalidateCache(`pets_client_${newPet.client_id}`);
          }
          
          // Update local state
          const currentPets = this.petsSubject.value;
          this.petsSubject.next([...currentPets, newPet]);

          // Update client-specific cache
          if (newPet.client_id && this.petsByClientCache.has(newPet.client_id)) {
            const subject = this.petsByClientCache.get(newPet.client_id)!;
            subject.next([...subject.value, newPet]);
          }

          this.loadingService.setLoading('pet_create', false);
        })
      );
  }

  /**
   * Update pet and invalidate related caches
   */
  updatePet(id: number, pet: Pet): Observable<Pet> {
    this.loadingService.setLoading(`pet_update_${id}`, true);

    return this.http.put<ApiResponse<Pet>>(`${this.apiUrl}/${id}`, pet)
      .pipe(
        map(response => response.data!),
        tap(updatedPet => {
          // Invalidate caches
          this.invalidateCache('pets_all');
          this.invalidateCache(`pet_${id}`);
          if (updatedPet.client_id) {
            this.invalidateCache(`pets_client_${updatedPet.client_id}`);
          }

          // Update local state
          const currentPets = this.petsSubject.value;
          const index = currentPets.findIndex(p => p.pet_id === id);
          if (index !== -1) {
            currentPets[index] = updatedPet;
            this.petsSubject.next([...currentPets]);
          }

          // Update client-specific cache
          if (updatedPet.client_id && this.petsByClientCache.has(updatedPet.client_id)) {
            const subject = this.petsByClientCache.get(updatedPet.client_id)!;
            const clientPets = subject.value;
            const clientIndex = clientPets.findIndex(p => p.pet_id === id);
            if (clientIndex !== -1) {
              clientPets[clientIndex] = updatedPet;
              subject.next([...clientPets]);
            }
          }

          this.loadingService.setLoading(`pet_update_${id}`, false);
        })
      );
  }

  /**
   * Delete pet and invalidate caches
   */
  deletePet(id: number): Observable<void> {
    // Get pet before deletion to know client_id
    const petToDelete = this.petsSubject.value.find(p => p.pet_id === id);

    this.loadingService.setLoading(`pet_delete_${id}`, true);

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Invalidate caches
          this.invalidateCache('pets_all');
          this.invalidateCache(`pet_${id}`);
          if (petToDelete?.client_id) {
            this.invalidateCache(`pets_client_${petToDelete.client_id}`);
          }

          // Update local state
          const currentPets = this.petsSubject.value;
          this.petsSubject.next(currentPets.filter(p => p.pet_id !== id));

          // Update client-specific cache
          if (petToDelete?.client_id && this.petsByClientCache.has(petToDelete.client_id)) {
            const subject = this.petsByClientCache.get(petToDelete.client_id)!;
            subject.next(subject.value.filter(p => p.pet_id !== id));
          }

          this.loadingService.setLoading(`pet_delete_${id}`, false);
        })
      );
  }

  /**
   * Get current pets from local state
   */
  getCurrentPets(): Pet[] {
    return this.petsSubject.value;
  }

  /**
   * Search pets locally (from cached data)
   */
  searchPetsLocally(query: string): Pet[] {
    const pets = this.getCurrentPets();
    const lowerQuery = query.toLowerCase();
    return pets.filter(pet =>
      pet.name?.toLowerCase().includes(lowerQuery) ||
      pet.species?.toLowerCase().includes(lowerQuery) ||
      pet.breed?.toLowerCase().includes(lowerQuery)
    );
  }
}
