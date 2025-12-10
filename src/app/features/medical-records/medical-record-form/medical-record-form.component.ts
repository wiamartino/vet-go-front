import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { PetService } from '../../../core/services/pet.service';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { MedicalRecord, Pet, Veterinarian } from '../../../models';

@Component({
  selector: 'app-medical-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Medical Record' : 'New Medical Record' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update medical record' : 'Create a new medical record for a pet' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="medicalRecordForm" (ngSubmit)="onSubmit()">
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
                  <label for="date" class="block text-sm font-medium text-gray-700">Date *</label>
                  <input type="date" id="date" formControlName="date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="date?.invalid && date?.touched" class="mt-1 text-sm text-red-600">Date is required</div>
                </div>

                <div>
                  <label for="diagnosis" class="block text-sm font-medium text-gray-700">Diagnosis *</label>
                  <textarea id="diagnosis" formControlName="diagnosis" rows="3" placeholder="Enter diagnosis..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="diagnosis?.invalid && diagnosis?.touched" class="mt-1 text-sm text-red-600">Diagnosis is required</div>
                </div>

                <div>
                  <label for="treatment" class="block text-sm font-medium text-gray-700">Treatment *</label>
                  <textarea id="treatment" formControlName="treatment" rows="4" placeholder="Describe the treatment plan..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="treatment?.invalid && treatment?.touched" class="mt-1 text-sm text-red-600">Treatment is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/medical-records" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="medicalRecordForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
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
export class MedicalRecordFormComponent implements OnInit {
  medicalRecordForm: FormGroup;
  pets: Pet[] = [];
  veterinarians: Veterinarian[] = [];
  isEditMode = false;
  medicalRecordId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medicalRecordService: MedicalRecordService,
    private petService: PetService,
    private veterinarianService: VeterinarianService
  ) {
    this.medicalRecordForm = this.fb.group({
      pet_id: ['', Validators.required],
      veterinarian_id: ['', Validators.required],
      date: ['', Validators.required],
      diagnosis: ['', Validators.required],
      treatment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPets();
    this.loadVeterinarians();

    const id = this.route.snapshot.paramMap.get('id');
    const queryPetId = this.route.snapshot.queryParamMap.get('pet_id');

    if (queryPetId) {
      this.medicalRecordForm.patchValue({ pet_id: Number(queryPetId) });
    }

    if (id) {
      this.isEditMode = true;
      this.medicalRecordId = Number(id);
      this.loadMedicalRecord(this.medicalRecordId);
    }
  }

  loadPets(): void {
    this.petService.getAllPets().subscribe(pets => this.pets = pets);
  }

  loadVeterinarians(): void {
    this.veterinarianService.getAllVeterinarians().subscribe(vets => this.veterinarians = vets);
  }

  loadMedicalRecord(id: number): void {
    this.medicalRecordService.getMedicalRecordById(id).subscribe(record => {
      this.medicalRecordForm.patchValue({
        pet_id: record.pet_id,
        veterinarian_id: record.veterinarian_id,
        date: this.formatDateForInput(new Date(record.date)),
        diagnosis: record.diagnosis,
        treatment: record.treatment
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
    if (this.medicalRecordForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const recordData: MedicalRecord = {
      ...this.medicalRecordForm.value,
      pet_id: Number(this.medicalRecordForm.value.pet_id),
      veterinarian_id: Number(this.medicalRecordForm.value.veterinarian_id),
      date: new Date(this.medicalRecordForm.value.date)
    };

    const operation = this.isEditMode
      ? this.medicalRecordService.updateMedicalRecord(this.medicalRecordId!, recordData)
      : this.medicalRecordService.createMedicalRecord(recordData);

    operation.subscribe({
      next: () => this.router.navigate(['/medical-records']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save medical record';
        this.isLoading = false;
      }
    });
  }

  get petId() { return this.medicalRecordForm.get('pet_id'); }
  get veterinarianId() { return this.medicalRecordForm.get('veterinarian_id'); }
  get date() { return this.medicalRecordForm.get('date'); }
  get diagnosis() { return this.medicalRecordForm.get('diagnosis'); }
  get treatment() { return this.medicalRecordForm.get('treatment'); }
}
