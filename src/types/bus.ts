export type City = 'Karachi' | 'Hyderabad' | 'Sukkur' | 'Mirpur Khas' | 'Lahore';

export const SUPPORTED_CITIES: readonly City[] = [
  'Karachi',
  'Hyderabad',
  'Sukkur',
  'Mirpur Khas',
  'Lahore',
] as const;

export interface BusRoute {
  route_id: string;
  departure_city: City;
  destination_city: City;
  departure_time: string;
  ticket_price: number;
  total_seats: number;
  available_seats: number;
  bus_model: string;
  duration_hrs: string;
  amenities: string[];
}

export type BookingStatus = 'Confirmed' | 'Cancelled';
export type PassengerCategory = 'Adult' | 'Child' | 'Senior';

export interface Booking {
  booking_id: string;
  passenger_name: string;
  passenger_age: number;
  route_id: string;
  departure_city: City;
  destination_city: City;
  departure_time: string;
  seats: number;
  seat_numbers: string[];
  category: PassengerCategory;
  fare_per_seat: number;
  subtotal: number;
  discount: number;
  total_fare: number;
  status: BookingStatus;
  created_at: string;
  cancelled_at?: string;
}

export interface BookingReportSummary {
  totalBookingsCreated: number;
  confirmedBookings: number;
  cancelledBookings: number;
  seatsCurrentlyReserved: number;
  confirmedRevenue: number;
  fullyBookedRoutes: number;
  revenueByCity: Record<City, { revenue: number; seats: number }>;
  mostPopularRoute: { route_id: string; journey: string; seats: number } | null;
}

export interface AcceptanceTestCase {
  id: string;
  scenario: string;
  inputDescription: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
  notes?: string;
}
