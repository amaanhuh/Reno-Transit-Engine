import React from 'react';
import { BusProvider, useBus } from './context/BusContext';
import { Navbar } from './components/Navbar';
import { BookingFlow } from './components/BookingFlow';
import { RoutesList } from './components/RoutesList';
import { BookingsManager } from './components/BookingsManager';
import { RouteSchedules } from './components/RouteSchedules';
import { ExecutiveReport } from './components/ExecutiveReport';
import { BoardingPassModal } from './components/BoardingPassModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, activeBoardingPass, setActiveBoardingPass, notification, clearNotification } = useBus();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600/10 selection:text-blue-700">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200 no-print">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${
              notification.type === 'success'
                ? 'bg-white border-emerald-200 text-emerald-900'
                : notification.type === 'error'
                ? 'bg-white border-rose-200 text-rose-900'
                : 'bg-white border-blue-200 text-blue-900'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />}
            {notification.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />}

            <div className="text-xs font-semibold leading-relaxed flex-1">
              {notification.message}
            </div>

            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 pb-24 lg:pb-16">
        {activeTab === 'book' && <BookingFlow />}
        {activeTab === 'routes' && <RoutesList />}
        {activeTab === 'bookings' && <BookingsManager />}
        {activeTab === 'schedules' && <RouteSchedules />}
        {activeTab === 'reports' && <ExecutiveReport />}
      </main>

      {/* Digital Boarding Pass Modal */}
      <BoardingPassModal
        booking={activeBoardingPass}
        onClose={() => setActiveBoardingPass(null)}
      />

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Reno Transit Engine</span>
            <span>·</span>
            <span>Intercity Mobility & Reservation System</span>
            <span>·</span>
            <span className="font-mono text-slate-400">PRD Standard</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>Karachi / Hyderabad / Sukkur / Mirpur Khas / Lahore</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BusProvider>
      <AppContent />
    </BusProvider>
  );
}
