import { Routes } from '@angular/router';
import { VeterinarianListComponent } from './veterinarian-list/veterinarian-list.component';

export const VETERINARIANS_ROUTES: Routes = [
  { path: '', component: VeterinarianListComponent },
  { 
    path: 'new', 
    loadComponent: () => import('./veterinarian-form/veterinarian-form.component').then(m => m.VeterinarianFormComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./veterinarian-detail/veterinarian-detail.component').then(m => m.VeterinarianDetailComponent)
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./veterinarian-form/veterinarian-form.component').then(m => m.VeterinarianFormComponent)
  }
];
