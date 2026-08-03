import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

export function ConfirmationStep ({ booking }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: booking.customerInfo.name,
        customer_email: booking.customerInfo.email,
        customer_phone: booking.customerInfo.phone,
        staff_id: booking.staff.id,
        service_id: booking.service.id,
        start_datetime: booking.slot.start,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setResult(data);
        else setError(data.error);
      });
  }, [booking]);

  if (error) {
    return <p className="text-danger text-center mt-10">Something went wrong: {error}. Please go back and try another slot.</p>;
  }

  if (!result) {
    return <p className="text-gray-600 text-center mt-10">Confirming your booking...</p>;
  }

  const startDate = new Date(booking.slot.start);
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="flex flex-col items-center justify-center mt-12 w-full">
      <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-display text-3xl text-teal-deep font-semibold mb-3">You're booked</h2>
      <p className="text-sm text-gray-600 mb-8">A confirmation has been sent to your email. See you soon.</p>

      <div className="bg-white border border-sand-line rounded-xl p-6 w-full max-w-lg mb-8">
        <div className="mb-6 text-left">
            <span className="bg-sage text-teal-deep text-xs font-mono font-semibold px-2.5 py-1.5 rounded">
                Booking #PP-{result.id}
            </span>
        </div>

        <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold text-teal-deep">{booking.service.name}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Therapist</span>
                <span className="font-semibold text-teal-deep">{booking.staff.name}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Date &amp; time</span>
                <span className="font-semibold text-teal-deep">{dateStr}, {timeStr}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount due at clinic</span>
                <span className="font-semibold text-teal-deep">₹{booking.service.price}</span>
            </div>
        </div>
      </div>

      <button 
        onClick={() => window.location.href = '/'}
        className="bg-clay text-white font-semibold py-3 px-8 rounded-md hover:opacity-90 transition-opacity"
      >
        Back to Home
      </button>
    </div>
  );
}
