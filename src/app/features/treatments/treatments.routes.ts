import { Routes } from '@angular/router';

export const TREATMENTS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./treatment-list/treatment-list.component').then(m => m.TreatmentListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./treatment-form/treatment-form.component').then(m => m.TreatmentFormComponent)
  }
];
