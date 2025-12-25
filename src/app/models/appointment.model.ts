import { Pet } from './pet.model';
import { Veterinarian } from './veterinarian.model';

export interface Appointment {
  appointment_id?: number;
  date: string;
  time: string;
  pet_id: number;
  veterinarian_id: number;
  reason_for_appointment: string;
  pet?: Pet;
  veterinarian?: Veterinarian;
}
