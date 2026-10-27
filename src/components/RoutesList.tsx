import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import { BusRoute } from '../types/bus';
import { Search, Filter, Bus, Clock, ArrowRight, Ticket } from 'lucide-react';

export const RoutesList: React.FC = () => {
  const { routes, setSelectedRouteForBooking, setActiveTab } = useBus();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Search by route ID, departure city, destination city
  const filteredRoutes = routes.filter((r) => {
    if (availableOnly && r.available_seats === 0) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      r.route_id.toLowerCase().includes(q) ||
      r.departure_city.toLowerCase().includes(q) ||
      r.destination_city.toLowerCase().includes(q)
    );
  });

  const handleBookRoute = (route: BusRoute) => {
    setSelectedRouteForBooking(route);
    setActiveTab('book');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fleet Routes & Live Availability
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time intercity schedules, capacity gauges, and fare specifications (PRD Features 2, 3 & 8).
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search route ID or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shrink-0 ${
              availableOnly
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Available Only</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View (Screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredRoutes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-2xs">
            <Bus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No routes match your query.</p>
          </div>
        ) : (
          filteredRoutes.map((r) => {
            const isAvailable = r.available_seats > 0;
            const isFullyBooked = r.available_seats === 0;
            const percent = Math.round((r.available_seats / r.total_seats) * 100);

            return (
              <div
                key={r.route_id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                      {r.route_id}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-base font-extrabold text-slate-900">
                      <span>{r.departure_city}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.destination_city}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {r.departure_time} · {r.duration_hrs}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Fare</span>
                    <span className="text-base font-mono font-extrabold text-slate-900">
                      Rs. {r.ticket_price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">
                      {r.available_seats}/{r.total_seats} Seats
                    </span>
                    {isFullyBooked ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Full
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {percent}% Left
                      </span>
                    )}
                  </div>

                  <button
                    disabled={!isAvailable}
                    onClick={() => handleBookRoute(r)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isAvailable
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Ticket className="w-3 h-3" />
                    <span>{isAvailable ? 'Book Coach' : 'Full'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* High-Density Desktop Table View (Screens >= 768px) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Route ID</th>
                <th className="py-3 px-4">Journey</th>
                <th className="py-3 px-4">Departure Time</th>
                <th className="py-3 px-4">Coach Specification</th>
                <th className="py-3 px-4 text-right">Fare (PKR)</th>
                <th className="py-3 px-4 text-center">Seat Capacity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Bus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No routes matched your query.</p>
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((r, idx) => {
                  const isAvailable = r.available_seats > 0;
                  const isFullyBooked = r.available_seats === 0;
                  const percent = Math.round((r.available_seats / r.total_seats) * 100);

                  let statusBadge = (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Available
                    </span>
                  );
                  if (isFullyBooked) {
                    statusBadge = (
                      <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                        Fully Booked
                      </span>
                    );
                  } else if (r.available_seats < r.total_seats) {
                    statusBadge = (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                        Partially Booked
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={r.route_id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {r.route_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{r.departure_city}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.destination_city}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Approx. {r.duration_hrs}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{r.departure_time}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">
                        {r.bus_model}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        Rs. {r.ticket_price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            {r.available_seats} / {r.total_seats}
                          </span>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                isFullyBooked
                                  ? 'bg-rose-500'
                                  : r.available_seats < 10
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs">
                        {statusBadge}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={!isAvailable}
                          onClick={() => handleBookRoute(r)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            isAvailable
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Ticket className="w-3 h-3" />
                          <span>{isAvailable ? 'Book' : 'Full'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Capacity KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-mono uppercase font-semibold">
            Total Fleet Capacity
          </span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {routes.reduce((acc, r) => acc + r.total_seats, 0)} Seats
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            5 Active intercity coaches
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-mono uppercase font-semibold">
            Available for Booking
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 block">
            {routes.reduce((acc, r) => acc + r.available_seats, 0)} Seats
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Synchronized live state
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] text-slate-500 block font-mono uppercase font-semibold">
            Fully Booked Coaches
          </span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1 block">
            {routes.filter((r) => r.available_seats === 0).length} Routes
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            PRD Feature 8 tracking
          </span>
        </div>
      </div>
    </div>
  );
};
