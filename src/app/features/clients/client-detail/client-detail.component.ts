import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { PetService } from '../../../core/services/pet.service';
import { Client, Pet } from '../../../models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  pets: Pet[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private petService: PetService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadClient(id);
      // this.loadClientPets(id);
    }
  }

  loadClient(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client = client;
        this.pets = client.pets || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load client details';
        this.isLoading = false;
        console.error('Error loading client:', error);
      }
    });
  }

  loadClientPets(clientId: number): void {
    this.petService.getPetsByClientId(clientId).subscribe({
      next: (pets) => {
        this.pets = pets;
      },
      error: (error) => {
        console.error('Error loading pets:', error);
      }
    });
  }

  deleteClient(): void {
    if (!this.client || !confirm('Are you sure you want to delete this client?')) {
      return;
    }

    this.clientService.deleteClient(this.client.client_id!).subscribe({
      next: () => {
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        alert('Failed to delete client');
        console.error('Error deleting client:', error);
      }
    });
  }
}
