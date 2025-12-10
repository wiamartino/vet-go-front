import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId?: number;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {
    this.clientForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clientId = Number(id);
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue(client);
      },
      error: (error) => {
        // Error interceptor handles the notification
        console.error('Error loading client:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.notificationService.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    const clientData: Client = this.clientForm.value;

    const operation = this.isEditMode
      ? this.clientService.updateClient(this.clientId!, clientData)
      : this.clientService.createClient(clientData);

    operation.subscribe({
      next: (client) => {
        const message = this.isEditMode ? 'Client updated successfully!' : 'Client created successfully!';
        this.notificationService.success(message);
        this.router.navigate(['/clients', client.client_id]);
      },
      error: (error) => {
        // Error interceptor handles the notification
        this.isLoading = false;
        console.error('Error saving client:', error);
      }
    });
  }

  get firstName() {
    return this.clientForm.get('first_name');
  }

  get lastName() {
    return this.clientForm.get('last_name');
  }

  get email() {
    return this.clientForm.get('email');
  }

  get phone() {
    return this.clientForm.get('phone');
  }

  get address() {
    return this.clientForm.get('address');
  }
}
