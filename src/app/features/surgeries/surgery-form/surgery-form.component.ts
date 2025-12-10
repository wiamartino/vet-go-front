import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurgeryService } from '../../../core/services/surgery.service';
import { PetService } from '../../../core/services/pet.service';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { Surgery, SurgeryStatus, Pet, Veterinarian } from '../../../models';

@Component({
  selector: 'app-surgery-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Surgery' : 'Schedule Surgery' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update surgery details' : 'Schedule a new surgery for a pet' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="surgeryForm" (ngSubmit)="onSubmit()">
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
                    <option *ngFor="let vet of veterinarians" [value]="vet.veterinarian_id">Dr. {{ vet.first_name }} {{ vet.last_name }} - {{ vet.specialty }}</option>
                  </select>
                  <div *ngIf="veterinarianId?.invalid && veterinarianId?.touched" class="mt-1 text-sm text-red-600">Veterinarian is required</div>
                </div>

                <div>
                  <label for="surgery_type" class="block text-sm font-medium text-gray-700">Surgery Type *</label>
                  <select id="surgery_type" formControlName="surgery_type" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select surgery type</option>
                    <option value="Spay/Neuter">Spay/Neuter</option>
                    <option value="Dental Surgery">Dental Surgery</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                    <option value="Soft Tissue Surgery">Soft Tissue Surgery</option>
                    <option value="Emergency Surgery">Emergency Surgery</option>
                    <option value="Tumor Removal">Tumor Removal</option>
                    <option value="Other">Other</option>
                  </select>
                  <div *ngIf="surgeryType?.invalid && surgeryType?.touched" class="mt-1 text-sm text-red-600">Surgery type is required</div>
                </div>

                <div>
                  <label for="date" class="block text-sm font-medium text-gray-700">Surgery Date *</label>
                  <input type="date" id="date" formControlName="date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="date?.invalid && date?.touched" class="mt-1 text-sm text-red-600">Date is required</div>
                </div>

                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700">Status *</label>
                  <select id="status" formControlName="status" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div *ngIf="status?.invalid && status?.touched" class="mt-1 text-sm text-red-600">Status is required</div>
                </div>

                <div>
                  <label for="notes" class="block text-sm font-medium text-gray-700">Notes *</label>
                  <textarea id="notes" formControlName="notes" rows="4" placeholder="Pre-operative notes, special instructions, etc..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="notes?.invalid && notes?.touched" class="mt-1 text-sm text-red-600">Notes are required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/surgeries" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="surgeryForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Schedule') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SurgeryFormComponent implements OnInit {
  surgeryForm: FormGroup;
  pets: Pet[] = [];
  veterinarians: Veterinarian[] = [];
  isEditMode = false;
  surgeryId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private surgeryService: SurgeryService,
    private petService: PetService,
    private veterinarianService: VeterinarianService
  ) {
    this.surgeryForm = this.fb.group({
      pet_id: ['', Validators.required],
      veterinarian_id: ['', Validators.required],
      surgery_type: ['', Validators.required],
      date: ['', Validators.required],
      status: ['scheduled', Validators.required],
      notes: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPets();
    this.loadVeterinarians();

    const id = this.route.snapshot.paramMap.get('id');
    const queryPetId = this.route.snapshot.queryParamMap.get('pet_id');

    if (queryPetId) {
      this.surgeryForm.patchValue({ pet_id: Number(queryPetId) });
    }

    if (id) {
      this.isEditMode = true;
      this.surgeryId = Number(id);
      this.loadSurgery(this.surgeryId);
    }
  }

  loadPets(): void {
    this.petService.getAllPets().subscribe(pets => this.pets = pets);
  }

  loadVeterinarians(): void {
    this.veterinarianService.getAllVeterinarians().subscribe(vets => this.veterinarians = vets);
  }

  loadSurgery(id: number): void {
    this.surgeryService.getSurgeryById(id).subscribe(surgery => {
      this.surgeryForm.patchValue({
        pet_id: surgery.pet_id,
        veterinarian_id: surgery.veterinarian_id,
        surgery_type: surgery.surgery_type,
        date: this.formatDateForInput(new Date(surgery.date)),
        status: surgery.status,
        notes: surgery.notes
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
    if (this.surgeryForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const surgeryData: Surgery = {
      ...this.surgeryForm.value,
      pet_id: Number(this.surgeryForm.value.pet_id),
      veterinarian_id: Number(this.surgeryForm.value.veterinarian_id),
      date: new Date(this.surgeryForm.value.date),
      status: this.surgeryForm.value.status as SurgeryStatus
    };

    const operation = this.isEditMode
      ? this.surgeryService.updateSurgery(this.surgeryId!, surgeryData)
      : this.surgeryService.createSurgery(surgeryData);

    operation.subscribe({
      next: () => this.router.navigate(['/surgeries']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save surgery';
        this.isLoading = false;
      }
    });
  }

  get petId() { return this.surgeryForm.get('pet_id'); }
  get veterinarianId() { return this.surgeryForm.get('veterinarian_id'); }
  get surgeryType() { return this.surgeryForm.get('surgery_type'); }
  get date() { return this.surgeryForm.get('date'); }
  get status() { return this.surgeryForm.get('status'); }
  get notes() { return this.surgeryForm.get('notes'); }
}

