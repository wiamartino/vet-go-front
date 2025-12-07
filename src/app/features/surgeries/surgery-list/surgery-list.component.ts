import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurgeryService } from '../../../core/services/surgery.service';
import { Surgery } from '../../../models';

@Component({
  selector: 'app-surgery-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Surgeries</h1>
          <p class="mt-2 text-sm text-gray-700">Manage surgical procedures</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a routerLink="/surgeries/new" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Schedule Surgery
          </a>
        </div>
      </div>
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      <div *ngIf="!isLoading" class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500">Scheduled</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ statusCounts.scheduled }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500">In Progress</dt>
            <dd class="mt-1 text-3xl font-semibold text-blue-600">{{ statusCounts.in_progress }}</dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500">Completed</dt>
            <dd class="mt-1 text-3xl font-semibold text-green-600">{{ statusCounts.completed }}</dd>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SurgeryListComponent implements OnInit {
  surgeries: Surgery[] = [];
  statusCounts = { scheduled: 0, in_progress: 0, completed: 0 };
  isLoading = true;

  constructor(private surgeryService: SurgeryService) {}

  ngOnInit(): void {
    this.surgeryService.getAllSurgeries().subscribe({
      next: (data) => {
        this.surgeries = data;
        this.statusCounts = {
          scheduled: data.filter(s => s.status === 'scheduled').length,
          in_progress: data.filter(s => s.status === 'in_progress').length,
          completed: data.filter(s => s.status === 'completed').length
        };
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
