import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import { Booking } from '../types/bus';
import { Search, Ban, Ticket, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const BookingsManager: React.FC = () => {
  const { bookings, cancelBooking, setActiveBoardingPass } = useBus();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Cancelled'>('All');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [manualCancelId, setManualCancelId] = useState('');

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      b.booking_id.toLowerCase().includes(q) ||
      b.passenger_name.toLowerCase().includes(q) ||
      b.route_id.toLowerCase().includes(q) ||
      b.departure_city.toLowerCase().includes(q) ||
      b.destination_city.toLowerCase().includes(q)
    );
  });

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelBooking(cancelTarget.booking_id);
    setCancelTarget(null);
  };

  const handleManualCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCancelId.trim()) return;
    cancelBooking(manualCancelId.trim());
    setManualCancelId('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Bookings & Ticket History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs, digital pass access, and 1-click idempotent ticket cancellations (PRD Features 6 & 7).
          </p>
        </div>

        {/* Manual ID Cancellation Tool */}
        <form onSubmit={handleManualCancelSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cancel PNR (e.g. B1001)..."
            value={manualCancelId}
            onChange={(e) => setManualCancelId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 sm:py-1.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600 uppercase w-full sm:w-48 shadow-2xs"
          />
          <button
            type="submit"
            className="px-3.5 py-2 sm:py-1.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-colors cursor-pointer text-center"
          >
            Cancel PNR
          </button>
        </form>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search passenger or booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 sm:py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>

        {/* Status Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto justify-between sm:justify-start">
          {(['All', 'Confirmed', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer text-center ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Ticket Cards View (Screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-2xs">
            <Ticket className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No bookings found.</p>
            <p className="text-xs text-slate-400 mt-1">
              {bookings.length === 0
                ? 'Reserve tickets in Book Tickets tab to generate records.'
                : 'No bookings match your current search.'}
            </p>
          </div>
        ) : (
          filteredBookings.map((b, idx) => {
            const isConfirmed = b.status === 'Confirmed';

            return (
              <div
                key={b.booking_id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                {/* Header: ID, sequence & status */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-blue-600">
                      #{idx + 1} · {b.booking_id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {b.route_id}
                    </span>
                  </div>

                  {isConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Confirmed</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      <span>Cancelled</span>
                    </span>
                  )}
                </div>

                {/* Journey & Passenger */}
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <span>{b.departure_city}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.destination_city}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    <strong>{b.passenger_name}</strong> · Age {b.passenger_age} ({b.category})
                  </div>
                </div>

                {/* Departure, Seats & Fare summary */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Depart</span>
                    <span className="font-semibold text-slate-800">{b.departure_time}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Seats ({b.seats})</span>
                    <span className="font-bold text-blue-600 truncate block">
                      {b.seat_numbers.join(', ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Fare</span>
                    <span className="font-bold text-slate-900">Rs. {b.total_fare.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveBoardingPass(b)}
                    className="flex-1 py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>View Pass & PDF</span>
                  </button>

                  {isConfirmed ? (
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="py-2 px-3 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic px-2">
                      Seats Restored
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Bookings Table (Screens >= 768px) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Passenger Details</th>
                <th className="py-3 px-4">Route & Journey</th>
                <th className="py-3 px-4">Departure</th>
                <th className="py-3 px-4 text-center">Seats</th>
                <th className="py-3 px-4 text-right">Fare Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Ticket className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No bookings found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {bookings.length === 0
                        ? 'Reserve tickets in Book Tickets tab to generate records.'
                        : 'No bookings match your current search.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b, idx) => {
                  const isConfirmed = b.status === 'Confirmed';

                  return (
                    <tr
                      key={b.booking_id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {b.booking_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.passenger_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Age: {b.passenger_age} · {b.category}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{b.departure_city}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.destination_city}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Route {b.route_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {b.departure_time}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-mono font-bold text-slate-900">{b.seats}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {b.seat_numbers.join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        Rs. {b.total_fare.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveBoardingPass(b)}
                            title="View Boarding Pass"
                            className="p-1.5 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Ticket className="w-4 h-4" />
                          </button>

                          {isConfirmed ? (
                            <button
                              onClick={() => setCancelTarget(b)}
                              title="Cancel Ticket"
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Restored
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Booking {cancelTarget.booking_id}?</h3>
                <span className="text-xs text-slate-500">Atomic seat restoral & audit record</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This reservation will be marked as <strong className="text-rose-600">Cancelled</strong> and{' '}
              <strong className="font-mono text-emerald-600">{cancelTarget.seats} seat(s)</strong> will be immediately restored to{' '}
              <strong className="font-mono text-slate-900">{cancelTarget.route_id}</strong> ({cancelTarget.departure_city} → {cancelTarget.destination_city}).
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Passenger:</span>
                <span className="text-slate-900 font-bold">{cancelTarget.passenger_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Seats to restore:</span>
                <span className="text-emerald-700 font-bold">+{cancelTarget.seats} Seats</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fare deduction:</span>
                <span className="text-slate-900 font-bold">Rs. {cancelTarget.total_fare.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
