import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { Veterinarian } from '../../../models';

@Component({
  selector: 'app-veterinarian-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Veterinarian' : 'New Veterinarian' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update veterinarian information' : 'Register a new veterinarian' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="veterinarianForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <label for="first_name" class="block text-sm font-medium text-gray-700">First Name *</label>
                    <input type="text" id="first_name" formControlName="first_name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="firstName?.invalid && firstName?.touched" class="mt-1 text-sm text-red-600">First name is required</div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input type="text" id="last_name" formControlName="last_name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="lastName?.invalid && lastName?.touched" class="mt-1 text-sm text-red-600">Last name is required</div>
                  </div>

                  <div class="col-span-6">
                    <label for="specialty" class="block text-sm font-medium text-gray-700">Specialty *</label>
                    <select id="specialty" formControlName="specialty" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">Select specialty</option>
                      <option value="General Practice">General Practice</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Emergency & Critical Care">Emergency & Critical Care</option>
                    </select>
                    <div *ngIf="specialty?.invalid && specialty?.touched" class="mt-1 text-sm text-red-600">Specialty is required</div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="phone" class="block text-sm font-medium text-gray-700">Phone *</label>
                    <input type="tel" id="phone" formControlName="phone" placeholder="(555) 123-4567" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="phone?.invalid && phone?.touched" class="mt-1 text-sm text-red-600">Phone is required</div>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" id="email" formControlName="email" placeholder="vet@example.com" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="email?.invalid && email?.touched" class="mt-1 text-sm text-red-600">
                      <span *ngIf="email?.errors?.['required']">Email is required</span>
                      <span *ngIf="email?.errors?.['email']">Invalid email format</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/veterinarians" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="veterinarianForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
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
export class VeterinarianFormComponent implements OnInit {
  veterinarianForm: FormGroup;
  isEditMode = false;
  veterinarianId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private veterinarianService: VeterinarianService
  ) {
    this.veterinarianForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      specialty: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.veterinarianId = Number(id);
      this.loadVeterinarian(this.veterinarianId);
    }
  }

  loadVeterinarian(id: number): void {
    this.veterinarianService.getVeterinarianById(id).subscribe({
      next: (veterinarian) => {
        this.veterinarianForm.patchValue(veterinarian);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load veterinarian';
        console.error('Error loading veterinarian:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.veterinarianForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const veterinarianData: Veterinarian = this.veterinarianForm.value;

    const operation = this.isEditMode
      ? this.veterinarianService.updateVeterinarian(this.veterinarianId!, veterinarianData)
      : this.veterinarianService.createVeterinarian(veterinarianData);

    operation.subscribe({
      next: (veterinarian) => {
        this.router.navigate(['/veterinarians', veterinarian.veterinarian_id]);
      },
      error: (error) => {
        this.errorMessage = this.isEditMode ? 'Failed to update veterinarian' : 'Failed to create veterinarian';
        this.isLoading = false;
        console.error('Error saving veterinarian:', error);
      }
    });
  }

  get firstName() { return this.veterinarianForm.get('first_name'); }
  get lastName() { return this.veterinarianForm.get('last_name'); }
  get specialty() { return this.veterinarianForm.get('specialty'); }
  get phone() { return this.veterinarianForm.get('phone'); }
  get email() { return this.veterinarianForm.get('email'); }
}
