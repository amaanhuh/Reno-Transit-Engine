import React from 'react';
import { useBus } from '../context/BusContext';
import { SUPPORTED_CITIES, BusRoute } from '../types/bus';
import { Clock, ArrowRight, Ticket, Compass } from 'lucide-react';

export const RouteSchedules: React.FC = () => {
  const { routes, setSelectedRouteForBooking, setActiveTab } = useBus();

  const handleBook = (route: BusRoute) => {
    setSelectedRouteForBooking(route);
    setActiveTab('book');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-600" />
          <span>Intercity Terminal Departure Schedules</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Nested departure scheduling engine scanning all supported regional transit hubs (PRD Feature 10).
        </p>
      </div>

      {/* Grid of Cities / Hubs */}
      <div className="space-y-5">
        {SUPPORTED_CITIES.map((city) => {
          const departingRoutes = routes.filter((r) => r.departure_city === city);

          return (
            <div
              key={city}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              {/* City Hub Banner */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase font-mono">
                    {city} Central Terminal
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  {departingRoutes.length > 0
                    ? `${departingRoutes.length} Scheduled Service${departingRoutes.length > 1 ? 's' : ''}`
                    : 'Terminal Inactive'}
                </span>
              </div>

              {/* Departures List or 'No scheduled departures' */}
              <div className="p-4">
                {departingRoutes.length === 0 ? (
                  <div className="py-5 text-center text-slate-500">
                    <p className="font-mono text-xs text-slate-500 font-semibold">
                      No scheduled departures.
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Terminating destination only; return journeys available from origin hubs.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {departingRoutes.map((r) => {
                      const isFull = r.available_seats === 0;

                      return (
                        <div
                          key={r.route_id}
                          className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-blue-600">
                                {r.route_id}
                              </span>
                              <div className="flex items-center gap-1 text-xs font-mono text-slate-700 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{r.departure_time}</span>
                              </div>
                            </div>

                            <div className="mt-2.5 flex items-center gap-2 text-sm font-bold text-slate-900">
                              <span>{r.departure_city}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-blue-700">{r.destination_city}</span>
                            </div>

                            <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                              <span>{r.bus_model}</span>
                              <span className="text-slate-900 font-bold">Rs. {r.ticket_price}</span>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                            <span className="font-mono text-[11px]">
                              {isFull ? (
                                <strong className="text-rose-600">Fully Booked</strong>
                              ) : (
                                <span className="text-emerald-700 font-semibold">{r.available_seats} Seats Left</span>
                              )}
                            </span>

                            <button
                              disabled={isFull}
                              onClick={() => handleBook(r)}
                              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-bold transition-colors cursor-pointer ${
                                isFull
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                              }`}
                            >
                              <Ticket className="w-3 h-3" />
                              <span>Book</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
