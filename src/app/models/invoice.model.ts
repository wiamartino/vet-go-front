export interface Invoice {
  invoice_id?: number;
  appointment_id: number;
  total_amount: number;
  payment_status: string;
  issue_date: string;
}
