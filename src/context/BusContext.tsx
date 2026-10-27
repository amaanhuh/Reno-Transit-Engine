import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { BusRoute, Booking, BookingReportSummary, City, PassengerCategory, SUPPORTED_CITIES } from '../types/bus';
import { INITIAL_ROUTES, INITIAL_BOOKINGS } from '../data/initialData';

export type AppTab = 'book' | 'routes' | 'bookings' | 'schedules' | 'reports';

interface BookTicketParams {
  passenger_name: string;
  passenger_age: number;
  route_id: string;
  seats: number;
  seat_numbers?: string[];
  category?: PassengerCategory;
}

interface BusContextType {
  routes: BusRoute[];
  bookings: Booking[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedRouteForBooking: BusRoute | null;
  setSelectedRouteForBooking: (route: BusRoute | null) => void;
  activeBoardingPass: Booking | null;
  setActiveBoardingPass: (booking: Booking | null) => void;
  bookTicket: (params: BookTicketParams) => { success: boolean; booking?: Booking; error?: string };
  cancelBooking: (bookingId: string) => { success: boolean; message: string; seatsRestored?: number; newAvailable?: number };
  searchRoutes: (query: string) => BusRoute[];
  getReportSummary: () => BookingReportSummary;
  resetToFreshSession: () => void;
  loadDemoState: () => void;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  clearNotification: () => void;
  isExecutive: boolean;
  executiveUser: { name: string; title: string; badgeId: string } | null;
  loginAsExecutive: (pin: string) => { success: boolean; message: string };
  logoutExecutive: () => void;
  updateExecutivePin: (currentPin: string, newPin: string) => { success: boolean; message: string };
}

const BusContext = createContext<BusContextType | undefined>(undefined);

export const BusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<BusRoute[]>(INITIAL_ROUTES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<AppTab>('book');
  const [selectedRouteForBooking, setSelectedRouteForBooking] = useState<BusRoute | null>(null);
  const [activeBoardingPass, setActiveBoardingPass] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Executive Access State & Configurable PIN
  const [isExecutive, setIsExecutive] = useState<boolean>(false);
  const [executiveUser, setExecutiveUser] = useState<{ name: string; title: string; badgeId: string } | null>(null);
  const [executivePin, setExecutivePin] = useState<string>(() => {
    return localStorage.getItem('reno_transit_exec_pin') || '2026';
  });

  const loginAsExecutive = useCallback((pin: string) => {
    const clean = pin.trim();
    if (clean === executivePin) {
      setIsExecutive(true);
      setExecutiveUser({
        name: 'Director S. Jenkins',
        title: 'Executive VP of Fleet Operations',
        badgeId: 'RTE-EXEC-902',
      });
      showNotification('success', 'Executive clearance confirmed. Console unlocked.');
      return { success: true, message: 'Executive session authorized.' };
    } else {
      return { success: false, message: 'Incorrect executive security PIN. Access denied.' };
    }
  }, [executivePin, showNotification]);

  const updateExecutivePin = useCallback((currentPin: string, newPin: string) => {
    if (currentPin.trim() !== executivePin) {
      return { success: false, message: 'Current executive PIN does not match.' };
    }
    const cleanNew = newPin.trim();
    if (cleanNew.length < 4) {
      return { success: false, message: 'New security PIN must be at least 4 characters.' };
    }
    setExecutivePin(cleanNew);
    localStorage.setItem('reno_transit_exec_pin', cleanNew);
    showNotification('success', 'Executive security PIN updated successfully.');
    return { success: true, message: 'Executive PIN updated.' };
  }, [executivePin, showNotification]);

  const logoutExecutive = useCallback(() => {
    setIsExecutive(false);
    setExecutiveUser(null);
    showNotification('info', 'Executive session terminated.');
  }, [showNotification]);

  // Book a ticket with full validation rules BR-01 to BR-08
  const bookTicket = useCallback(
    ({ passenger_name, passenger_age, route_id, seats, seat_numbers = [], category = 'Adult' }: BookTicketParams) => {
      // BR-01: Passenger name required
      const trimmedName = passenger_name.trim();
      if (!trimmedName) {
        return { success: false, error: 'Validation Error (BR-01): Passenger name is required and cannot be blank.' };
      }

      // BR-02: Age positive integer
      if (!Number.isInteger(passenger_age) || passenger_age <= 0 || passenger_age > 120) {
        return { success: false, error: 'Validation Error (BR-02): Age must be a positive integer between 1 and 120.' };
      }

      // BR-03: Route must exist
      const targetRoute = routes.find((r) => r.route_id.toUpperCase() === route_id.trim().toUpperCase());
      if (!targetRoute) {
        return { success: false, error: `Validation Error (BR-03): Route '${route_id}' does not exist in inventory.` };
      }

      // BR-04: Seat quantity positive integer
      if (!Number.isInteger(seats) || seats <= 0) {
        return { success: false, error: 'Validation Error (BR-04): Seat quantity must be a positive integer greater than zero.' };
      }

      // BR-05: Requested seats <= availability
      if (seats > targetRoute.available_seats) {
        return {
          success: false,
          error: `Validation Error (BR-05): Requested ${seats} seats, but only ${targetRoute.available_seats} available on ${targetRoute.route_id}.`,
        };
      }

      // Determine next booking ID (B1001, B1002, etc.)
      const existingIds = new Set(bookings.map((b) => b.booking_id));
      let nextIdNum = 1001;
      while (existingIds.has(`B${nextIdNum}`)) {
        nextIdNum++;
      }
      const bookingId = `B${nextIdNum}`;

      // Calculations: PRD Section 16 enhancements
      const baseFare = targetRoute.ticket_price * seats;
      let categoryDiscountRate = 0;
      if (category === 'Child') categoryDiscountRate = 0.20; // 20% child discount
      if (category === 'Senior') categoryDiscountRate = 0.15; // 15% senior discount

      const categoryDiscount = Math.round(baseFare * categoryDiscountRate);
      const afterCatFare = baseFare - categoryDiscount;

      // 10% Bulk discount for 4 or more seats (PRD Enhancement)
      let bulkDiscount = 0;
      if (seats >= 4) {
        bulkDiscount = Math.round(afterCatFare * 0.10);
      }

      const totalDiscount = categoryDiscount + bulkDiscount;
      const totalFare = baseFare - totalDiscount;

      // Collect currently occupied seats for targetRoute
      const occupied = new Set<string>();
      bookings
        .filter((b) => b.route_id === targetRoute.route_id && b.status === 'Confirmed')
        .forEach((b) => b.seat_numbers.forEach((s) => occupied.add(s)));

      // If user provided specific seat numbers, verify none are already occupied
      let finalSeatNumbers = seat_numbers;
      if (finalSeatNumbers.length > 0) {
        const conflict = finalSeatNumbers.find((s) => occupied.has(s));
        if (conflict) {
          return {
            success: false,
            error: `Seat ${conflict} is already occupied on ${targetRoute.route_id}. Please select a different seat.`,
          };
        }
      }

      if (finalSeatNumbers.length !== seats) {
        // Auto-allocate only truly unoccupied seats across the coach
        const assignedLabels: string[] = [];
        const totalRows = Math.ceil(targetRoute.total_seats / 4);
        const cols = ['A', 'B', 'C', 'D'];

        outer: for (let r = 1; r <= totalRows; r++) {
          for (let c = 0; c < cols.length; c++) {
            if ((r - 1) * 4 + c >= targetRoute.total_seats) break;
            const label = `${cols[c]}${r}`;
            if (!occupied.has(label) && !assignedLabels.includes(label)) {
              assignedLabels.push(label);
              if (assignedLabels.length === seats) break outer;
            }
          }
        }
        finalSeatNumbers = assignedLabels;
      }

      const newBooking: Booking = {
        booking_id: bookingId,
        passenger_name: trimmedName,
        passenger_age,
        route_id: targetRoute.route_id,
        departure_city: targetRoute.departure_city,
        destination_city: targetRoute.destination_city,
        departure_time: targetRoute.departure_time,
        seats,
        seat_numbers: finalSeatNumbers,
        category,
        fare_per_seat: targetRoute.ticket_price,
        subtotal: baseFare,
        discount: totalDiscount,
        total_fare: totalFare,
        status: 'Confirmed',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

      // BR-08: Decrement seats atomically after all validations pass
      setRoutes((prevRoutes) =>
        prevRoutes.map((r) =>
          r.route_id === targetRoute.route_id
            ? { ...r, available_seats: r.available_seats - seats }
            : r
        )
      );

      setBookings((prev) => [newBooking, ...prev]);
      showNotification('success', `Booking ${bookingId} confirmed for ${trimmedName}! Total: Rs. ${totalFare.toLocaleString()}`);

      return { success: true, booking: newBooking };
    },
    [routes, bookings, showNotification]
  );

  // Cancel booking with BR-09 through BR-11 enforcement
  const cancelBooking = useCallback(
    (bookingId: string) => {
      const cleanId = bookingId.trim().toUpperCase();
      const bookingIndex = bookings.findIndex((b) => b.booking_id.toUpperCase() === cleanId);

      if (bookingIndex === -1) {
        showNotification('error', `Booking ID '${cleanId}' was not found in records.`);
        return { success: false, message: `Booking ID '${cleanId}' was not found.` };
      }

      const booking = bookings[bookingIndex];

      // BR-09: Only Confirmed booking can be cancelled
      if (booking.status === 'Cancelled') {
        const errorMsg = `Error (BR-09): Booking ${booking.booking_id} is already Cancelled. Cannot cancel again.`;
        showNotification('error', errorMsg);
        return { success: false, message: errorMsg };
      }

      // BR-10: Restore seats once & update status to Cancelled
      let seatsRestored = booking.seats;
      let newAvailableCount = 0;

      setRoutes((prevRoutes) =>
        prevRoutes.map((r) => {
          if (r.route_id === booking.route_id) {
            // BR-13: 0 <= available_seats <= total_seats
            const updated = Math.min(r.total_seats, r.available_seats + seatsRestored);
            newAvailableCount = updated;
            return { ...r, available_seats: updated };
          }
          return r;
        })
      );

      // BR-11: Retain booking record in history with status 'Cancelled'
      setBookings((prev) =>
        prev.map((b, idx) =>
          idx === bookingIndex
            ? {
                ...b,
                status: 'Cancelled',
                cancelled_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
              }
            : b
        )
      );

      const msg = `Booking ${booking.booking_id} has been cancelled. Restored ${seatsRestored} seats to ${booking.route_id}.`;
      showNotification('info', msg);

      return {
        success: true,
        message: msg,
        seatsRestored,
        newAvailable: newAvailableCount,
      };
    },
    [bookings, showNotification]
  );

  // Search routes by route_id, departure_city, or destination_city (Feature 4)
  const searchRoutes = useCallback(
    (query: string): BusRoute[] => {
      const q = query.trim().toLowerCase();
      if (!q) return routes;

      // Exact or partial match on route ID
      const routeIdMatch = routes.find((r) => r.route_id.toLowerCase() === q);
      if (routeIdMatch) {
        return [routeIdMatch];
      }

      // City match
      return routes.filter(
        (r) =>
          r.departure_city.toLowerCase().includes(q) ||
          r.destination_city.toLowerCase().includes(q) ||
          r.route_id.toLowerCase().includes(q)
      );
    },
    [routes]
  );

  // Generate Booking Report (Feature 9)
  const getReportSummary = useCallback((): BookingReportSummary => {
    let confirmedCount = 0;
    let cancelledCount = 0;
    let reservedSeats = 0;
    let confirmedRevenue = 0;

    const routeSeatCount: Record<string, { journey: string; seats: number }> = {};

    routes.forEach((r) => {
      routeSeatCount[r.route_id] = {
        journey: `${r.departure_city} -> ${r.destination_city}`,
        seats: 0,
      };
    });

    const revenueByCity: Record<City, { revenue: number; seats: number }> = {
      Karachi: { revenue: 0, seats: 0 },
      Hyderabad: { revenue: 0, seats: 0 },
      Sukkur: { revenue: 0, seats: 0 },
      'Mirpur Khas': { revenue: 0, seats: 0 },
      Lahore: { revenue: 0, seats: 0 },
    };

    bookings.forEach((b) => {
      if (b.status === 'Confirmed') {
        confirmedCount++;
        reservedSeats += b.seats;
        // BR-12: Sum fare from Confirmed records only
        confirmedRevenue += b.total_fare;

        if (routeSeatCount[b.route_id]) {
          routeSeatCount[b.route_id].seats += b.seats;
        }

        if (revenueByCity[b.departure_city]) {
          revenueByCity[b.departure_city].revenue += b.total_fare;
          revenueByCity[b.departure_city].seats += b.seats;
        }
      } else if (b.status === 'Cancelled') {
        cancelledCount++;
      }
    });

    // Fully booked routes (available_seats === 0)
    const fullyBookedRoutes = routes.filter((r) => r.available_seats === 0).length;

    // Most popular route
    let mostPopularRoute: { route_id: string; journey: string; seats: number } | null = null;
    let maxSeats = -1;
    Object.entries(routeSeatCount).forEach(([rid, info]) => {
      if (info.seats > maxSeats && info.seats > 0) {
        maxSeats = info.seats;
        mostPopularRoute = { route_id: rid, journey: info.journey, seats: info.seats };
      }
    });

    return {
      totalBookingsCreated: bookings.length,
      confirmedBookings: confirmedCount,
      cancelledBookings: cancelledCount,
      seatsCurrentlyReserved: reservedSeats,
      confirmedRevenue,
      fullyBookedRoutes,
      revenueByCity,
      mostPopularRoute,
    };
  }, [routes, bookings]);

  // Reset to fresh state (all 5 routes at full capacity, 0 bookings)
  const resetToFreshSession = useCallback(() => {
    setRoutes([
      { ...INITIAL_ROUTES[0], available_seats: 40 },
      { ...INITIAL_ROUTES[1], available_seats: 36 },
      { ...INITIAL_ROUTES[2], available_seats: 32 },
      { ...INITIAL_ROUTES[3], available_seats: 45 },
      { ...INITIAL_ROUTES[4], available_seats: 30 },
    ]);
    setBookings([]);
    showNotification('info', 'System reset to pristine fresh session (0 bookings, 100% seat availability).');
  }, [showNotification]);

  // Load illustrative demo data
  const loadDemoState = useCallback(() => {
    setRoutes(INITIAL_ROUTES);
    setBookings(INITIAL_BOOKINGS);
    showNotification('info', 'Loaded PRD reference dataset with Ahmed & Fatima bookings.');
  }, [showNotification]);

  const value = useMemo(
    () => ({
      routes,
      bookings,
      activeTab,
      setActiveTab,
      selectedRouteForBooking,
      setSelectedRouteForBooking,
      activeBoardingPass,
      setActiveBoardingPass,
      bookTicket,
      cancelBooking,
      searchRoutes,
      getReportSummary,
      resetToFreshSession,
      loadDemoState,
      notification,
      clearNotification,
      isExecutive,
      executiveUser,
      loginAsExecutive,
      logoutExecutive,
      updateExecutivePin,
    }),
    [
      routes,
      bookings,
      activeTab,
      selectedRouteForBooking,
      activeBoardingPass,
      bookTicket,
      cancelBooking,
      searchRoutes,
      getReportSummary,
      resetToFreshSession,
      loadDemoState,
      notification,
      clearNotification,
      isExecutive,
      executiveUser,
      loginAsExecutive,
      logoutExecutive,
      updateExecutivePin,
    ]
  );

  return <BusContext.Provider value={value}>{children}</BusContext.Provider>;
};

export const useBus = (): BusContextType => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
};
