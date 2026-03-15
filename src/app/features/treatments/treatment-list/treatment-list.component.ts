import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TreatmentService } from '../../../core/services/treatment.service';
import { Treatment } from '../../../models';

@Component({
  selector: 'app-treatment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Treatments</h1>
          <p class="mt-2 text-sm text-gray-700">A list of all treatments available in your clinic.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a routerLink="/treatments/new" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Add Treatment
          </a>
        </div>
      </div>

      <!-- Search -->
      <div class="mt-6 max-w-md">
        <label for="search" class="sr-only">Search treatments</label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search treatments..."
          />
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mt-6 rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div *ngIf="!isLoading" class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cost</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr *ngIf="filteredTreatments.length === 0">
                    <td colspan="4" class="py-12 text-center text-sm text-gray-500">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p class="mt-2">No treatments found</p>
                      <a routerLink="/treatments/new" class="mt-2 inline-block text-indigo-600 hover:text-indigo-500">Add a treatment</a>
                    </td>
                  </tr>
                  <tr *ngFor="let treatment of filteredTreatments" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {{ treatment.name }}
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {{ treatment.description }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ treatment.cost | currency }}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a [routerLink]="['/treatments', treatment.treatment_id, 'edit']" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</a>
                      <button (click)="deleteTreatment(treatment)" class="text-red-600 hover:text-red-900" [disabled]="deletingId === treatment.treatment_id">
                        {{ deletingId === treatment.treatment_id ? 'Deleting...' : 'Delete' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div *ngIf="!isLoading && filteredTreatments.length > 0" class="mt-4 text-sm text-gray-500">
        Showing {{ filteredTreatments.length }} of {{ treatments.length }} treatments
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="treatmentToDelete" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cancelDelete()"></div>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Treatment</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Are you sure you want to delete "{{ treatmentToDelete.name }}"? This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button type="button" (click)="confirmDelete()" [disabled]="deletingId !== null" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              {{ deletingId !== null ? 'Deleting...' : 'Delete' }}
            </button>
            <button type="button" (click)="cancelDelete()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TreatmentListComponent implements OnInit {
  treatments: Treatment[] = [];
  filteredTreatments: Treatment[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  treatmentToDelete: Treatment | null = null;
  deletingId: number | null = null;

  constructor(private treatmentService: TreatmentService) {}

  ngOnInit(): void {
    this.loadTreatments();
  }

  loadTreatments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.treatmentService.getAllTreatments().subscribe({
      next: (treatments) => {
        this.treatments = treatments;
        this.filteredTreatments = treatments;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load treatments';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTreatments = this.treatments;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredTreatments = this.treatments.filter(treatment =>
      treatment.name?.toLowerCase().includes(query) ||
      treatment.description?.toLowerCase().includes(query)
    );
  }

  deleteTreatment(treatment: Treatment): void {
    this.treatmentToDelete = treatment;
  }

  cancelDelete(): void {
    this.treatmentToDelete = null;
  }

  confirmDelete(): void {
    if (!this.treatmentToDelete?.treatment_id) return;

    this.deletingId = this.treatmentToDelete.treatment_id;

    this.treatmentService.deleteTreatment(this.treatmentToDelete.treatment_id).subscribe({
      next: () => {
        this.treatments = this.treatments.filter(t => t.treatment_id !== this.deletingId);
        this.filteredTreatments = this.filteredTreatments.filter(t => t.treatment_id !== this.deletingId);
        this.treatmentToDelete = null;
        this.deletingId = null;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to delete treatment';
        this.treatmentToDelete = null;
        this.deletingId = null;
      }
    });
  }
}
