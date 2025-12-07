import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-4">Schedule Appointment</h1>
      <div class="bg-white shadow rounded-lg p-6">
        <p class="text-gray-600">Appointment form coming soon...</p>
        <a routerLink="/appointments" class="mt-4 inline-block text-indigo-600 hover:text-indigo-900">Back to appointments</a>
      </div>
    </div>
  `
})
export class AppointmentFormComponent {}
