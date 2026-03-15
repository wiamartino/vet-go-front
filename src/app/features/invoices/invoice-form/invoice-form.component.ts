import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClientService } from '../../../core/services/client.service';
import { Invoice, Appointment, Client } from '../../../models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Invoice' : 'Create Invoice' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update invoice details' : 'Generate a new invoice for an appointment' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div>
                  <label for="client_id" class="block text-sm font-medium text-gray-700">Client *</label>
                  <select id="client_id" formControlName="client_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select client</option>
                    <option *ngFor="let client of clients" [value]="client.client_id">
                      {{ client.first_name }} {{ client.last_name }} - {{ client.email }}
                    </option>
                  </select>
                  <div *ngIf="clientId?.invalid && clientId?.touched" class="mt-1 text-sm text-red-600">Client is required</div>
                </div>

                <div>
                  <label for="appointment_id" class="block text-sm font-medium text-gray-700">Appointment *</label>
                  <select id="appointment_id" formControlName="appointment_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select appointment</option>
                    <option *ngFor="let appointment of appointments" [value]="appointment.appointment_id">
                      Appointment #{{ appointment.appointment_id }} - {{ appointment.reason_for_appointment }}
                    </option>
                  </select>
                  <div *ngIf="appointmentId?.invalid && appointmentId?.touched" class="mt-1 text-sm text-red-600">Appointment is required</div>
                </div>

                <div>
                  <label for="total" class="block text-sm font-medium text-gray-700">Total ($) *</label>
                  <input type="number" id="total" formControlName="total" step="0.01" min="0" placeholder="0.00" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="total?.invalid && total?.touched" class="mt-1 text-sm text-red-600">Total is required</div>
                </div>

                <div>
                  <label for="date" class="block text-sm font-medium text-gray-700">Date *</label>
                  <input type="date" id="date" formControlName="date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="date?.invalid && date?.touched" class="mt-1 text-sm text-red-600">Date is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/invoices" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="invoiceForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  appointments: Appointment[] = [];
  clients: Client[] = [];
  isEditMode = false;
  invoiceId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private appointmentService: AppointmentService,
    private clientService: ClientService
  ) {
    this.invoiceForm = this.fb.group({
      client_id: ['', Validators.required],
      appointment_id: ['', Validators.required],
      total: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadClients();

    const id = this.route.snapshot.paramMap.get('id');
    const queryAppointmentId = this.route.snapshot.queryParamMap.get('appointment_id');
    const queryClientId = this.route.snapshot.queryParamMap.get('client_id');

    if (queryAppointmentId) {
      this.invoiceForm.patchValue({ appointment_id: Number(queryAppointmentId) });
    }

    if (queryClientId) {
      this.invoiceForm.patchValue({ client_id: Number(queryClientId) });
    }

    // Set default date to today
    if (!id) {
      const today = new Date();
      this.invoiceForm.patchValue({
        date: this.formatDateForInput(today)
      });
    }

    if (id) {
      this.isEditMode = true;
      this.invoiceId = Number(id);
      this.loadInvoice(this.invoiceId);
    }
  }

  loadAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe(appointments => this.appointments = appointments);
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(clients => this.clients = clients);
  }

  loadInvoice(id: number): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoiceForm.patchValue({
          client_id: invoice.client_id,
          appointment_id: invoice.appointment_id,
          total: invoice.total,
          date: this.formatDateForInput(invoice.date)
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load invoice';
        console.error('Error loading invoice:', error);
      }
    });
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    // Find the selected client to include full client data
    const selectedClientId = Number(this.invoiceForm.value.client_id);
    const selectedClient = this.clients.find(c => c.client_id === selectedClientId);

    if (!selectedClient) {
      this.errorMessage = 'Please select a valid client';
      this.isLoading = false;
      return;
    }

    // Convert date to ISO 8601 format for backend
    const dateISO = `${this.invoiceForm.value.date}T00:00:00Z`;

    const invoiceData: Invoice = {
      client_id: selectedClientId,
      appointment_id: Number(this.invoiceForm.value.appointment_id),
      total: Number(this.invoiceForm.value.total),
      date: dateISO,
      client: selectedClient
    };

    const operation = this.isEditMode
      ? this.invoiceService.updateInvoice(this.invoiceId!, invoiceData)
      : this.invoiceService.createInvoice(invoiceData);

    operation.subscribe({
      next: () => this.router.navigate(['/invoices']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save invoice';
        this.isLoading = false;
      }
    });
  }

  get clientId() { return this.invoiceForm.get('client_id'); }
  get appointmentId() { return this.invoiceForm.get('appointment_id'); }
  get total() { return this.invoiceForm.get('total'); }
  get date() { return this.invoiceForm.get('date'); }
}
