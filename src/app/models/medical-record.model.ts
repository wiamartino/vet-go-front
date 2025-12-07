export interface MedicalRecord {
  medical_record_id?: number;
  pet_id: number;
  date: Date;
  diagnosis: string;
  treatment: string;
  veterinarian_id: number;
}
