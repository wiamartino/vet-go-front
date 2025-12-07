import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetService } from '../../../core/services/pet.service';
import { ClientService } from '../../../core/services/client.service';
import { Pet, Client } from '../../../models';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div *ngIf="!isLoading && pet">
        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{{ pet.name }}</h2>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button [routerLink]="['/pets', pet.pet_id, 'edit']" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Edit</button>
            <button (click)="deletePet()" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete</button>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6"><h3 class="text-lg leading-6 font-medium text-gray-900">Pet Information</h3></div>
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Species</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ pet.species }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Breed</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ pet.breed }}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Birth Date</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ pet.birth_date | date }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Owner</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a [routerLink]="['/clients', pet.client_id]" class="text-indigo-600 hover:text-indigo-900" *ngIf="owner">
                    {{ owner.first_name }} {{ owner.last_name }}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PetDetailComponent implements OnInit {
  pet: Pet | null = null;
  owner: Client | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petService: PetService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.petService.getPetById(id).subscribe({
        next: (pet) => {
          this.pet = pet;
          this.clientService.getClientById(pet.client_id).subscribe(client => this.owner = client);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  deletePet(): void {
    if (!this.pet || !confirm('Delete this pet?')) return;
    this.petService.deletePet(this.pet.pet_id!).subscribe({
      next: () => this.router.navigate(['/pets']),
      error: () => alert('Failed to delete pet')
    });
  }
}
