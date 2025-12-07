import { Routes } from '@angular/router';

export const SURGERIES_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./surgery-list/surgery-list.component').then(m => m.SurgeryListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./surgery-form/surgery-form.component').then(m => m.SurgeryFormComponent)
  }
];
