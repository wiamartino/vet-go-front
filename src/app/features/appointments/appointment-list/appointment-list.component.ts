import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p class="mt-2 text-sm text-gray-700">Schedule and manage appointments</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a routerLink="/appointments/new" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Schedule Appointment
          </a>
        </div>
      </div>
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      <div *ngIf="!isLoading" class="mt-8 bg-white shadow rounded-lg p-6">
        <p class="text-gray-600">{{ appointments.length }} appointments found</p>
      </div>
    </div>
  `
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoading = true;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => { this.appointments = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }
}
