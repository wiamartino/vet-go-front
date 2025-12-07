import { Routes } from '@angular/router';

export const VACCINATIONS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./vaccination-list/vaccination-list.component').then(m => m.VaccinationListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./vaccination-form/vaccination-form.component').then(m => m.VaccinationFormComponent)
  }
];
