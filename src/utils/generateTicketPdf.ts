import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Booking } from '../types/bus';

export async function downloadBoardingPassPdf(booking: Booking, elementId: string = 'boarding-pass-print'): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);

    if (element) {
      // High-res canvas capture of the rendered boarding pass
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 12;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin + 4, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`Reno_Transit_Boarding_Pass_${booking.booking_id}.pdf`);
      return true;
    }
  } catch (err) {
    console.warn('Canvas capture fallback to vector PDF:', err);
  }

  // Fallback: Pure vector PDF generation using jsPDF
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Dark Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(14, 14, 182, 28, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RENO TRANSIT ENGINE', 22, 26);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('OFFICIAL PASSENGER BOARDING PASS & FISCAL RECEIPT', 22, 34);

    doc.setTextColor(251, 191, 36); // amber-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`RTE-${booking.booking_id}`, 190, 28, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('BOOKING REFERENCE', 190, 34, { align: 'right' });

    // Body Card Outline
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.rect(14, 42, 182, 130);

    // Journey Section
    doc.setFillColor(248, 250, 252);
    doc.rect(14.2, 42.2, 181.6, 28, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(booking.departure_city.toUpperCase(), 22, 56);
    doc.text(booking.destination_city.toUpperCase(), 176, 56, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`Departs: ${booking.departure_time}`, 22, 64);
    doc.setTextColor(100, 116, 139);
    doc.text(`Route ${booking.route_id} · Non-Stop Express`, 176, 64, { align: 'right' });

    // Arrow line
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1);
    doc.line(80, 56, 120, 56);

    // Passenger & Ticket Details
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text('PASSENGER NAME', 22, 82);
    doc.text('SEAT NUMBERS', 85, 82);
    doc.text('TOTAL FARE PAID', 145, 82);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.passenger_name, 22, 90);
    doc.setTextColor(37, 99, 235);
    doc.text(booking.seat_numbers.length > 0 ? booking.seat_numbers.join(', ') : `${booking.seats} Seats`, 85, 90);
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text(`PKR Rs. ${booking.total_fare.toLocaleString()}`, 145, 90);

    // Secondary row
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('PASSENGER AGE & CLASS', 22, 104);
    doc.text('PLATFORM / BAY', 85, 104);
    doc.text('STATUS', 145, 104);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${booking.passenger_age} Years · ${booking.category}`, 22, 112);
    doc.text('Bay 02 (Main Concourse)', 85, 112);
    doc.setTextColor(booking.status === 'Confirmed' ? 22 : 225, booking.status === 'Confirmed' ? 101 : 29, booking.status === 'Confirmed' ? 52 : 72);
    doc.text(booking.status.toUpperCase(), 145, 112);

    // Perforated line
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(14, 126, 196, 126);
    doc.setLineDashPattern([], 0);

    // Barcode Simulation
    doc.setFillColor(15, 23, 42);
    let barX = 22;
    for (let i = 0; i < 45; i++) {
      const w = i % 3 === 0 ? 1.5 : (i % 2 === 0 ? 0.7 : 1);
      doc.rect(barX, 134, w, 16, 'F');
      barX += w + (i % 4 === 0 ? 1.5 : 0.8);
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`*RTE-${booking.booking_id}-${booking.route_id}*`, 22, 156);
    doc.text(`ISSUED: ${booking.created_at} · VERIFIED ELECTRONIC TICKET`, 22, 164);

    doc.save(`Reno_Transit_Boarding_Pass_${booking.booking_id}.pdf`);
    return true;
  } catch (vectorErr) {
    console.error('Failed to generate PDF:', vectorErr);
    return false;
  }
}
