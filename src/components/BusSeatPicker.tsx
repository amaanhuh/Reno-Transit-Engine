import React, { useState, useMemo } from 'react';
import { BusRoute } from '../types/bus';
import { useBus } from '../context/BusContext';
import { Check, X, Filter, RotateCcw } from 'lucide-react';

interface BusSeatPickerProps {
  route: BusRoute;
  selectedSeats: string[];
  onToggleSeat: (seatLabel: string) => void;
  maxSeatsSelectable?: number;
}

export const BusSeatPicker: React.FC<BusSeatPickerProps> = ({
  route,
  selectedSeats,
  onToggleSeat,
  maxSeatsSelectable = 8,
}) => {
  const { bookings } = useBus();

  // Real-time lookup of occupied seats for THIS specific coach from all confirmed bookings
  const occupiedSeatSet = useMemo(() => {
    const set = new Set<string>();
    bookings
      .filter((b) => b.route_id === route.route_id && b.status === 'Confirmed')
      .forEach((b) => {
        b.seat_numbers.forEach((seat) => set.add(seat));
      });
    return set;
  }, [bookings, route.route_id]);

  const total = route.total_seats;
  const bookedCount = occupiedSeatSet.size;
  const availableCount = Math.max(0, total - bookedCount);

  // View filter: 'all' | 'available' | 'selected' | 'occupied'
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'selected' | 'occupied'>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate complete seat layout for this coach
  const totalRows = Math.ceil(total / 4);
  const seatsData: { id: string; label: string; isOccupied: boolean; isWindow: boolean }[] = [];

  let count = 0;
  for (let r = 1; r <= totalRows; r++) {
    const cols = ['A', 'B', 'C', 'D'];
    for (let c = 0; c < cols.length; c++) {
      if (count >= total) break;
      const label = `${cols[c]}${r}`;
      // A seat is occupied if it exists in confirmed bookings for this coach
      const isOccupied = occupiedSeatSet.has(label);
      const isWindow = c === 0 || c === 3;
      seatsData.push({ id: label, label, isOccupied, isWindow });
      count++;
    }
  }

  // Action 1: Handle clicking "Available" button
  const handleAvailableClick = () => {
    if (activeFilter === 'available') {
      setActiveFilter('all');
      setStatusMessage(null);
    } else {
      setActiveFilter('available');
      // If user hasn't selected any seats, auto-pick next free seat for convenience
      if (selectedSeats.length === 0) {
        const nextFree = seatsData.find((s) => !s.isOccupied);
        if (nextFree) {
          onToggleSeat(nextFree.label);
          setStatusMessage(`Highlighted available seats & picked ${nextFree.label}`);
          return;
        }
      }
      setStatusMessage(`Showing ${availableCount} available seats in ${route.route_id}`);
    }
  };

  // Action 2: Handle clicking "Selected" button
  const handleSelectedClick = () => {
    if (activeFilter === 'selected') {
      setActiveFilter('all');
      setStatusMessage(null);
    } else {
      setActiveFilter('selected');
      if (selectedSeats.length === 0) {
        setStatusMessage('No seats selected yet. Click any available seat in the cabin.');
      } else {
        setStatusMessage(`Active selection: ${selectedSeats.join(', ')} (${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''})`);
      }
    }
  };

  // Action 3: Handle clicking "Occupied" button
  const handleOccupiedClick = () => {
    if (activeFilter === 'occupied') {
      setActiveFilter('all');
      setStatusMessage(null);
    } else {
      setActiveFilter('occupied');
      setStatusMessage(`${bookedCount} seats booked by confirmed passengers on ${route.route_id}`);
    }
  };

  // Clear current active selection
  const handleClearSelected = () => {
    [...selectedSeats].forEach((seat) => onToggleSeat(seat));
    setStatusMessage('Selection cleared.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Cabin Seat Map</span>
            <span className="text-xs text-slate-500 font-normal">
              · Coach {route.route_id} ({total} Seats)
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any seat in the cabin to select. Booked seats automatically become occupied.
          </p>
        </div>

        {/* 3 Working Interactive Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {/* Button 1: Available */}
          <button
            type="button"
            onClick={handleAvailableClick}
            title="Click to highlight available seats or auto-select"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeFilter === 'available'
                ? 'bg-white text-emerald-700 shadow-2xs border border-emerald-300 ring-1 ring-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-400" />
            <span>Available ({availableCount})</span>
          </button>

          {/* Button 2: Selected */}
          <button
            type="button"
            onClick={handleSelectedClick}
            title="Click to highlight your selected seats"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeFilter === 'selected'
                ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded ${activeFilter === 'selected' ? 'bg-white' : 'bg-blue-600'}`} />
            <span>Selected ({selectedSeats.length})</span>
          </button>

          {/* Button 3: Occupied */}
          <button
            type="button"
            onClick={handleOccupiedClick}
            title="Click to highlight occupied / booked seats"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeFilter === 'occupied'
                ? 'bg-white text-slate-800 shadow-2xs border border-slate-300 ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded bg-slate-300 border border-slate-400" />
            <span>Occupied ({bookedCount})</span>
          </button>

          {/* Reset filter button */}
          {activeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setStatusMessage(null);
              }}
              className="text-[10px] font-mono text-blue-600 hover:underline px-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Status / Feedback Alert when clicking buttons */}
      {statusMessage && (
        <div className="mt-3 py-1.5 px-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between animate-in fade-in duration-150">
          <span className="flex items-center gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>{statusMessage}</span>
          </span>
          {selectedSeats.length > 0 && activeFilter === 'selected' && (
            <button
              type="button"
              onClick={handleClearSelected}
              className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      )}

      {/* Bus Shell Container */}
      <div className="mt-4 max-w-xs sm:max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner relative">
        {/* Front Windshield & Driver Bay */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-[11px] text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-700 font-bold shadow-2xs">
              ⎈
            </div>
            <span className="font-semibold text-slate-700">Driver Bay</span>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-semibold text-slate-700">
            Coach {route.route_id}
          </div>
        </div>

        {/* Column Headings */}
        <div className="grid grid-cols-5 text-center text-[10px] font-mono text-slate-400 mb-2 font-bold">
          <div>A (Win)</div>
          <div>B</div>
          <div className="text-slate-400 text-[9px] tracking-wider">AISLE</div>
          <div>C</div>
          <div>D (Win)</div>
        </div>

        {/* Rows Grid */}
        <div className="space-y-1.5">
          {Array.from({ length: totalRows }).map((_, rowIdx) => {
            const rowNumber = rowIdx + 1;
            const seatA = seatsData.find((s) => s.label === `A${rowNumber}`);
            const seatB = seatsData.find((s) => s.label === `B${rowNumber}`);
            const seatC = seatsData.find((s) => s.label === `C${rowNumber}`);
            const seatD = seatsData.find((s) => s.label === `D${rowNumber}`);

            const renderSeat = (seat?: typeof seatsData[0]) => {
              if (!seat) {
                return <div className="w-8 h-8 mx-auto opacity-0" />;
              }

              const isSelected = selectedSeats.includes(seat.label);

              // Filter highlight logic
              let dimClass = '';
              if (activeFilter === 'available' && seat.isOccupied) {
                dimClass = 'opacity-20 grayscale';
              } else if (activeFilter === 'selected' && !isSelected) {
                dimClass = 'opacity-20';
              } else if (activeFilter === 'occupied' && !seat.isOccupied) {
                dimClass = 'opacity-20';
              }

              if (seat.isOccupied) {
                return (
                  <button
                    key={seat.label}
                    type="button"
                    disabled
                    onClick={() => {
                      setStatusMessage(`Seat ${seat.label} is already booked on ${route.route_id}.`);
                    }}
                    title={`Seat ${seat.label} (Booked / Occupied)`}
                    className={`w-8 h-8 mx-auto rounded-md bg-slate-200 border border-slate-300 text-slate-400 text-[10px] font-mono flex items-center justify-center cursor-not-allowed select-none transition-all ${
                      activeFilter === 'occupied' ? 'ring-2 ring-slate-600 font-bold bg-slate-300 text-slate-700' : ''
                    } ${dimClass}`}
                  >
                    ✕
                  </button>
                );
              }

              return (
                <button
                  key={seat.label}
                  type="button"
                  onClick={() => onToggleSeat(seat.label)}
                  title={`Seat ${seat.label} (${isSelected ? 'Selected' : 'Available'})`}
                  className={`w-8 h-8 mx-auto rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center justify-center select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs scale-105 border border-blue-700'
                      : activeFilter === 'available'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-2xs'
                      : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-400 shadow-2xs'
                  } ${dimClass}`}
                >
                  {seat.label}
                </button>
              );
            };

            return (
              <div key={rowNumber} className="grid grid-cols-5 items-center gap-1.5">
                {renderSeat(seatA)}
                {renderSeat(seatB)}
                <div className="text-center font-mono text-[9px] text-slate-400 select-none">
                  {rowNumber}
                </div>
                {renderSeat(seatC)}
                {renderSeat(seatD)}
              </div>
            );
          })}
        </div>

        {/* Rear Cabin */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono">
          Rear Cabin · Luggage Compartment
        </div>
      </div>

      {/* Selected summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Chosen Seats ({selectedSeats.length}):
        </span>
        <span className="font-mono text-blue-600 font-bold">
          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Click any seat to select'}
        </span>
      </div>
    </div>
  );
};
