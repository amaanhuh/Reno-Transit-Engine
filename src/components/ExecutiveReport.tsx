import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import { SUPPORTED_CITIES } from '../types/bus';
import {
  BarChart3,
  Download,
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  UserCheck,
  RotateCcw,
  Key,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ExecutiveReport: React.FC = () => {
  const {
    getReportSummary,
    routes,
    bookings,
    isExecutive,
    executiveUser,
    loginAsExecutive,
    logoutExecutive,
    updateExecutivePin,
    resetToFreshSession,
  } = useBus();

  const summary = getReportSummary();

  // Security Login Form State
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Change PIN Modal / Panel State
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);

  // Reset State Confirmation Modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginAsExecutive(pinInput);
    if (!res.success) {
      setAuthError(res.message);
    } else {
      setPinInput('');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    if (newPinInput !== confirmPinInput) {
      setPinChangeError('New PIN and confirmation PIN do not match.');
      return;
    }

    if (newPinInput.length < 4) {
      setPinChangeError('New PIN must be at least 4 characters long.');
      return;
    }

    const res = updateExecutivePin(currentPinInput, newPinInput);
    if (!res.success) {
      setPinChangeError(res.message);
    } else {
      setPinChangeSuccess('Security PIN updated successfully! Remember this PIN for your next session.');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => {
        setShowChangePin(false);
        setPinChangeSuccess(null);
      }, 2500);
    }
  };

  const handleConfirmResetState = () => {
    resetToFreshSession();
    setShowResetConfirm(false);
  };

  const handleExportCSV = () => {
    let csv = 'Type,ID,Passenger,Age,Category,Route,Departure,Destination,Seats,Fare,Status,Date\n';
    bookings.forEach((b) => {
      csv += `Booking,${b.booking_id},"${b.passenger_name}",${b.passenger_age},${b.category},${b.route_id},${b.departure_city},${b.destination_city},${b.seats},${b.total_fare},${b.status},${b.created_at}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reno_transit_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If user is not authenticated as an Executive, display the Secure Gate
  if (!isExecutive) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-bold block mb-1">
              Reno Transit Engine · Restricted Access
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Executive Console
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Financial revenue logs, operational seat manifests, and system state controls are restricted strictly to verified transit executives and operations leadership.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Executive Security PIN
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Required
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter 4-digit Executive PIN..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 block mt-1.5">
                Default Master PIN: <strong className="font-mono text-slate-800">2026</strong> (You can change this PIN once inside).
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize Executive Session</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Executive Console View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Executive Clearance Header Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
                EXECUTIVE SESSION ACTIVE
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {executiveUser?.badgeId}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {executiveUser?.name} — {executiveUser?.title}
            </h3>
          </div>
        </div>

        {/* Executive Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Executive-Only Reset State Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset system to clean initial state (Executive Only)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Fleet State</span>
          </button>

          {/* Change PIN Button */}
          <button
            onClick={() => setShowChangePin(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>Change PIN</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Lock Console Button */}
          <button
            onClick={logoutExecutive}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Executive Operations & Fleet Financial Audit</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time reconciliation of reservations, passenger capacities, and net confirmed revenue strictly excluding cancelled fares (PRD Feature 9).
        </p>
      </div>

      {/* 6 Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Bookings Created */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
            Total Bookings Created
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {summary.totalBookingsCreated}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              All records
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Confirmed & cancelled in-memory
          </div>
        </div>

        {/* Confirmed Active Bookings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
            Confirmed Active Bookings
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {summary.confirmedBookings}
            </span>
            <span className="text-xs text-emerald-600 font-mono font-medium">
              {summary.totalBookingsCreated > 0
                ? `${Math.round((summary.confirmedBookings / summary.totalBookingsCreated) * 100)}% active`
                : '0%'}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Occupying confirmed coach seats
          </div>
        </div>

        {/* Cancelled Bookings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
            Cancelled Bookings
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600 font-mono tabular-nums">
              {summary.cancelledBookings}
            </span>
            <span className="text-xs text-rose-600 font-mono font-medium">
              Seats restored
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            PRD BR-11: retained in history
          </div>
        </div>

        {/* Seats Currently Reserved */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
            Seats Currently Reserved
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
              {summary.seatsCurrentlyReserved}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {routes.reduce((acc, r) => acc + r.total_seats, 0)} total
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Sum of confirmed passenger seats
          </div>
        </div>

        {/* Confirmed Net Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
            Confirmed Net Revenue
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              Rs. {summary.confirmedRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              PKR
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            BR-12: Excludes cancelled fares
          </div>
        </div>

        {/* Fully Booked Routes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
            Fully Booked Coaches
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800 font-mono tabular-nums">
              {summary.fullyBookedRoutes}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              of {routes.length} routes
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Coaches with 0 available seats
          </div>
        </div>
      </div>

      {/* Regional City Revenue Breakdown & Most Popular Route */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Regional City Revenue Breakdown */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">
              Revenue Grouped by Departure City (PRD Section 16)
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Net Confirmed
            </span>
          </div>

          <div className="space-y-3">
            {SUPPORTED_CITIES.map((city) => {
              const data = summary.revenueByCity[city] || { revenue: 0, seats: 0 };
              const percentOfTotal =
                summary.confirmedRevenue > 0
                  ? Math.round((data.revenue / summary.confirmedRevenue) * 100)
                  : 0;

              return (
                <div key={city} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">{city} Central Hub</span>
                    <span className="font-mono text-slate-700">
                      Rs. {data.revenue.toLocaleString()}{' '}
                      <span className="text-slate-400 font-normal">
                        ({data.seats} seats · {percentOfTotal}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${percentOfTotal}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Popular Route Highlight */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">
              Top Demand Route
            </h3>
            <span className="text-xs font-mono text-blue-600 font-bold">
              By Occupancy
            </span>
          </div>

          {summary.mostPopularRoute ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-base text-blue-600">
                  {summary.mostPopularRoute.route_id}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Highest Volume
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {summary.mostPopularRoute.journey}
              </div>
              <div className="text-xs text-slate-600">
                Total Confirmed Seats Booked:{' '}
                <strong className="text-slate-900 font-mono">{summary.mostPopularRoute.seats} Seats</strong>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No active bookings recorded yet.
            </div>
          )}

          {/* Console Format Preview */}
          <div className="pt-1">
            <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">
              PRD Console Spec Preview:
            </span>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
{`BOOKING REPORT
Total bookings created: ${summary.totalBookingsCreated}
Confirmed bookings:     ${summary.confirmedBookings}
Cancelled bookings:     ${summary.cancelledBookings}
Seats currently reserved:${summary.seatsCurrentlyReserved.toString().padStart(4, ' ')}
Confirmed revenue:      Rs. ${summary.confirmedRevenue.toLocaleString()}
Fully booked routes:    ${summary.fullyBookedRoutes}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Change PIN Modal Dialog */}
      {showChangePin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Executive PIN</h3>
                <span className="text-xs text-slate-500">Update master security clearance key</span>
              </div>
            </div>

            {pinChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {pinChangeError}
              </div>
            )}

            {pinChangeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pinChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current PIN..."
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono tracking-widest focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New PIN (min 4 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new PIN..."
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono tracking-widest focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new PIN..."
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono tracking-widest focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePin(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset State Confirmation Modal (Executive Only) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Fleet System State?</h3>
                <span className="text-xs text-slate-500">Authorized Executive Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will clear all passenger reservations and reset all 5 coaches (R101 through R105) back to <strong className="text-slate-900">100% seat availability</strong>.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Current Bookings to wipe:</span>
                <span className="font-bold text-rose-600">{bookings.length} Records</span>
              </div>
              <div className="flex justify-between">
                <span>Coaches to restore:</span>
                <span className="font-bold text-emerald-600">5 Intercity Coaches (183 Seats)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetState}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Yes, Reset System
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
