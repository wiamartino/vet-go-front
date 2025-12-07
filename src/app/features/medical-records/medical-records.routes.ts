import { Routes } from '@angular/router';

export const MEDICAL_RECORDS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./medical-record-list/medical-record-list.component').then(m => m.MedicalRecordListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./medical-record-form/medical-record-form.component').then(m => m.MedicalRecordFormComponent)
  }
];
