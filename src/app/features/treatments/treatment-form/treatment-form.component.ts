import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TreatmentService } from '../../../core/services/treatment.service';
import { Treatment } from '../../../models';

@Component({
  selector: 'app-treatment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Treatment' : 'New Treatment' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update treatment information' : 'Add a new treatment to the catalog' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="treatmentForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Treatment Name *</label>
                  <input type="text" id="name" formControlName="name" placeholder="e.g., Dental Cleaning, X-Ray" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="name?.invalid && name?.touched" class="mt-1 text-sm text-red-600">Name is required</div>
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea id="description" formControlName="description" rows="4" placeholder="Describe the treatment procedure..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="description?.invalid && description?.touched" class="mt-1 text-sm text-red-600">Description is required</div>
                </div>

                <div>
                  <label for="cost" class="block text-sm font-medium text-gray-700">Cost ($) *</label>
                  <input type="number" id="cost" formControlName="cost" step="0.01" min="0" placeholder="0.00" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="cost?.invalid && cost?.touched" class="mt-1 text-sm text-red-600">Cost is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/treatments" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="treatmentForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
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
export class TreatmentFormComponent implements OnInit {
  treatmentForm: FormGroup;
  isEditMode = false;
  treatmentId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private treatmentService: TreatmentService
  ) {
    this.treatmentForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      cost: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.treatmentId = Number(id);
      this.loadTreatment(this.treatmentId);
    }
  }

  loadTreatment(id: number): void {
    this.treatmentService.getTreatmentById(id).subscribe({
      next: (treatment) => {
        this.treatmentForm.patchValue(treatment);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load treatment';
        console.error('Error loading treatment:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.treatmentForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const treatmentData: Treatment = {
      ...this.treatmentForm.value,
      cost: Number(this.treatmentForm.value.cost)
    };

    const operation = this.isEditMode
      ? this.treatmentService.updateTreatment(this.treatmentId!, treatmentData)
      : this.treatmentService.createTreatment(treatmentData);

    operation.subscribe({
      next: () => this.router.navigate(['/treatments']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save treatment';
        this.isLoading = false;
      }
    });
  }

  get name() { return this.treatmentForm.get('name'); }
  get description() { return this.treatmentForm.get('description'); }
  get cost() { return this.treatmentForm.get('cost'); }
}
