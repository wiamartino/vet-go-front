import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { Veterinarian } from '../../../models';

@Component({
  selector: 'app-veterinarian-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div *ngIf="isLoading" class="text-center py-12">
        <p class="text-gray-500">Loading...</p>
      </div>

      <div *ngIf="errorMessage && !isLoading" class="rounded-md bg-red-50 p-4">
        <p class="text-sm text-red-800">{{ errorMessage }}</p>
        <a routerLink="/veterinarians" class="mt-2 inline-block text-red-600 hover:text-red-900">Back to veterinarians</a>
      </div>

      <div *ngIf="veterinarian && !isLoading">
        <div class="md:flex md:items-center md:justify-between mb-6">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dr. {{ veterinarian.first_name }} {{ veterinarian.last_name }}
            </h2>
            <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ veterinarian.specialty }}
              </div>
            </div>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <a [routerLink]="['/veterinarians', 'edit', veterinarian.veterinarian_id]" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Edit
            </a>
            <button (click)="deleteVeterinarian()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
          </div>
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a href="mailto:{{ veterinarian.email }}" class="text-indigo-600 hover:text-indigo-900">{{ veterinarian.email }}</a>
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a href="tel:{{ veterinarian.phone }}" class="text-indigo-600 hover:text-indigo-900">{{ veterinarian.phone }}</a>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Specialty</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ veterinarian.specialty }}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Veterinarian ID</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">#{{ veterinarian.veterinarian_id }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="mt-6">
          <a routerLink="/veterinarians" class="text-indigo-600 hover:text-indigo-900">
            ← Back to veterinarians
          </a>
        </div>
      </div>
    </div>
  `
})
export class VeterinarianDetailComponent implements OnInit {
  veterinarian?: Veterinarian;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private veterinarianService: VeterinarianService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVeterinarian(Number(id));
    } else {
      this.errorMessage = 'Invalid veterinarian ID';
      this.isLoading = false;
    }
  }

  loadVeterinarian(id: number): void {
    this.veterinarianService.getVeterinarianById(id).subscribe({
      next: (veterinarian) => {
        this.veterinarian = veterinarian;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load veterinarian details';
        this.isLoading = false;
        console.error('Error loading veterinarian:', error);
      }
    });
  }

  deleteVeterinarian(): void {
    if (!this.veterinarian || !confirm('Are you sure you want to delete this veterinarian?')) {
      return;
    }

    this.veterinarianService.deleteVeterinarian(this.veterinarian.veterinarian_id!).subscribe({
      next: () => {
        this.router.navigate(['/veterinarians']);
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete veterinarian';
        console.error('Error deleting veterinarian:', error);
      }
    });
  }
}

