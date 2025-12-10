import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PetService } from '../../../core/services/pet.service';
import { ClientService } from '../../../core/services/client.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Pet, Client } from '../../../models';
import { forkJoin, Subject, takeUntil, combineLatest } from 'rxjs';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Pets</h1>
          <p class="mt-2 text-sm text-gray-700">A list of all registered pets.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a routerLink="/pets/new" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            Add Pet
          </a>
        </div>
      </div>

      <div class="mt-6">
        <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search pets..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
      </div>

      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div *ngIf="!isLoading" class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Species</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Breed</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Owner</th>
                    <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr *ngFor="let pet of filteredPets" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ pet.name }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ pet.species }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ pet.breed }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ getOwnerName(pet.client_id) }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a [routerLink]="['/pets', pet.pet_id]" class="text-indigo-600 hover:text-indigo-900 mr-4">View</a>
                      <a [routerLink]="['/pets', pet.pet_id, 'edit']" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</a>
                      <button (click)="deletePet(pet.pet_id!)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredPets.length === 0">
                    <td colspan="5" class="py-8 text-center text-sm text-gray-500">No pets found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PetListComponent implements OnInit {
  pets: Pet[] = [];
  filteredPets: Pet[] = [];
  clients: Client[] = [];
  clientMap = new Map<number, string>();
  searchTerm = '';
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private petService: PetService,
    private clientService: ClientService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Subscribe to pets observable
    this.petService.pets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pets => {
        this.pets = pets;
        this.onSearch();
      });

    // Subscribe to clients observable
    this.clientService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => {
        this.clients = clients;
        this.clientMap.clear();
        clients.forEach(c => {
          this.clientMap.set(c.client_id!, `${c.first_name} ${c.last_name}`);
        });
      });

    // Monitor loading states
    combineLatest([
      this.loadingService.getLoading$('pets_list'),
      this.loadingService.getLoading$('clients_list')
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([petsLoading, clientsLoading]) => {
        this.isLoading = petsLoading || clientsLoading;
      });

    // Load data (uses cache if available)
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(forceRefresh = false): void {
    // Both services will manage their own loading states
    forkJoin({
      pets: this.petService.getAllPets(forceRefresh),
      clients: this.clientService.getAllClients(forceRefresh)
    }).subscribe({
      error: (error) => {
        console.error('Error loading data:', error);
      }
    });
  }

  refresh(): void {
    // Force refresh bypasses cache for both services
    this.loadData(true);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPets = this.pets;
      return;
    }
    
    // Use service's local search for better performance
    this.filteredPets = this.petService.searchPetsLocally(this.searchTerm);
  }

  getOwnerName(clientId: number): string {
    return this.clientMap.get(clientId) || 'Unknown';
  }

  deletePet(id: number): void {
    if (!confirm('Are you sure you want to delete this pet?')) return;
    
    this.petService.deletePet(id).subscribe({
      next: () => {
        // State is automatically updated by the service
      },
      error: (error) => {
        alert('Failed to delete pet');
        console.error(error);
      }
    });
  }
}
