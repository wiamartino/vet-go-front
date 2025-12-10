import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VaccinationService } from '../../../core/services/vaccination.service';
import { PetService } from '../../../core/services/pet.service';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { Vaccination, Pet, Veterinarian } from '../../../models';

@Component({
  selector: 'app-vaccination-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Vaccination' : 'Record Vaccination' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update vaccination record' : 'Record a new vaccination for a pet' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="vaccinationForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div>
                  <label for="pet_id" class="block text-sm font-medium text-gray-700">Pet *</label>
                  <select id="pet_id" formControlName="pet_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select pet</option>
                    <option *ngFor="let pet of pets" [value]="pet.pet_id">{{ pet.name }} ({{ pet.species }})</option>
                  </select>
                  <div *ngIf="petId?.invalid && petId?.touched" class="mt-1 text-sm text-red-600">Pet is required</div>
                </div>

                <div>
                  <label for="veterinarian_id" class="block text-sm font-medium text-gray-700">Veterinarian *</label>
                  <select id="veterinarian_id" formControlName="veterinarian_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select veterinarian</option>
                    <option *ngFor="let vet of veterinarians" [value]="vet.veterinarian_id">Dr. {{ vet.first_name }} {{ vet.last_name }}</option>
                  </select>
                  <div *ngIf="veterinarianId?.invalid && veterinarianId?.touched" class="mt-1 text-sm text-red-600">Veterinarian is required</div>
                </div>

                <div>
                  <label for="vaccine_name" class="block text-sm font-medium text-gray-700">Vaccine Name *</label>
                  <select id="vaccine_name" formControlName="vaccine_name" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select vaccine</option>
                    <option value="Rabies">Rabies</option>
                    <option value="DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)">DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)</option>
                    <option value="Bordetella">Bordetella (Kennel Cough)</option>
                    <option value="Leptospirosis">Leptospirosis</option>
                    <option value="Lyme Disease">Lyme Disease</option>
                    <option value="FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)">FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)</option>
                    <option value="FeLV (Feline Leukemia)">FeLV (Feline Leukemia)</option>
                    <option value="Other">Other</option>
                  </select>
                  <div *ngIf="vaccineName?.invalid && vaccineName?.touched" class="mt-1 text-sm text-red-600">Vaccine name is required</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="date_administered" class="block text-sm font-medium text-gray-700">Date Administered *</label>
                    <input type="date" id="date_administered" formControlName="date_administered" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="dateAdministered?.invalid && dateAdministered?.touched" class="mt-1 text-sm text-red-600">Date is required</div>
                  </div>

                  <div>
                    <label for="next_due_date" class="block text-sm font-medium text-gray-700">Next Due Date *</label>
                    <input type="date" id="next_due_date" formControlName="next_due_date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="nextDueDate?.invalid && nextDueDate?.touched" class="mt-1 text-sm text-red-600">Next due date is required</div>
                  </div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/vaccinations" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="vaccinationForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Record') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class VaccinationFormComponent implements OnInit {
  vaccinationForm: FormGroup;
  pets: Pet[] = [];
  veterinarians: Veterinarian[] = [];
  isEditMode = false;
  vaccinationId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vaccinationService: VaccinationService,
    private petService: PetService,
    private veterinarianService: VeterinarianService
  ) {
    this.vaccinationForm = this.fb.group({
      pet_id: ['', Validators.required],
      veterinarian_id: ['', Validators.required],
      vaccine_name: ['', Validators.required],
      date_administered: ['', Validators.required],
      next_due_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPets();
    this.loadVeterinarians();

    const id = this.route.snapshot.paramMap.get('id');
    const queryPetId = this.route.snapshot.queryParamMap.get('pet_id');

    if (queryPetId) {
      this.vaccinationForm.patchValue({ pet_id: Number(queryPetId) });
    }

    if (id) {
      this.isEditMode = true;
      this.vaccinationId = Number(id);
      this.loadVaccination(this.vaccinationId);
    }
  }

  loadPets(): void {
    this.petService.getAllPets().subscribe(pets => this.pets = pets);
  }

  loadVeterinarians(): void {
    this.veterinarianService.getAllVeterinarians().subscribe(vets => this.veterinarians = vets);
  }

  loadVaccination(id: number): void {
    this.vaccinationService.getVaccinationById(id).subscribe(vaccination => {
      this.vaccinationForm.patchValue({
        pet_id: vaccination.pet_id,
        veterinarian_id: vaccination.veterinarian_id,
        vaccine_name: vaccination.vaccine_name,
        date_administered: this.formatDateForInput(new Date(vaccination.date_administered)),
        next_due_date: this.formatDateForInput(new Date(vaccination.next_due_date))
      });
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.vaccinationForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const vaccinationData: Vaccination = {
      ...this.vaccinationForm.value,
      pet_id: Number(this.vaccinationForm.value.pet_id),
      veterinarian_id: Number(this.vaccinationForm.value.veterinarian_id),
      date_administered: new Date(this.vaccinationForm.value.date_administered),
      next_due_date: new Date(this.vaccinationForm.value.next_due_date)
    };

    const operation = this.isEditMode
      ? this.vaccinationService.updateVaccination(this.vaccinationId!, vaccinationData)
      : this.vaccinationService.createVaccination(vaccinationData);

    operation.subscribe({
      next: () => this.router.navigate(['/vaccinations']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save vaccination';
        this.isLoading = false;
      }
    });
  }

  get petId() { return this.vaccinationForm.get('pet_id'); }
  get veterinarianId() { return this.vaccinationForm.get('veterinarian_id'); }
  get vaccineName() { return this.vaccinationForm.get('vaccine_name'); }
  get dateAdministered() { return this.vaccinationForm.get('date_administered'); }
  get nextDueDate() { return this.vaccinationForm.get('next_due_date'); }
}
