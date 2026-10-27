#!/usr/bin/env python3
"""
Smart Bus Ticket Booking & Reservation System
==============================================
PRD-Compliant Reference Implementation in Python 3.
Demonstrates structured in-memory data management, input validation,
seat capacity tracking, idempotent cancellations, and financial reporting.
"""

# Supported cities tuple (Section 07 - Feature 2)
SUPPORTED_CITIES = ('Karachi', 'Hyderabad', 'Sukkur', 'Mirpur Khas', 'Lahore')

# Initial route data stored as a list of dictionaries (Feature 2)
routes = [
    {
        "route_id": "R101",
        "departure_city": "Karachi",
        "destination_city": "Hyderabad",
        "departure_time": "08:00 AM",
        "ticket_price": 1200,
        "total_seats": 40,
        "available_seats": 40
    },
    {
        "route_id": "R102",
        "departure_city": "Karachi",
        "destination_city": "Sukkur",
        "departure_time": "09:30 AM",
        "ticket_price": 2000,
        "total_seats": 36,
        "available_seats": 36
    },
    {
        "route_id": "R103",
        "departure_city": "Hyderabad",
        "destination_city": "Mirpur Khas",
        "departure_time": "11:00 AM",
        "ticket_price": 800,
        "total_seats": 32,
        "available_seats": 32
    },
    {
        "route_id": "R104",
        "departure_city": "Karachi",
        "destination_city": "Lahore",
        "departure_time": "07:00 PM",
        "ticket_price": 5000,
        "total_seats": 45,
        "available_seats": 45
    },
    {
        "route_id": "R105",
        "departure_city": "Sukkur",
        "destination_city": "Hyderabad",
        "departure_time": "02:00 PM",
        "ticket_price": 1500,
        "total_seats": 30,
        "available_seats": 30
    }
]

# Set to track issued booking IDs and guarantee uniqueness (BR-06)
issued_booking_ids = set()

# List of booking dictionaries (Feature 5 & 6)
bookings = []

# Counter for deterministic booking ID generation
next_booking_number = 1001


def generate_booking_id() -> str:
    """Generate a unique booking ID starting with 'B' (e.g., B1001)."""
    global next_booking_number
    while True:
        bid = f"B{next_booking_number}"
        next_booking_number += 1
        if bid not in issued_booking_ids:
            issued_booking_ids.add(bid)
            return bid


def view_available_routes(filter_available_only: bool = False):
    """
    Feature 3: View Available Routes
    Displays route ID, journey, departure time, fare, and seats available.
    Uses enumerate() and continue to filter.
    """
    print("\n" + "=" * 65)
    print("                    AVAILABLE BUS ROUTES")
    print("=" * 65)
    print(f"{'No.':<4} {'Route':<7} {'Journey':<28} {'Depart':<10} {'Fare':<9} {'Seats':<10}")
    print("-" * 65)

    displayed_count = 0
    for idx, r in enumerate(routes, start=1):
        # Use continue to skip fully booked routes when filter is requested
        if filter_available_only and r["available_seats"] == 0:
            continue

        journey = f"{r['departure_city']} -> {r['destination_city']}"
        seats_str = f"{r['available_seats']}/{r['total_seats']}"
        if r["available_seats"] == 0:
            seats_str += " (Fully Booked)"

        fare_str = f"Rs.{r['ticket_price']}"
        print(f"{idx:<4} {r['route_id']:<7} {journey:<28} {r['departure_time']:<10} {fare_str:<9} {seats_str:<10}")
        displayed_count += 1

    if displayed_count == 0:
        print("No routes match the availability criteria.")
    print("-" * 65)


def search_for_route():
    """
    Feature 4: Search for a Route
    Search by route ID, departure city, or destination city with case-insensitivity.
    Uses for-else to display a no-match message.
    """
    print("\n--- Search for a Route ---")
    query = input("Enter route ID or city: ").strip()
    if not query:
        print("Search query cannot be empty.")
        return

    query_lower = query.lower()
    matches = []

    # Check for direct route ID match first
    for r in routes:
        if r["route_id"].lower() == query_lower:
            matches.append(r)
            break
    else:
        # If route ID didn't match via break, search departure and destination cities
        for r in routes:
            if (query_lower == r["departure_city"].lower() or
                query_lower == r["destination_city"].lower() or
                query_lower in r["departure_city"].lower() or
                query_lower in r["destination_city"].lower()):
                matches.append(r)

    if matches:
        print(f"\nFound {len(matches)} matching route(s):")
        print("-" * 65)
        for r in matches:
            seats_status = f"{r['available_seats']} seats available" if r["available_seats"] > 0 else "Fully Booked"
            print(f"{r['route_id']} | {r['departure_city']} -> {r['destination_city']} | Rs. {r['ticket_price']} | {r['departure_time']} | {seats_status}")
        print("-" * 65)
    else:
        print(f"No routes found matching '{query}'.")


def book_ticket():
    """
    Feature 5: Book a Ticket
    Collects and validates passenger name, age, route ID, and seat quantity.
    Enforces business rules BR-01 through BR-08.
    """
    print("\n--- Book a Ticket ---")

    # BR-01: Passenger name required
    name = input("Enter passenger name: ").strip()
    if not name:
        print("Validation Error (BR-01): Passenger name cannot be blank or whitespace.")
        return

    # BR-02: Age positive integer
    age_input = input("Enter passenger age: ").strip()
    if not age_input.isdigit():
        print("Validation Error (BR-02): Age must be a positive integer.")
        return
    age = int(age_input)
    if age <= 0 or age > 120:
        print("Validation Error (BR-02): Age must be greater than zero and realistic.")
        return

    # BR-03: Route must exist
    route_id_input = input("Enter route ID (e.g., R101): ").strip().upper()
    selected_route = None
    for r in routes:
        if r["route_id"].upper() == route_id_input:
            selected_route = r
            break

    if selected_route is None:
        print(f"Validation Error (BR-03): Route '{route_id_input}' does not exist.")
        return

    # BR-04: Seat quantity positive integer
    seats_input = input(f"Enter number of seats (Available: {selected_route['available_seats']}): ").strip()
    if not seats_input.isdigit():
        print("Validation Error (BR-04): Seat quantity must be a positive integer.")
        return
    seats = int(seats_input)
    if seats <= 0:
        print("Validation Error (BR-04): Seat quantity must be greater than zero.")
        return

    # BR-05: Requested seats <= availability
    if seats > selected_route["available_seats"]:
        print(f"Validation Error (BR-05): Requested {seats} seats, but only {selected_route['available_seats']} available.")
        return

    # Optional Enhancement (Section 16): 10% discount for 4 or more seats
    base_fare = selected_route["ticket_price"] * seats
    discount = 0
    if seats >= 4:
        discount = int(base_fare * 0.10)
    total_fare = base_fare - discount

    # BR-06: Unique Booking ID
    booking_id = generate_booking_id()

    # BR-08: State updates happen atomically after all validations pass
    selected_route["available_seats"] -= seats

    booking_record = {
        "booking_id": booking_id,
        "passenger_name": name,
        "passenger_age": age,
        "route_id": selected_route["route_id"],
        "departure_city": selected_route["departure_city"],
        "destination_city": selected_route["destination_city"],
        "departure_time": selected_route["departure_time"],
        "seats": seats,
        "fare_per_seat": selected_route["ticket_price"],
        "total_fare": total_fare,
        "discount": discount,
        "status": "Confirmed"
    }
    bookings.append(booking_record)

    # Show confirmation matching PRD Page 7 format
    print("\n" + "=" * 45)
    print("Booking confirmed!")
    print(f"Booking ID: {booking_id}")
    print(f"Passenger: {name}")
    print(f"Route: {selected_route['route_id']} ({selected_route['departure_city']} -> {selected_route['destination_city']})")
    print(f"Seats booked: {seats}")
    print(f"Fare per seat: Rs. {selected_route['ticket_price']}")
    if discount > 0:
        print(f"Subtotal: Rs. {base_fare} (10% bulk discount: -Rs. {discount})")
    print(f"Total fare: Rs. {total_fare}")
    print("Status: Confirmed")
    print("=" * 45)


def view_my_bookings():
    """
    Feature 6: View My Bookings
    Lists all bookings including cancelled ones.
    Uses enumerate() to number records.
    """
    print("\n" + "=" * 70)
    print("                        BOOKING RECORDS")
    print("=" * 70)

    if not bookings:
        print("No bookings found.")
        print("-" * 70)
        return

    print(f"{'No.':<4} {'Booking ID':<12} {'Passenger':<16} {'Route':<10} {'Seats':<7} {'Fare':<10} {'Status':<10}")
    print("-" * 70)
    for idx, b in enumerate(bookings, start=1):
        print(f"{idx:<4} {b['booking_id']:<12} {b['passenger_name']:<16} {b['route_id']:<10} {b['seats']:<7} Rs.{b['total_fare']:<7} {b['status']:<10}")
    print("-" * 70)


def cancel_booking():
    """
    Feature 7: Cancel a Booking
    Finds booking by ID, enforces BR-09 to BR-11:
    - Only Confirmed bookings can be cancelled.
    - Restores seats to original route exactly once.
    - Retains record in history with status 'Cancelled'.
    """
    print("\n--- Cancel a Booking ---")
    bid_input = input("Enter booking ID to cancel: ").strip().upper()
    if not bid_input:
        print("Booking ID cannot be blank.")
        return

    for b in bookings:
        if b["booking_id"].upper() == bid_input:
            # Check if already cancelled (BR-09, BR-10)
            if b["status"] == "Cancelled":
                print(f"Error (BR-09): Booking {b['booking_id']} is already Cancelled. Cannot cancel again.")
                return

            # Find matching route to restore seats
            target_route = None
            for r in routes:
                if r["route_id"] == b["route_id"]:
                    target_route = r
                    break

            # Atomically restore seats and update status
            b["status"] = "Cancelled"
            if target_route:
                target_route["available_seats"] += b["seats"]
                # Enforce BR-13 bound check
                if target_route["available_seats"] > target_route["total_seats"]:
                    target_route["available_seats"] = target_route["total_seats"]
                avail_seats = target_route["available_seats"]
            else:
                avail_seats = "Unknown"

            print(f"\nBooking {b['booking_id']} has been cancelled.")
            print(f"Seats restored: {b['seats']}")
            print(f"Route {b['route_id']} available seats: {avail_seats}")
            return
    else:
        # for-else handles booking not found
        print(f"Error: Booking ID '{bid_input}' was not found in records.")


def view_seat_availability():
    """
    Feature 8: View Seat Availability
    Shows available seats versus total capacity for every route.
    Classifies routes: Available, Partially Booked, Fully Booked.
    """
    print("\n" + "=" * 65)
    print("                    SEAT AVAILABILITY")
    print("=" * 65)
    print(f"{'Route':<8} {'Journey':<28} {'Capacity':<12} {'Available':<12} {'Status':<15}")
    print("-" * 65)

    for r in routes:
        total = r["total_seats"]
        avail = r["available_seats"]
        journey = f"{r['departure_city']} -> {r['destination_city']}"

        if avail == total:
            status = "Available"
        elif avail == 0:
            status = "Fully Booked"
        else:
            status = "Partially Booked"

        print(f"{r['route_id']:<8} {journey:<28} {total:<12} {avail:<12} {status:<15}")
    print("-" * 65)


def generate_booking_report():
    """
    Feature 9: Generate Booking Report
    Calculates:
    - Total bookings created
    - Confirmed bookings
    - Cancelled bookings
    - Seats currently reserved (Confirmed only)
    - Confirmed revenue (Confirmed only, excluding cancelled)
    - Fully booked routes
    Uses nested loops to aggregate confirmed bookings per route.
    """
    print("\n" + "=" * 50)
    print("                 BOOKING REPORT")
    print("=" * 50)

    total_created = len(bookings)
    confirmed_count = 0
    cancelled_count = 0
    reserved_seats = 0
    confirmed_revenue = 0

    # Scan bookings for totals
    for b in bookings:
        if b["status"] == "Confirmed":
            confirmed_count += 1
            reserved_seats += b["seats"]
            confirmed_revenue += b["total_fare"]
        elif b["status"] == "Cancelled":
            cancelled_count += 1

    # Count fully booked routes
    fully_booked_routes = 0
    for r in routes:
        if r["available_seats"] == 0:
            fully_booked_routes += 1

    print(f"Total bookings created: {total_created}")
    print(f"Confirmed bookings:     {confirmed_count}")
    print(f"Cancelled bookings:     {cancelled_count}")
    print(f"Seats currently reserved:{reserved_seats:>5}")
    print(f"Confirmed revenue:      Rs. {confirmed_revenue:,}")
    print(f"Fully booked routes:    {fully_booked_routes}")
    print("-" * 50)

    # Optional Enhancement: Revenue and bookings grouped by departure city
    print("\nRevenue Breakdown by Departure City:")
    for city in SUPPORTED_CITIES:
        city_rev = 0
        city_confirmed = 0
        for b in bookings:
            if b["status"] == "Confirmed":
                # Check route departure city
                for r in routes:
                    if r["route_id"] == b["route_id"] and r["departure_city"] == city:
                        city_rev += b["total_fare"]
                        city_confirmed += b["seats"]
        print(f"  {city:<15}: Rs. {city_rev:,} ({city_confirmed} seats reserved)")
    print("=" * 50)


def view_route_schedule():
    """
    Feature 10: Route Schedule by Departure City
    Uses outer loop over SUPPORTED_CITIES and inner loop over routes.
    Prints routes whose departure city matches the current city.
    If no route departs from a city, displays 'No scheduled departures.'
    """
    print("\n" + "=" * 55)
    print("         ROUTE SCHEDULE BY DEPARTURE CITY")
    print("=" * 55)

    for city in SUPPORTED_CITIES:
        print(f"\n{city}")
        matched = False
        for r in routes:
            if r["departure_city"] == city:
                matched = True
                print(f"  {r['route_id']} -> {r['destination_city']:<14} | {r['departure_time']}")
        if not matched:
            print("  No scheduled departures.")
    print("=" * 55)


def main():
    """Main menu loop with clear numbered options matching PRD Section 06."""
    while True:
        print("\nSMART BUS RESERVATION SYSTEM")
        print("================================")
        print("1. View Available Routes")
        print("2. Search for a Route")
        print("3. Book a Ticket")
        print("4. View My Bookings")
        print("5. Cancel a Booking")
        print("6. View Seat Availability")
        print("7. Generate Booking Report")
        print("8. View Route Schedule")
        print("9. Exit")
        print("================================")

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            filter_choice = input("Show only available routes? (y/n, default n): ").strip().lower()
            view_available_routes(filter_available_only=(filter_choice == 'y'))
        elif choice == "2":
            search_for_route()
        elif choice == "3":
            book_ticket()
        elif choice == "4":
            view_my_bookings()
        elif choice == "5":
            cancel_booking()
        elif choice == "6":
            view_seat_availability()
        elif choice == "7":
            generate_booking_report()
        elif choice == "8":
            view_route_schedule()
        elif choice == "9" or choice.lower() == "exit":
            print("\nThank you for using Smart Bus Reservation System. Goodbye!\n")
            break
        else:
            print(f"\nInvalid choice '{choice}'. Please select an option between 1 and 9.")


if __name__ == "__main__":
    main()
