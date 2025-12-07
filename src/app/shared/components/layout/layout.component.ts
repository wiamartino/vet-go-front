import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = true;

  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Clients', route: '/clients', icon: 'users' },
    { label: 'Pets', route: '/pets', icon: 'paw' },
    { label: 'Appointments', route: '/appointments', icon: 'calendar' },
    { label: 'Veterinarians', route: '/veterinarians', icon: 'user-md' },
    { label: 'Medical Records', route: '/medical-records', icon: 'file-medical' },
    { label: 'Vaccinations', route: '/vaccinations', icon: 'syringe' },
    { label: 'Surgeries', route: '/surgeries', icon: 'scalpel' },
    { label: 'Allergies', route: '/allergies', icon: 'allergies' },
    { label: 'Invoices', route: '/invoices', icon: 'file-invoice' },
    { label: 'Treatments', route: '/treatments', icon: 'pills' },
    { label: 'Medications', route: '/medications', icon: 'prescription' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
