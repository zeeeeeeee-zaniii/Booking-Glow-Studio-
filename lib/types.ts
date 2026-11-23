export interface Service {
  id: string;
  name: string;
  price_rs: number;
  duration_min: number;
  is_active: boolean;
  created_at?: string;
}

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export interface Booking {
  id: string;
  reference: string;
  service_id: string | null;
  service_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  customer_name: string;
  phone: string;
  status: BookingStatus;
  created_at?: string;
}

/** Used only when Supabase is not configured yet, so the demo still
 *  shows the full service menu. Matches the README seed data. */
export const FALLBACK_SERVICES: Service[] = [
  { id: "seed-1", name: "Signature Facial", price_rs: 2500, duration_min: 60, is_active: true },
  { id: "seed-2", name: "Haircut & Styling", price_rs: 1200, duration_min: 45, is_active: true },
  { id: "seed-3", name: "Manicure", price_rs: 900, duration_min: 30, is_active: true },
  { id: "seed-4", name: "Pedicure", price_rs: 1100, duration_min: 40, is_active: true },
  { id: "seed-5", name: "Bridal Trial Makeup", price_rs: 5000, duration_min: 90, is_active: true },
  { id: "seed-6", name: "Hair Spa", price_rs: 1800, duration_min: 50, is_active: true },
];
