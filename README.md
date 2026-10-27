# Smart Bus Ticket Booking & Reservation System

A production-grade, enterprise-ready Smart Bus Reservation & Fleet Management system built in compliance with the **Smart Bus Reservation System Product Requirements Document (PRD)**.

This repository features both:
1. **Interactive Python 3 Core Engine (`main.py`)**: Demonstrating foundational Python control flow, memory management, and deterministic state transitions.
2. **Modern Web Operations Portal & Live Terminal Emulator**: Built with React 19, TypeScript, and Tailwind CSS, featuring interactive seat allocation, boarding pass printing, revenue analytics, and an integrated in-browser terminal and automated test suite.

---

## 1. System Architecture & Features

### Core Modules (PRD Sections 06–10)
- **Feature 1 — Main Menu & Navigation**: Robust, repeatable navigation handling invalid inputs without crashing.
- **Feature 2 — Route Inventory**: Fictional starter routes connecting Karachi, Hyderabad, Sukkur, Mirpur Khas, and Lahore with real-time seat availability tracking.
- **Feature 3 — Available Routes View**: Tabular inspection using `enumerate()` with optional filtering of fully booked buses.
- **Feature 4 — Case-Insensitive Route Search**: Multi-modal lookup by Route ID, origin, or destination city with `for-else` fallback logic.
- **Feature 5 — Ticket Booking & Validation**:
  - Enforces BR-01 (non-blank passenger name), BR-02 (positive integer age), BR-03 (valid route ID), BR-04 (positive seat count), BR-05 (seat capacity ceiling), BR-06 (unique `B1001`+ booking IDs).
  - Calculates fare atomically; applies bulk discount (10% off for $\ge 4$ seats).
  - Decrements available seats only after all validations pass.
- **Feature 6 — Booking Audit Records**: Comprehensive log of active and cancelled reservations with status indicators.
- **Feature 7 — Idempotent Cancellation**:
  - Restores route seat count exactly once.
  - Retains cancelled records with status `Cancelled` for audit integrity.
  - Rejects duplicate cancellation attempts on already cancelled tickets.
- **Feature 8 — Seat Availability Matrix**: Dynamic status categorization (`Available`, `Partially Booked`, `Fully Booked`) bound within $[0, \text{total\_seats}]$.
- **Feature 9 — Executive Booking & Financial Report**:
  - Total bookings created, Confirmed bookings, Cancelled bookings.
  - Currently reserved seats (Confirmed only).
  - Confirmed revenue in PKR (excluding cancelled bookings).
  - Fully booked routes count and revenue by departure hub.
- **Feature 10 — Timetable & Schedules by City**:
  - Nested city-to-route lookup across all supported cities.
  - Explicit notification for transit hubs with "No scheduled departures".

---

## 2. Technical Requirements

- **Python Version**: Python 3.8+ (No external third-party dependencies required; runs purely on the Python standard library).
- **Web App**: Node.js 18+, Vite, React 19, Tailwind CSS v4, Lucide Icons, Motion.

---

## 3. How to Run

### Python 3 CLI
```bash
python3 main.py
```

### Web Application & Live In-Browser Console
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the full visual booking engine, live seat map, ticket generator, and integrated browser terminal.

---

## 4. Sample Workflow Walkthrough

1. **Browse Routes**: Select Option `1` to review schedule, fares, and capacities.
2. **Search Journeys**: Select Option `2` and enter `Hyderabad` to filter intercity links.
3. **Reserve Seats**: Select Option `3` and provide:
   - Name: `Ahmed`
   - Age: `24`
   - Route ID: `R101`
   - Seats: `2`
   - Outcome: Unique booking ID `B1001` generated, fare `Rs. 2,400`, `R101` seats decrease from 40 to 38.
4. **Audit History**: Select Option `4` to inspect the confirmed reservation.
5. **Cancel Ticket**: Select Option `5` and enter `B1001`.
   - Outcome: Status shifts to `Cancelled`, 2 seats restored to `R101` (back to 40).
6. **Executive Report**: Select Option `7` to verify total revenue correctly excludes cancelled bookings.

---

## 5. Storage Limitation & Constraints (PRD Section 05)

- **In-Memory Storage**: Following PRD specifications, all route updates, booking records, and issued ID sets are maintained in volatile memory during the runtime session.
- **Session Reset**: Restarting the application resets seat allocations and booking history back to baseline defaults.
