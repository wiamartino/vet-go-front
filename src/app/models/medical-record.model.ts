import { Appointment } from './appointment.model';
import { Pet } from './pet.model';
import { Veterinarian } from './veterinarian.model';

export interface MedicalRecord {
  medical_record_id?: number;
  pet_id: number;
  veterinarian_id: number;
  appointment_id?: number;
  visit_date: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  weight?: number;
  temperature?: number;
  heart_rate?: number;
  created_at?: string;
  updated_at?: string;
  appointment?: Appointment;
  pet?: Pet;
  veterinarian?: Veterinarian;
}
