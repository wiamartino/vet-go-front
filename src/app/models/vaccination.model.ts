export interface Vaccination {
  vaccination_id?: number;
  pet_id: number;
  vaccine_name: string;
  date_administered: Date;
  next_due_date: Date;
  veterinarian_id: number;
}
