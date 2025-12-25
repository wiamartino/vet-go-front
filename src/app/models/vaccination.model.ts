export interface Vaccination {
  vaccination_id?: number;
  pet_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  veterinarian_id: number;
}
