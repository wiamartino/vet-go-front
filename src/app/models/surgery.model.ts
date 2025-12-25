export type SurgeryStatus = 'scheduled' | 'in_progress' | 'completed';

export interface Surgery {
  surgery_id?: number;
  pet_id: number;
  surgery_type: string;
  date: string;
  veterinarian_id: number;
  notes: string;
  status: SurgeryStatus;
}
