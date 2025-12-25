export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export interface Allergy {
  allergy_id?: number;
  pet_id: number;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  diagnosed_date: string;
}
