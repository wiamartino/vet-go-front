export interface Appointment {
  appointment_id?: number;
  date: Date;
  time: Date;
  pet_id: number;
  veterinarian_id: number;
  reason_for_appointment: string;
}
