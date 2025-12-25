import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AllergyService } from '../../../core/services/allergy.service';
import { PetService } from '../../../core/services/pet.service';
import { Allergy, AllergySeverity, Pet } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-allergy-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Pet Allergies</h1>
          <p class="mt-2 text-sm text-gray-700">A list of all recorded pet allergies and their severity.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a routerLink="/allergies/new" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            Add Allergy
          </a>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search allergies..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
        <select [(ngModel)]="severityFilter" (change)="onSearch()" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
          <option value="">All Severities</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
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
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Pet</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Allergen</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Severity</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reaction</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Diagnosed Date</th>
                    <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr *ngFor="let allergy of filteredAllergies" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ getPetName(allergy.pet_id) }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ allergy.allergen }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span [class]="getSeverityBadgeClass(allergy.severity)">
                        {{ allergy.severity | titlecase }}
                      </span>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{{ allergy.reaction }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(allergy.diagnosed_date) }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a [routerLink]="['/allergies', allergy.allergy_id, 'edit']" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</a>
                      <button (click)="deleteAllergy(allergy.allergy_id!)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredAllergies.length === 0">
                    <td colspan="6" class="py-8 text-center text-sm text-gray-500">No allergies found</td>
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
export class AllergyListComponent implements OnInit {
  allergies: Allergy[] = [];
  filteredAllergies: Allergy[] = [];
  pets: Pet[] = [];
  petMap = new Map<number, string>();
  searchTerm = '';
  severityFilter: AllergySeverity | '' = '';
  isLoading = true;

  constructor(
    private allergyService: AllergyService,
    private petService: PetService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      allergies: this.allergyService.getAllAllergies(),
      pets: this.petService.getAllPets()
    }).subscribe({
      next: (data) => {
        this.allergies = data.allergies;
        this.filteredAllergies = data.allergies;
        this.pets = data.pets;
        this.pets.forEach(p => {
          this.petMap.set(p.pet_id!, p.name);
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    let results = this.allergies;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(allergy =>
        allergy.allergen.toLowerCase().includes(term) ||
        allergy.reaction.toLowerCase().includes(term) ||
        this.getPetName(allergy.pet_id).toLowerCase().includes(term)
      );
    }

    // Filter by severity
    if (this.severityFilter) {
      results = results.filter(allergy => allergy.severity === this.severityFilter);
    }

    this.filteredAllergies = results;
  }

  getPetName(petId: number): string {
    return this.petMap.get(petId) || 'Unknown';
  }

  getSeverityBadgeClass(severity: AllergySeverity): string {
    const baseClasses = 'inline-flex rounded-full px-2 text-xs font-semibold leading-5';
    switch (severity) {
      case 'mild':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'moderate':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'severe':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  deleteAllergy(id: number): void {
    if (!confirm('Are you sure you want to delete this allergy record?')) return;
    this.allergyService.deleteAllergy(id).subscribe({
      next: () => {
        this.allergies = this.allergies.filter(a => a.allergy_id !== id);
        this.onSearch();
      },
      error: (error) => {
        alert('Failed to delete allergy');
        console.error(error);
      }
    });
  }
}
