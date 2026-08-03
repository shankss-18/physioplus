import { useState } from 'react';
import { ServiceStep } from './steps/ServiceStep';
import { StaffStep } from './steps/StaffStep';
import { TimeStep } from './steps/TimeStep';
import { DetailsStep } from './steps/DetailsStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import Navbar2 from '../../components/Navbar2'
export function BookingFlow() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    service: null,
    staff: null,
    slot: null,
    customerInfo: null,
  });

  function updateBooking(fields) {
    setBooking((prev) => ({ ...prev, ...fields }));
  }

  return (
    <div>
        <Navbar2 />
        <div className="max-w-2xl mx-auto p-6">
        {step === 1 && <ServiceStep onNext={(service) => { updateBooking({ service }); setStep(2); }} />}
        {step === 2 && <StaffStep service={booking.service} onNext={(staff) => { updateBooking({ staff }); setStep(3); }} onBack={() => setStep(1)} />}
        {step === 3 && <TimeStep service={booking.service} staff={booking.staff} onNext={(slot) => { updateBooking({ slot }); setStep(4); }} onBack={() => setStep(2)} />}
        {step === 4 && <DetailsStep booking={booking} onNext={(info) => { updateBooking({ customerInfo: info }); setStep(5); }} onBack={() => setStep(3)} />}
        {step === 5 && <ConfirmationStep booking={booking} />}
        </div>
    </div>
  );
}