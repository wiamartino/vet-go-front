import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { VaccinationService } from '../../core/services/vaccination.service';
import { SurgeryService } from '../../core/services/surgery.service';

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
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalClients: 0,
    appointmentsToday: 0,
    vaccinationsDue: 0,
    scheduledSurgeries: 0
  };
  
  isLoading = true;

  constructor(
    private clientService: ClientService,
    private appointmentService: AppointmentService,
    private vaccinationService: VaccinationService,
    private surgeryService: SurgeryService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    forkJoin({
      clients: this.clientService.getAllClients(),
      appointments: this.appointmentService.getAppointmentsByDateRange(today, tomorrow),
      vaccinations: this.vaccinationService.getDueVaccinations(),
      surgeries: this.surgeryService.getSurgeriesByStatus('scheduled')
    }).subscribe({
      next: (data) => {
        this.stats = {
          totalClients: data.clients.length,
          appointmentsToday: data.appointments.length,
          vaccinationsDue: data.vaccinations.length,
          scheduledSurgeries: data.surgeries.length
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });
  }
}
