import React, { useState, useEffect } from 'react';
import { useBus } from '../context/BusContext';
import { BusRoute, City, PassengerCategory, SUPPORTED_CITIES } from '../types/bus';
import { BusSeatPicker } from './BusSeatPicker';
import { Bus, Clock, ShieldCheck, Tag, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export const BookingFlow: React.FC = () => {
  const { routes, bookTicket, selectedRouteForBooking, setSelectedRouteForBooking, setActiveBoardingPass } = useBus();

  // Search & Filter State
  const [originCity, setOriginCity] = useState<string>('all');
  const [destCity, setDestCity] = useState<string>('all');
  const [travelDate, setTravelDate] = useState<string>('2026-10-27');

  // Selected route ID for booking form
  const [activeRouteId, setActiveRouteId] = useState<string>(
    selectedRouteForBooking?.route_id || routes[0]?.route_id || 'R101'
  );

  // Always derive the freshest route data from routes state
  const activeRoute = routes.find((r) => r.route_id === activeRouteId) || routes[0];

  // Form Fields
  const [passengerName, setPassengerName] = useState<string>('');
  const [passengerAge, setPassengerAge] = useState<string>('24');
  const [passengerCategory, setPassengerCategory] = useState<PassengerCategory>('Adult');
  const [seatCount, setSeatCount] = useState<number>(2);
  const [selectedSeatLabels, setSelectedSeatLabels] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync active route when selected from external component
  useEffect(() => {
    if (selectedRouteForBooking) {
      setActiveRouteId(selectedRouteForBooking.route_id);
      setSelectedSeatLabels([]);
    }
  }, [selectedRouteForBooking]);

  const handleToggleSeat = (seatLabel: string) => {
    if (selectedSeatLabels.includes(seatLabel)) {
      const next = selectedSeatLabels.filter((s) => s !== seatLabel);
      setSelectedSeatLabels(next);
      setSeatCount(Math.max(1, next.length));
    } else {
      if (selectedSeatLabels.length >= 8) {
        setValidationError('Maximum 8 seats can be selected per single booking.');
        return;
      }
      const next = [...selectedSeatLabels, seatLabel];
      setSelectedSeatLabels(next);
      setSeatCount(next.length);
      setValidationError(null);
    }
  };

  const handleSeatCountChange = (val: number) => {
    setSeatCount(val);
    if (selectedSeatLabels.length !== val) {
      setSelectedSeatLabels([]);
    }
    setValidationError(null);
  };

  // Filter routes based on origin/dest
  const filteredRoutes = routes.filter((r) => {
    if (originCity !== 'all' && r.departure_city !== originCity) return false;
    if (destCity !== 'all' && r.destination_city !== destCity) return false;
    return true;
  });

  // Calculate live fare and discounts
  const baseFare = activeRoute.ticket_price * seatCount;
  let categoryDiscountRate = 0;
  if (passengerCategory === 'Child') categoryDiscountRate = 0.20;
  if (passengerCategory === 'Senior') categoryDiscountRate = 0.15;

  const categoryDiscount = Math.round(baseFare * categoryDiscountRate);
  const afterCatFare = baseFare - categoryDiscount;
  const bulkDiscount = seatCount >= 4 ? Math.round(afterCatFare * 0.10) : 0;
  const totalDiscount = categoryDiscount + bulkDiscount;
  const finalFare = baseFare - totalDiscount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedAge = parseInt(passengerAge, 10);

    const result = bookTicket({
      passenger_name: passengerName,
      passenger_age: parsedAge,
      route_id: activeRoute.route_id,
      seats: seatCount,
      seat_numbers: selectedSeatLabels,
      category: passengerCategory,
    });

    if (!result.success) {
      setValidationError(result.error || 'Booking could not be completed.');
      return;
    }

    if (result.booking) {
      // NOTE: Removed all confetti/poppers as requested by user!
      setPassengerName('');
      setSelectedSeatLabels([]);
      setSeatCount(2);
      setSelectedRouteForBooking(null);

      // Instantly open the newly refined professional boarding pass
      setActiveBoardingPass(result.booking);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Welcome & Quick Search Strip */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-bold block mb-1">
            Reno Transit Engine · Intercity Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Reserve Your Journey in Seconds
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select origin, destination, and seats. Fast ticketing with real-time seat inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              From (Departure Hub)
            </label>
            <select
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="all">All Departure Cities</option>
              {SUPPORTED_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              To (Destination)
            </label>
            <select
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="all">All Destinations</option>
              {SUPPORTED_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setOriginCity('all');
                setDestCity('all');
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters ({routes.length} Routes)
            </button>
          </div>
        </div>
      </section>

      {/* Main 2-Column Booking Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-mono">
                Available Departures
              </h2>
              <p className="text-xs text-slate-500">
                Tap any scheduled coach to view cabin layout and reserve.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {filteredRoutes.length} options
            </span>
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-2xs">
              <Bus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No scheduled departures match criteria.</p>
              <button
                onClick={() => {
                  setOriginCity('all');
                  setDestCity('all');
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Show all routes
              </button>
            </div>
          ) : (
            filteredRoutes.map((r) => {
              const isSelected = activeRoute.route_id === r.route_id;
              const isFull = r.available_seats === 0;
              const percentLeft = Math.round((r.available_seats / r.total_seats) * 100);

              return (
                <div
                  key={r.route_id}
                  onClick={() => {
                    setActiveRouteId(r.route_id);
                    setSelectedSeatLabels([]);
                  }}
                  className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/30'
                      : 'bg-white hover:bg-slate-50/70 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600">
                          {r.route_id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-600 font-medium">
                          {r.bus_model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          {r.departure_city}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          {r.destination_city}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">
                        Per Seat
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                        Rs. {r.ticket_price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono text-slate-700 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{r.departure_time}</span>
                    </div>
                    <span>·</span>
                    <span>Duration: {r.duration_hrs}</span>
                    <span>·</span>
                    <span className="text-slate-500 truncate max-w-xs">
                      {r.amenities.slice(0, 3).join(', ')}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Seats:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {r.available_seats} / {r.total_seats}
                      </span>
                      {isFull ? (
                        <span className="text-[11px] font-bold text-rose-600">
                          (Fully Booked)
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                          ({percentLeft}% free)
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Coach'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Seat Picker & Booking Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Route Pill Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-xs font-mono uppercase text-slate-500">
                Coach Selected
              </span>
              <span className="text-xs font-mono font-bold text-blue-600">
                {activeRoute.route_id}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  {activeRoute.departure_city} → {activeRoute.destination_city}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Departure {activeRoute.departure_time}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Available</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  {activeRoute.available_seats} Seats
                </span>
              </div>
            </div>
          </div>

          {/* Bus Seat Picker */}
          <BusSeatPicker
            route={activeRoute}
            selectedSeats={selectedSeatLabels}
            onToggleSeat={handleToggleSeat}
            maxSeatsSelectable={Math.min(8, activeRoute.available_seats)}
          />

          {/* Passenger Information & Confirmation Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-2xs"
          >
            <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Passenger & Ticket Reservation</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Reno Engine
              </span>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {validationError}
              </div>
            )}

            {/* Field 1: Passenger Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Passenger Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed Raza"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Field 2 & 3: Passenger Age & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base sm:text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={passengerCategory}
                  onChange={(e) => setPassengerCategory(e.target.value as PassengerCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base sm:text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                >
                  <option value="Adult">Adult (Standard)</option>
                  <option value="Child">Child (20% Off)</option>
                  <option value="Senior">Senior (15% Off)</option>
                </select>
              </div>
            </div>

            {/* Field 4: Seats Count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Seat Quantity
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeRoute.available_seats} available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max={Math.min(8, Math.max(1, activeRoute.available_seats))}
                  value={seatCount}
                  onChange={(e) => handleSeatCountChange(parseInt(e.target.value, 10))}
                  disabled={activeRoute.available_seats === 0}
                  className="w-full accent-blue-600"
                />
                <span className="w-10 text-center font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                  {seatCount}
                </span>
              </div>
            </div>

            {/* Bulk Discount Notice */}
            {seatCount >= 4 && (
              <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <Tag className="w-4 h-4 shrink-0 text-blue-600" />
                <span>
                  <strong>10% Bulk Discount Applied:</strong> 4 or more seats reserved.
                </span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare ({seatCount} × Rs. {activeRoute.ticket_price})</span>
                <span className="font-mono text-slate-800">Rs. {baseFare.toLocaleString()}</span>
              </div>

              {categoryDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{passengerCategory} Concession</span>
                  <span className="font-mono">-Rs. {categoryDiscount.toLocaleString()}</span>
                </div>
              )}

              {bulkDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Bulk 10% Discount</span>
                  <span className="font-mono">-Rs. {bulkDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-900">Total Payable</span>
                <span className="text-blue-600 font-mono text-base">
                  Rs. {finalFare.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={activeRoute.available_seats === 0}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                activeRoute.available_seats === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {activeRoute.available_seats === 0
                  ? 'Route Fully Booked'
                  : `Confirm & Issue Booking (${seatCount} Seat${seatCount > 1 ? 's' : ''})`}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
