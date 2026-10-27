import React, { useEffect, useState } from 'react';
import { Booking } from '../types/bus';
import { Bus, Printer, X, Download, Copy, Check, ArrowRight, ShieldCheck, QrCode, FileText, Loader2 } from 'lucide-react';
import { downloadBoardingPassPdf } from '../utils/generateTicketPdf';

interface BoardingPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ booking, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!booking) return null;

  const isConfirmed = booking.status === 'Confirmed';

  // Handle PDF Generation & Download
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfSuccess(false);

    try {
      const ok = await downloadBoardingPassPdf(booking, 'boarding-pass-print');
      if (ok) {
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3000);
      }
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print button: triggers both PDF download and print view so user always gets the PDF document
  const handlePrint = async () => {
    // First trigger PDF download so the user definitely gets their document
    await handleDownloadPdf();

    // Also trigger system print dialog
    document.body.classList.add('print-active');
    try {
      window.print();
    } catch {
      // If print dialog is suppressed by iframe, fallback window is opened
      const printContents = document.getElementById('boarding-pass-print')?.innerHTML;
      if (printContents) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Reno Transit Engine - Boarding Pass ${booking.booking_id}</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap">
                <style>
                  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #0f172a; margin: 24px; padding: 0; }
                  .font-mono { font-family: 'JetBrains Mono', monospace; }
                </style>
              </head>
              <body>
                ${printContents}
                <script>window.onload = function() { window.print(); window.close(); }<\/script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } finally {
      setTimeout(() => {
        document.body.classList.remove('print-active');
      }, 1000);
    }
  };

  const handleCopyText = () => {
    const text = `RENO TRANSIT ENGINE - OFFICIAL BOARDING PASS
================================================
Booking Ref (PNR): RTE-${booking.booking_id}
Passenger:         ${booking.passenger_name} (${booking.passenger_age} yrs · ${booking.category})
Route:             ${booking.route_id} (${booking.departure_city} → ${booking.destination_city})
Departure Time:    ${booking.departure_time}
Seats Reserved:    ${booking.seats} [${booking.seat_numbers.join(', ')}]
Total Fare Paid:   PKR Rs. ${booking.total_fare.toLocaleString()}
Status:            ${booking.status.toUpperCase()}
Issued:            ${booking.created_at}
================================================
Present this digital or printed pass at the boarding gate.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const cityCodes: Record<string, string> = {
    Karachi: 'KHI',
    Hyderabad: 'HDD',
    Sukkur: 'SKZ',
    'Mirpur Khas': 'MPK',
    Lahore: 'LHE',
  };

  const originCode = cityCodes[booking.departure_city] || 'RTE';
  const destCode = cityCodes[booking.destination_city] || 'HUB';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50/90 gap-2.5">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase font-mono">
                Reno Transit Engine · E-Ticket
              </span>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Generating PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PDF Ready!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </>
              )}
            </button>

            {/* Print Boarding Pass Button */}
            <button
              id="print-boarding-pass-btn"
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Container */}
        <div className="p-4 sm:p-6 bg-slate-100/50">
          <div
            id="boarding-pass-print"
            className="printable-area bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden text-slate-900 relative"
          >
            {/* Top Brand Ribbon */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight font-mono uppercase">
                    Reno Transit Engine
                  </h3>
                  <p className="text-[10px] text-slate-300 font-mono tracking-wider">
                    INTERCITY EXPRESS MOBILITY · BOARDING PASS
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-300 font-mono block">
                  BOOKING REFERENCE
                </span>
                <span className="text-sm sm:text-base font-extrabold font-mono tracking-wider text-amber-400">
                  RTE-{booking.booking_id}
                </span>
              </div>
            </div>

            {/* Main Journey Header */}
            <div className="px-6 py-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                    {originCode}
                  </span>
                  <span className="block text-xs font-semibold text-slate-600">
                    {booking.departure_city}
                  </span>
                  <span className="text-[11px] font-mono text-blue-600 font-bold block mt-0.5">
                    Dep: {booking.departure_time}
                  </span>
                </div>

                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    {booking.route_id}
                  </span>
                  <div className="w-24 sm:w-36 h-0.5 bg-slate-300 my-1 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Non-Stop Express</span>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                    {destCode}
                  </span>
                  <span className="block text-xs font-semibold text-slate-600">
                    {booking.destination_city}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                    Central Terminal
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger & Journey Metadata Grid */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-200 bg-white">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  Passenger Name
                </span>
                <span className="font-bold text-slate-900 text-sm block truncate">
                  {booking.passenger_name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Age: {booking.passenger_age} · {booking.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  Seat Assignment
                </span>
                <span className="font-extrabold text-blue-600 text-sm font-mono block">
                  {booking.seat_numbers.length > 0 ? booking.seat_numbers.join(', ') : `${booking.seats} Seat(s)`}
                </span>
                <span className="text-[11px] text-slate-500">
                  {booking.seats} Reserved Seat{booking.seats > 1 ? 's' : ''}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  Platform / Bay
                </span>
                <span className="font-bold text-slate-800 text-sm font-mono block">
                  Bay 0{Math.max(1, (booking.passenger_age % 4) + 1)}
                </span>
                <span className="text-[11px] text-slate-500">
                  Boarding 15m prior
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  Total Fare Paid
                </span>
                <span className="font-extrabold text-emerald-700 text-sm font-mono block">
                  Rs. {booking.total_fare.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {booking.discount > 0 ? `Saved Rs. ${booking.discount}` : 'Standard Fare'}
                </span>
              </div>
            </div>

            {/* Barcode & Verification Stub */}
            <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Barcode graphic */}
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex items-center gap-1.5 mb-1.5 justify-center sm:justify-start">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    STATUS: {isConfirmed ? 'CONFIRMED & VALIDATED' : 'CANCELLED RECORD'}
                  </span>
                </div>

                <div className="h-10 flex items-center justify-center sm:justify-start gap-[2px] bg-white p-2 rounded-md border border-slate-200 overflow-hidden max-w-sm">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{
                        width: `${(i % 4 === 0 ? 3 : (i % 2 === 0 ? 1 : 2))}px`,
                        marginRight: `${(i % 3 === 0 ? 2 : 1)}px`,
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-slate-500 tracking-wider block mt-1">
                  *RTE-{booking.booking_id}-{booking.route_id}*
                </span>
              </div>

              {/* QR Code Verification Stamp */}
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-16 h-16 bg-slate-950 p-1.5 rounded-lg flex items-center justify-center text-white">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <div className="text-left font-mono text-[10px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-slate-900">DIGITAL AUDIT</div>
                  <div>ID: {booking.booking_id}</div>
                  <div>PASS: {booking.status.toUpperCase()}</div>
                  <div className="text-blue-600 font-semibold">Reno Transit Engine</div>
                </div>
              </div>
            </div>

            {/* Bottom Security Watermark Strip */}
            <div className="px-6 py-2.5 bg-slate-100 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>PRESENT THIS BOARDING PASS AT TIME OF COACH BOARDING</span>
              <span>ISSUED: {booking.created_at}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Click <strong>Download PDF</strong> or <strong>Print Boarding Pass</strong> to save your ticket document.</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
