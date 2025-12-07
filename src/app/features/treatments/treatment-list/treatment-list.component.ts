import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreatmentService } from '../../../core/services/treatment.service';

@Component({
  selector: 'app-treatment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<div class="px-4 sm:px-6 lg:px-8 py-8"><div class="sm:flex sm:items-center"><div class="sm:flex-auto"><h1 class="text-2xl font-semibold text-gray-900">Treatments</h1></div><div class="mt-4 sm:mt-0"><a routerLink="/treatments/new" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Add Treatment</a></div></div><div *ngIf="isLoading" class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div></div>`
})
export class TreatmentListComponent implements OnInit {
  isLoading = true;
  constructor(private service: TreatmentService) {}
  ngOnInit(): void { this.service.getAllTreatments().subscribe(() => this.isLoading = false); }
}
