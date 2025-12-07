import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
  },
  { 
    path: 'new', 
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
  }
];
