import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Invoice, Appointment } from '../../../models';

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
                  <label for="total_amount" class="block text-sm font-medium text-gray-700">Total Amount ($) *</label>
                  <input type="number" id="total_amount" formControlName="total_amount" step="0.01" min="0" placeholder="0.00" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="totalAmount?.invalid && totalAmount?.touched" class="mt-1 text-sm text-red-600">Total amount is required</div>
                </div>

                <div>
                  <label for="payment_status" class="block text-sm font-medium text-gray-700">Payment Status *</label>
                  <select id="payment_status" formControlName="payment_status" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div *ngIf="paymentStatus?.invalid && paymentStatus?.touched" class="mt-1 text-sm text-red-600">Payment status is required</div>
                </div>

                <div>
                  <label for="issue_date" class="block text-sm font-medium text-gray-700">Issue Date *</label>
                  <input type="date" id="issue_date" formControlName="issue_date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                  <div *ngIf="issueDate?.invalid && issueDate?.touched" class="mt-1 text-sm text-red-600">Issue date is required</div>
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
  isEditMode = false;
  invoiceId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private appointmentService: AppointmentService
  ) {
    this.invoiceForm = this.fb.group({
      appointment_id: ['', Validators.required],
      total_amount: ['', [Validators.required, Validators.min(0)]],
      payment_status: ['pending', Validators.required],
      issue_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();

    const id = this.route.snapshot.paramMap.get('id');
    const queryAppointmentId = this.route.snapshot.queryParamMap.get('appointment_id');

    if (queryAppointmentId) {
      this.invoiceForm.patchValue({ appointment_id: Number(queryAppointmentId) });
    }

    // Set default issue date to today
    if (!id) {
      const today = new Date();
      this.invoiceForm.patchValue({
        issue_date: this.formatDateForInput(today)
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

  loadInvoice(id: number): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoiceForm.patchValue({
          appointment_id: invoice.appointment_id,
          total_amount: invoice.total_amount,
          payment_status: invoice.payment_status,
          issue_date: this.formatDateForInput(new Date(invoice.issue_date))
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load invoice';
        console.error('Error loading invoice:', error);
      }
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const invoiceData: Invoice = {
      ...this.invoiceForm.value,
      appointment_id: Number(this.invoiceForm.value.appointment_id),
      total_amount: Number(this.invoiceForm.value.total_amount),
      issue_date: new Date(this.invoiceForm.value.issue_date)
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

  get appointmentId() { return this.invoiceForm.get('appointment_id'); }
  get totalAmount() { return this.invoiceForm.get('total_amount'); }
  get paymentStatus() { return this.invoiceForm.get('payment_status'); }
  get issueDate() { return this.invoiceForm.get('issue_date'); }
}
