import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pet-list/pet-list.component').then(m => m.PetListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./pet-form/pet-form.component').then(m => m.PetFormComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./pet-detail/pet-detail.component').then(m => m.PetDetailComponent)
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./pet-form/pet-form.component').then(m => m.PetFormComponent)
  }
];
