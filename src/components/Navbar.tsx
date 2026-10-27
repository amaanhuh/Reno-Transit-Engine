import React, { useState } from 'react';
import { useBus, AppTab } from '../context/BusContext';
import {
  Bus,
  Ticket,
  MapPin,
  Calendar,
  ShieldCheck,
  Lock,
  UserCheck,
  MoreVertical,
  X,
  ChevronRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, bookings, isExecutive, executiveUser } = useBus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: AppTab;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ReactNode;
    count?: number;
    badge?: string;
  }[] = [
    {
      id: 'book',
      label: 'Book Tickets',
      shortLabel: 'Book',
      description: 'Search routes & pick cabin seats',
      icon: <Ticket className="w-4 h-4" />,
    },
    {
      id: 'routes',
      label: 'Routes & Fleet',
      shortLabel: 'Routes',
      description: 'Live availability & coach specs',
      icon: <Bus className="w-4 h-4" />,
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      shortLabel: 'Bookings',
      description: 'View passes & manage cancellations',
      icon: <MapPin className="w-4 h-4" />,
      count: bookings.length,
    },
    {
      id: 'schedules',
      label: 'Schedules',
      shortLabel: 'Schedules',
      description: 'City-by-city departure timetables',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Executive Console',
      shortLabel: 'Executive',
      description: 'Financial ledger & fleet audit',
      icon: isExecutive ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-500" />,
      badge: isExecutive ? 'Active' : undefined,
    },
  ];

  const handleMobileNavClick = (tabId: AppTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('book')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap block">
                Reno Transit Engine
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono block -mt-0.5">
                Intercity Transit & Fleet
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links (Screens >= 768px) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                        item.badge === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="font-mono text-[10px] text-slate-500 ml-0.5">
                      ({item.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Area: Quick Action & Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {isExecutive && (
              <button
                onClick={() => setActiveTab('reports')}
                title="Executive Clearance Active"
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono truncate max-w-[80px] sm:max-w-[110px]">
                  {executiveUser?.name || 'Exec'}
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('book')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer min-h-[36px]"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>

            {/* HIGHLY VISIBLE THREE DOTS MENU BUTTON FOR MOBILE */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              title="Menu"
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 border border-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.5] text-slate-900" />
              ) : (
                <MoreVertical className="w-5 h-5 stroke-[2.5] text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Featured Mobile Slide-Over / Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-start bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                      Reno Transit Engine
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Intercity Navigation
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Drawer Links List */}
              <div className="p-3 space-y-1.5">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                                  item.badge === 'Active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.count !== undefined && item.count > 0 && (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.count}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Status */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-500">Executive Clearance:</span>
                <span className="font-mono font-bold text-slate-800">
                  {isExecutive ? 'AUTHORIZED' : 'RESTRICTED'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMobileNavClick('book')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Start New Reservation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Fixed Mobile Bottom Navigation Bar (5 core tabs evenly spaced) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] px-1 py-1 flex items-center justify-between no-print">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors min-h-[48px] cursor-pointer ${
            activeTab === 'book' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Book</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors min-h-[48px] cursor-pointer ${
            activeTab === 'routes' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bus className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Routes</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors min-h-[48px] relative cursor-pointer ${
            activeTab === 'bookings' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          {bookings.length > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
              {bookings.length}
            </span>
          )}
          <span className="text-[10px] tracking-tight">Bookings</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors min-h-[48px] cursor-pointer ${
            activeTab === 'schedules' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Schedules</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors min-h-[48px] cursor-pointer ${
            activeTab === 'reports' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {isExecutive ? (
            <ShieldCheck className="w-5 h-5 mb-0.5 text-emerald-600" />
          ) : (
            <Lock className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] tracking-tight">Executive</span>
        </button>
      </nav>
    </>
  );
};
