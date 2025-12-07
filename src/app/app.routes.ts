import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { 
        path: 'clients', 
        loadChildren: () => import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES)
      },
      { 
        path: 'pets', 
        loadChildren: () => import('./features/pets/pets.routes').then(m => m.PETS_ROUTES)
      },
      { 
        path: 'appointments', 
        loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES)
      },
      { 
        path: 'veterinarians', 
        loadChildren: () => import('./features/veterinarians/veterinarians.routes').then(m => m.VETERINARIANS_ROUTES)
      },
      { 
        path: 'medical-records', 
        loadChildren: () => import('./features/medical-records/medical-records.routes').then(m => m.MEDICAL_RECORDS_ROUTES)
      },
      { 
        path: 'vaccinations', 
        loadChildren: () => import('./features/vaccinations/vaccinations.routes').then(m => m.VACCINATIONS_ROUTES)
      },
      { 
        path: 'surgeries', 
        loadChildren: () => import('./features/surgeries/surgeries.routes').then(m => m.SURGERIES_ROUTES)
      },
      { 
        path: 'allergies', 
        loadChildren: () => import('./features/allergies/allergies.routes').then(m => m.ALLERGIES_ROUTES)
      },
      { 
        path: 'invoices', 
        loadChildren: () => import('./features/invoices/invoices.routes').then(m => m.INVOICES_ROUTES)
      },
      { 
        path: 'treatments', 
        loadChildren: () => import('./features/treatments/treatments.routes').then(m => m.TREATMENTS_ROUTES)
      },
      { 
        path: 'medications', 
        loadChildren: () => import('./features/medications/medications.routes').then(m => m.MEDICATIONS_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];