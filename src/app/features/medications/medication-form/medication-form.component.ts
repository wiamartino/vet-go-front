import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicationService } from '../../../core/services/medication.service';
import { Medication } from '../../../models';

@Component({
  selector: 'app-medication-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Medication' : 'New Medication' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update medication information' : 'Add a new medication to the inventory' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="medicationForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Medication Name *</label>
                  <input type="text" id="name" formControlName="name" placeholder="e.g., Amoxicillin, Prednisone" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="name?.invalid && name?.touched" class="mt-1 text-sm text-red-600">Name is required</div>
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea id="description" formControlName="description" rows="3" placeholder="Purpose, indications, side effects..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="description?.invalid && description?.touched" class="mt-1 text-sm text-red-600">Description is required</div>
                </div>

                <div>
                  <label for="dosage" class="block text-sm font-medium text-gray-700">Dosage *</label>
                  <input type="text" id="dosage" formControlName="dosage" placeholder="e.g., 10mg/kg twice daily" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="dosage?.invalid && dosage?.touched" class="mt-1 text-sm text-red-600">Dosage is required</div>
                </div>

                <div>
                  <label for="cost" class="block text-sm font-medium text-gray-700">Cost ($) *</label>
                  <input type="number" id="cost" formControlName="cost" step="0.01" min="0" placeholder="0.00" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="cost?.invalid && cost?.touched" class="mt-1 text-sm text-red-600">Cost is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/medications" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="medicationForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
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
export class MedicationFormComponent implements OnInit {
  medicationForm: FormGroup;
  isEditMode = false;
  medicationId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medicationService: MedicationService
  ) {
    this.medicationForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      dosage: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.medicationId = Number(id);
      this.loadMedication(this.medicationId);
    }
  }

  loadMedication(id: number): void {
    this.medicationService.getMedicationById(id).subscribe({
      next: (medication) => {
        this.medicationForm.patchValue(medication);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load medication';
        console.error('Error loading medication:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.medicationForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const medicationData: Medication = {
      ...this.medicationForm.value,
      cost: Number(this.medicationForm.value.cost)
    };

    const operation = this.isEditMode
      ? this.medicationService.updateMedication(this.medicationId!, medicationData)
      : this.medicationService.createMedication(medicationData);

    operation.subscribe({
      next: () => this.router.navigate(['/medications']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save medication';
        this.isLoading = false;
      }
    });
  }

  get name() { return this.medicationForm.get('name'); }
  get description() { return this.medicationForm.get('description'); }
  get dosage() { return this.medicationForm.get('dosage'); }
  get cost() { return this.medicationForm.get('cost'); }
}
