import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VeterinarianService } from '../../../services/veterinarian.service';
import { Veterinarian } from '../../../models';

@Component({
  selector: 'app-veterinarian-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './veterinarian-list.component.html',
  styleUrls: ['./veterinarian-list.component.scss']
})
export class VeterinarianListComponent implements OnInit {
  veterinarians: Veterinarian[] = [];
  isLoading = true;

  constructor(private veterinarianService: VeterinarianService) {}

  ngOnInit(): void {
    this.veterinarianService.getAllVeterinarians().subscribe({
      next: (data: Veterinarian[]) => {
        this.veterinarians = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}