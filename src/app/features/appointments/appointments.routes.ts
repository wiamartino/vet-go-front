import { Routes } from '@angular/router';

export const APPOINTMENTS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
  }
];
