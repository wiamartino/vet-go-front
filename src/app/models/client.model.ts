import { Pet } from "./pet.model";

export interface Client {
  client_id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  pets?: Pet[];
}
