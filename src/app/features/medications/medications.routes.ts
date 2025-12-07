import { Routes } from '@angular/router';

export const MEDICATIONS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./medication-list/medication-list.component').then(m => m.MedicationListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./medication-form/medication-form.component').then(m => m.MedicationFormComponent)
  }
];
