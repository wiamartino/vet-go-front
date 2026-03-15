import { Appointment } from './appointment.model';
import { Client } from './client.model';

export interface Invoice {
  invoice_id?: number;
  appointment_id: number;
  client_id: number;
  total: number;
  date: string;
  appointment?: Appointment;
  client?: Client;
}
