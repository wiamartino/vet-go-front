import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AllergyService } from '../../../core/services/allergy.service';
import { PetService } from '../../../core/services/pet.service';
import { Allergy, AllergySeverity, Pet } from '../../../models';

@Component({
  selector: 'app-allergy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Allergy' : 'Record Allergy' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update allergy information' : 'Record a new pet allergy' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="allergyForm" (ngSubmit)="onSubmit()">
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
                  <label for="allergen" class="block text-sm font-medium text-gray-700">Allergen *</label>
                  <input type="text" id="allergen" formControlName="allergen" placeholder="e.g., Pollen, Chicken, Dust mites" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="allergen?.invalid && allergen?.touched" class="mt-1 text-sm text-red-600">Allergen is required</div>
                </div>

                <div>
                  <label for="reaction" class="block text-sm font-medium text-gray-700">Reaction *</label>
                  <textarea id="reaction" formControlName="reaction" rows="3" placeholder="Describe the allergic reaction..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="reaction?.invalid && reaction?.touched" class="mt-1 text-sm text-red-600">Reaction description is required</div>
                </div>

                <div>
                  <label for="severity" class="block text-sm font-medium text-gray-700">Severity *</label>
                  <select id="severity" formControlName="severity" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <div *ngIf="severity?.invalid && severity?.touched" class="mt-1 text-sm text-red-600">Severity is required</div>
                </div>

                <div>
                  <label for="diagnosed_date" class="block text-sm font-medium text-gray-700">Diagnosed Date *</label>
                  <input type="date" id="diagnosed_date" formControlName="diagnosed_date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="diagnosedDate?.invalid && diagnosedDate?.touched" class="mt-1 text-sm text-red-600">Diagnosed date is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/allergies" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="allergyForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
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
export class AllergyFormComponent implements OnInit {
  allergyForm: FormGroup;
  pets: Pet[] = [];
  isEditMode = false;
  allergyId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private allergyService: AllergyService,
    private petService: PetService
  ) {
    this.allergyForm = this.fb.group({
      pet_id: ['', Validators.required],
      allergen: ['', Validators.required],
      reaction: ['', Validators.required],
      severity: ['', Validators.required],
      diagnosed_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPets();
    const id = this.route.snapshot.paramMap.get('id');
    const queryPetId = this.route.snapshot.queryParamMap.get('pet_id');

    if (queryPetId) {
      this.allergyForm.patchValue({ pet_id: Number(queryPetId) });
    }

    if (id) {
      this.isEditMode = true;
      this.allergyId = Number(id);
      this.loadAllergy(this.allergyId);
    }
  }

  loadPets(): void {
    this.petService.getAllPets().subscribe(pets => this.pets = pets);
  }

  loadAllergy(id: number): void {
    this.allergyService.getAllergyById(id).subscribe(allergy => {
      // Format the date for the input field
      const formattedAllergy = {
        ...allergy,
        diagnosed_date: this.formatDateForInput(allergy.diagnosed_date)
      };
      this.allergyForm.patchValue(formattedAllergy);
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
    if (this.allergyForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const allergyData: Allergy = {
      ...this.allergyForm.value,
      pet_id: Number(this.allergyForm.value.pet_id),
      severity: this.allergyForm.value.severity as AllergySeverity
    };

    const operation = this.isEditMode
      ? this.allergyService.updateAllergy(this.allergyId!, allergyData)
      : this.allergyService.createAllergy(allergyData);

    operation.subscribe({
      next: () => this.router.navigate(['/allergies']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save allergy';
        this.isLoading = false;
      }
    });
  }

  get petId() { return this.allergyForm.get('pet_id'); }
  get allergen() { return this.allergyForm.get('allergen'); }
  get reaction() { return this.allergyForm.get('reaction'); }
  get severity() { return this.allergyForm.get('severity'); }
  get diagnosedDate() { return this.allergyForm.get('diagnosed_date'); }
}
