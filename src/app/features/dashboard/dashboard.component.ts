import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, combineLatest } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { VaccinationService } from '../../core/services/vaccination.service';
import { SurgeryService } from '../../core/services/surgery.service';
import { LoadingService } from '../../core/services/loading.service';
import { CancellableComponent } from '../../core/utils/request-cancellation.util';

interface DashboardStats {
  totalClients: number;
  appointmentsToday: number;
  vaccinationsDue: number;
  scheduledSurgeries: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends CancellableComponent implements OnInit {
  stats: DashboardStats = {
    totalClients: 0,
    appointmentsToday: 0,
    vaccinationsDue: 0,
    scheduledSurgeries: 0
  };
  
  isLoading = false;
  error: string | null = null;

  // Track loading states for individual sections
  loadingStates = {
    clients: false,
    appointments: false,
    vaccinations: false,
    surgeries: false
  };

  constructor(
    private clientService: ClientService,
    private appointmentService: AppointmentService,
    private vaccinationService: VaccinationService,
    private surgeryService: SurgeryService,
    public loadingService: LoadingService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.subscribeToLoadingStates();
  }

  /**
   * Subscribe to loading states from services (auto-cancelled on destroy)
   */
  subscribeToLoadingStates(): void {
    // Subscribe to individual loading states
    this.autoCancel(this.loadingService.getLoading$('clients_list'))
      .subscribe(loading => this.loadingStates.clients = loading);

    this.autoCancel(this.loadingService.getLoading$('appointments_range'))
      .subscribe(loading => this.loadingStates.appointments = loading);

    // Update overall loading state
    this.autoCancel(combineLatest([
      this.loadingService.getLoading$('clients_list'),
      this.loadingService.getLoading$('appointments_range')
    ])).subscribe(([clients, appointments]) => {
      this.isLoading = clients || appointments;
    });
  }
  /**
   * Load dashboard statistics using cached data
   */
  loadDashboardStats(forceRefresh = false): void {
    this.error = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.autoCancel(forkJoin({
      clients: this.clientService.getAllClients(forceRefresh),
      appointments: this.appointmentService.getAppointmentsByDateRange(today.toISOString(), tomorrow.toISOString(), forceRefresh),
      vaccinations: this.vaccinationService.getDueVaccinations(),
      surgeries: this.surgeryService.getSurgeriesByStatus('scheduled')
    })).subscribe({
      next: (data) => {
        this.stats = {
          totalClients: data.clients.length,
          appointmentsToday: data.appointments.length,
          vaccinationsDue: data.vaccinations.length,
          scheduledSurgeries: data.surgeries.length
        };
      },
      error: (error) => {
        this.error = error?.error?.message || error?.message || 'Error loading dashboard data';
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    this.loadDashboardStats(true);
  }

  /**
   * Check if any section is loading
   */
  isAnySectionLoading(): boolean {
    return Object.values(this.loadingStates).some(loading => loading);
  }
}
