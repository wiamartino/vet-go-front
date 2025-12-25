import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PetService } from '../../../core/services/pet.service';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { Appointment, Pet, Veterinarian } from '../../../models';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isEditMode ? 'Edit Appointment' : 'Schedule Appointment' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update appointment details' : 'Schedule a new appointment for a pet' }}</p>
        </div>

        <div class="mt-5 md:mt-0 md:col-span-2">
          <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
            <div class="shadow sm:rounded-md sm:overflow-hidden">
              <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
                  <p class="text-sm text-red-800">{{ errorMessage }}</p>
                </div>

                <div>
                  <label for="pet_id" class="block text-sm font-medium text-gray-700">Pet *</label>
                  <select id="pet_id" formControlName="pet_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select pet</option>
                    <option *ngFor="let pet of pets" [value]="pet.pet_id">{{ pet.name }} ({{ pet.species }})</option>
                  </select>
                  <div *ngIf="petId?.invalid && petId?.touched" class="mt-1 text-sm text-red-600">Pet is required</div>
                </div>

                <div>
                  <label for="veterinarian_id" class="block text-sm font-medium text-gray-700">Veterinarian *</label>
                  <select id="veterinarian_id" formControlName="veterinarian_id" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select veterinarian</option>
                    <option *ngFor="let vet of veterinarians" [value]="vet.veterinarian_id">Dr. {{ vet.first_name }} {{ vet.last_name }} - {{ vet.specialty }}</option>
                  </select>
                  <div *ngIf="veterinarianId?.invalid && veterinarianId?.touched" class="mt-1 text-sm text-red-600">Veterinarian is required</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="date" class="block text-sm font-medium text-gray-700">Date *</label>
                    <input type="date" id="date" formControlName="date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="date?.invalid && date?.touched" class="mt-1 text-sm text-red-600">Date is required</div>
                  </div>

                  <div>
                    <label for="time" class="block text-sm font-medium text-gray-700">Time *</label>
                    <input type="time" id="time" formControlName="time" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
                    <div *ngIf="time?.invalid && time?.touched" class="mt-1 text-sm text-red-600">Time is required</div>
                  </div>
                </div>

                <div>
                  <label for="reason_for_appointment" class="block text-sm font-medium text-gray-700">Reason for Appointment *</label>
                  <textarea id="reason_for_appointment" formControlName="reason_for_appointment" rows="3" placeholder="Describe the reason for this appointment..." class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"></textarea>
                  <div *ngIf="reasonForAppointment?.invalid && reasonForAppointment?.touched" class="mt-1 text-sm text-red-600">Reason is required</div>
                </div>
              </div>

              <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
                <a routerLink="/appointments" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</a>
                <button type="submit" [disabled]="appointmentForm.invalid || isLoading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Schedule') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  pets: Pet[] = [];
  veterinarians: Veterinarian[] = [];
  isEditMode = false;
  appointmentId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private petService: PetService,
    private veterinarianService: VeterinarianService
  ) {
    this.appointmentForm = this.fb.group({
      pet_id: ['', Validators.required],
      veterinarian_id: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason_for_appointment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPets();
    this.loadVeterinarians();

    const id = this.route.snapshot.paramMap.get('id');
    const queryPetId = this.route.snapshot.queryParamMap.get('pet_id');

    if (queryPetId) {
      this.appointmentForm.patchValue({ pet_id: Number(queryPetId) });
    }

    if (id) {
      this.isEditMode = true;
      this.appointmentId = Number(id);
      this.loadAppointment(this.appointmentId);
    }
  }

  loadPets(): void {
    this.petService.getAllPets().subscribe(pets => this.pets = pets);
  }

  loadVeterinarians(): void {
    this.veterinarianService.getAllVeterinarians().subscribe(vets => this.veterinarians = vets);
  }

  loadAppointment(id: number): void {
    this.appointmentService.getAppointmentById(id).subscribe(appointment => {
      this.appointmentForm.patchValue({
        pet_id: appointment.pet_id,
        veterinarian_id: appointment.veterinarian_id,
        date: this.formatDateForInput(appointment.date),
        time: this.formatTimeForInput(appointment.time),
        reason_for_appointment: appointment.reason_for_appointment
      });
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

  formatTimeForInput(time: string | Date): string {
    const t = new Date(time);
    if (Number.isNaN(t.getTime())) return '';
    const hours = String(t.getHours()).padStart(2, '0');
    const minutes = String(t.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.appointmentForm.value;
    const appointmentData: Appointment = {
      pet_id: Number(formValue.pet_id),
      veterinarian_id: Number(formValue.veterinarian_id),
      date: formValue.date,
      time: formValue.time,
      reason_for_appointment: formValue.reason_for_appointment
    };

    const operation = this.isEditMode
      ? this.appointmentService.updateAppointment(this.appointmentId!, appointmentData)
      : this.appointmentService.createAppointment(appointmentData);

    operation.subscribe({
      next: () => this.router.navigate(['/appointments']),
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to save appointment';
        this.isLoading = false;
      }
    });
  }

  get petId() { return this.appointmentForm.get('pet_id'); }
  get veterinarianId() { return this.appointmentForm.get('veterinarian_id'); }
  get date() { return this.appointmentForm.get('date'); }
  get time() { return this.appointmentForm.get('time'); }
  get reasonForAppointment() { return this.appointmentForm.get('reason_for_appointment'); }
}

