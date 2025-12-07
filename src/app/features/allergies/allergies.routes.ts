import { Routes } from '@angular/router';

export const ALLERGIES_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./allergy-list/allergy-list.component').then(m => m.AllergyListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./allergy-form/allergy-form.component').then(m => m.AllergyFormComponent)
  }
];
