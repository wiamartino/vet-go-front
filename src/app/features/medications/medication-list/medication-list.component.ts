import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicationService } from '../../../core/services/medication.service';
import { Medication } from '../../../models';

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Medications</h1>
          <p class="mt-2 text-sm text-gray-700">A list of all medications available in the clinic inventory.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a routerLink="/medications/new" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            Add Medication
          </a>
        </div>
      </div>

      <div class="mt-6">
        <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search medications by name or description..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
      </div>

      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div *ngIf="!isLoading" class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cost</th>
                    <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr *ngFor="let medication of filteredMedications" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ medication.name }}</td>
                    <td class="px-3 py-4 text-sm text-gray-500 max-w-md truncate">{{ medication.description }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatCurrency(medication.price) }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a [routerLink]="['/medications', medication.medication_id, 'edit']" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</a>
                      <button (click)="deleteMedication(medication.medication_id!)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredMedications.length === 0">
                    <td colspan="5" class="py-8 text-center text-sm text-gray-500">No medications found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MedicationListComponent implements OnInit {
  medications: Medication[] = [];
  filteredMedications: Medication[] = [];
  searchTerm = '';
  isLoading = true;

  constructor(private medicationService: MedicationService) {}

  ngOnInit(): void {
    this.loadMedications();
  }

  loadMedications(): void {
    this.isLoading = true;
    this.medicationService.getAllMedications().subscribe({
      next: (medications) => {
        this.medications = medications;
        this.filteredMedications = medications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading medications:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMedications = this.medications;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMedications = this.medications.filter(medication =>
      medication.name.toLowerCase().includes(term) ||
      medication.description.toLowerCase().includes(term)
    );
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  deleteMedication(id: number): void {
    if (!confirm('Are you sure you want to delete this medication?')) {
      return;
    }

    this.medicationService.deleteMedication(id).subscribe({
      next: () => {
        this.medications = this.medications.filter(m => m.medication_id !== id);
        this.onSearch();
      },
      error: (error) => {
        alert('Failed to delete medication');
        console.error('Error deleting medication:', error);
      }
    });
  }
}
