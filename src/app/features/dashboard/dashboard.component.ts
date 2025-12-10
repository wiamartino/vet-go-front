import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Subject, takeUntil, combineLatest } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { VaccinationService } from '../../core/services/vaccination.service';
import { SurgeryService } from '../../core/services/surgery.service';
import { LoadingService } from '../../core/services/loading.service';

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
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalClients: 0,
    appointmentsToday: 0,
    vaccinationsDue: 0,
    scheduledSurgeries: 0
  };
  
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

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
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.subscribeToLoadingStates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to loading states from services
   */
  subscribeToLoadingStates(): void {
    // Subscribe to individual loading states
    this.loadingService.getLoading$('clients_list')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingStates.clients = loading);

    this.loadingService.getLoading$('appointments_range')
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingStates.appointments = loading);

    // Update overall loading state
    combineLatest([
      this.loadingService.getLoading$('clients_list'),
      this.loadingService.getLoading$('appointments_range')
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([clients, appointments]) => {
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

    forkJoin({
      clients: this.clientService.getAllClients(forceRefresh),
      appointments: this.appointmentService.getAppointmentsByDateRange(today, tomorrow, forceRefresh),
      vaccinations: this.vaccinationService.getDueVaccinations(),
      surgeries: this.surgeryService.getSurgeriesByStatus('scheduled')
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
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
