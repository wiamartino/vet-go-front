import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VaccinationService } from '../../../core/services/vaccination.service';
import { Vaccination } from '../../../models';

@Component({
  selector: 'app-vaccination-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Vaccinations</h1>
          <p class="mt-2 text-sm text-gray-700">Track pet vaccinations and due dates</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a routerLink="/vaccinations/new" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Record Vaccination
          </a>
        </div>
      </div>
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      <div *ngIf="!isLoading" class="mt-8 space-y-4">
        <div *ngIf="overdueCount > 0" class="bg-red-50 border-l-4 border-red-400 p-4">
          <p class="text-sm text-red-700"><strong>{{ overdueCount }}</strong> overdue vaccinations require attention</p>
        </div>
        <div *ngIf="dueCount > 0" class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p class="text-sm text-yellow-700"><strong>{{ dueCount }}</strong> vaccinations due within 30 days</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6">
          <p class="text-gray-600">{{ vaccinations.length }} vaccinations recorded</p>
        </div>
      </div>
    </div>
  `
})
export class VaccinationListComponent implements OnInit {
  vaccinations: Vaccination[] = [];
  dueCount = 0;
  overdueCount = 0;
  isLoading = true;

  constructor(private vaccinationService: VaccinationService) {}

  ngOnInit(): void {
    this.vaccinationService.getAllVaccinations().subscribe({
      next: (data) => { 
        this.vaccinations = data;
        this.calculateDueCounts();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  calculateDueCounts(): void {
    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    this.vaccinations.forEach(v => {
      const dueDate = new Date(v.next_due_date);
      if (dueDate < today) this.overdueCount++;
      else if (dueDate <= thirtyDays) this.dueCount++;
    });
  }
}
