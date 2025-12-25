import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetService } from '../../../core/services/pet.service';
import { ClientService } from '../../../core/services/client.service';
import { Pet, Client } from '../../../models';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Pet' : 'New Pet' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update pet information' : 'Register a new pet' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="petForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Pet Name *</label>
                  <input type="text" id="name" formControlName="name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="name?.invalid && name?.touched" class="mt-1 text-sm text-red-600">Name is required</div>
                </div>

                <div>
                  <label for="species" class="block text-sm font-medium text-gray-700">Species *</label>
                  <select id="species" formControlName="species" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select species</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                  <div *ngIf="species?.invalid && species?.touched" class="mt-1 text-sm text-red-600">Species is required</div>
                </div>

                <div>
                  <label for="breed" class="block text-sm font-medium text-gray-700">Breed *</label>
                  <input type="text" id="breed" formControlName="breed" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="breed?.invalid && breed?.touched" class="mt-1 text-sm text-red-600">Breed is required</div>
                </div>

                <div>
                  <label for="date_of_birth" class="block text-sm font-medium text-gray-700">Birth Date *</label>
                  <input type="date" id="date_of_birth" formControlName="date_of_birth" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="dateOfBirth?.invalid && dateOfBirth?.touched" class="mt-1 text-sm text-red-600">Birth date is required</div>
                </div>

                <div>
                  <label for="client_id" class="block text-sm font-medium text-gray-700">Owner *</label>
                  <select id="client_id" formControlName="client_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select owner</option>
                    <option *ngFor="let client of clients" [value]="client.client_id">{{ client.first_name }} {{ client.last_name }}</option>
                  </select>
                  <div *ngIf="clientId?.invalid && clientId?.touched" class="mt-1 text-sm text-red-600">Owner is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/pets" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="petForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PetFormComponent implements OnInit {
  petForm: FormGroup;
  clients: Client[] = [];
  isEditMode = false;
  petId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private petService: PetService,
    private clientService: ClientService
  ) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      breed: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      client_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClients();
    const id = this.route.snapshot.paramMap.get('id');
    const queryClientId = this.route.snapshot.queryParamMap.get('client_id');
    
    if (queryClientId) {
      this.petForm.patchValue({ client_id: Number(queryClientId) });
    }
    
    if (id) {
      this.isEditMode = true;
      this.petId = Number(id);
      this.loadPet(this.petId);
    }
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(clients => this.clients = clients);
  }

  loadPet(id: number): void {
    this.petService.getPetById(id).subscribe(pet => this.petForm.patchValue(pet));
  }

  onSubmit(): void {
    if (this.petForm.invalid) return;
    this.isLoading = true;
    const petData: Pet = {
      ...this.petForm.value,
      client_id: Number(this.petForm.value.client_id)
    };
    const operation = this.isEditMode
      ? this.petService.updatePet(this.petId!, petData)
      : this.petService.createPet(petData);

    operation.subscribe({
      next: (pet) => this.router.navigate(['/pets', pet.pet_id]),
      error: () => { this.errorMessage = 'Failed to save pet'; this.isLoading = false; }
    });
  }

  get name() { return this.petForm.get('name'); }
  get species() { return this.petForm.get('species'); }
  get breed() { return this.petForm.get('breed'); }
  get dateOfBirth() { return this.petForm.get('date_of_birth'); }
  get clientId() { return this.petForm.get('client_id'); }
}
