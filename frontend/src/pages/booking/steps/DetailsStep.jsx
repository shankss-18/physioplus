import { useState } from 'react';

export function DetailsStep({ booking, onNext, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit() {
    if (!name || !email) {
      alert('Please fill in your name and email');
      return;
    }
    onNext({ name, email, phone, notes });
  }

  const startDate = new Date(booking.slot.start);
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className='flex flex-col lg:flex-row justify-start gap-6 lg:gap-10 items-start max-w-[1280px] mx-auto mt-6 lg:mt-10'>
        <div className='flex flex-row lg:flex-col justify-between lg:justify-start gap-2 lg:gap-4 w-full lg:w-2/7 px-2 lg:px-0'>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border bg-teal text-white border-gray-600 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-white'>1</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-600 font-medium'>Service</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border bg-teal text-white border-gray-600 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-white'>2</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-600 font-medium'>Therapist</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2 text-center lg:text-left'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border bg-teal text-white border-gray-600 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-white'>3</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-600 font-medium leading-[1.1]'>Date <br className="block lg:hidden"/>&amp; <br className="block lg:hidden"/>Time</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2 text-center lg:text-left'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-teal flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-bold text-teal-deep'>4</p>
                </div>
                <p className='text-[10px] lg:text-sm text-teal-deep font-semibold leading-[1.1]'>Your <br className="block lg:hidden"/>Details</p>
            </div>
        </div>

        <div className='w-full lg:w-6/7 flex-1 max-w-[700px] px-4 lg:px-0'>
            <h2 className="font-display text-2xl text-teal-deep font-semibold mb-1">Your details</h2>
            <p className='text-sm text-gray-600 mb-6'>We'll send your confirmation to this email.</p>

            <div className="bg-sage rounded-xl p-6 mb-8 text-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-teal-deep opacity-80">Service</span>
                    <span className="font-semibold text-teal-deep">{booking.service.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-teal-deep opacity-80">Therapist</span>
                    <span className="font-semibold text-teal-deep">{booking.staff.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-teal-deep opacity-80">Date &amp; time</span>
                    <span className="font-semibold text-teal-deep">{dateStr}, {timeStr}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-teal-deep opacity-80">Price</span>
                    <span className="font-semibold text-teal-deep">₹{booking.service.price}</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-5">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-teal-deep mb-2">Full name</label>
                    <input 
                        placeholder="e.g. Ananya Kosuru" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-sand-line rounded-lg bg-white p-3 text-sm focus:outline-none focus:border-teal" 
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-teal-deep mb-2">Phone number</label>
                    <input 
                        placeholder="e.g. 98765 43210" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-sand-line rounded-lg bg-white p-3 text-sm focus:outline-none focus:border-teal" 
                    />
                </div>
            </div>

            <div className="mb-5">
                <label className="block text-xs font-semibold text-teal-deep mb-2">Email address</label>
                <input 
                    placeholder="you@email.com" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-sand-line rounded-lg p-3 bg-white text-sm focus:outline-none focus:border-teal" 
                />
            </div>

            <div className="mb-8">
                <label className="block text-xs font-semibold text-teal-deep mb-2">Notes for your therapist (optional)</label>
                <textarea 
                    placeholder="Any condition, injury, or preference we should know about" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-sand-line rounded-lg p-3 bg-white text-sm h-14 resize-none focus:outline-none focus:border-teal" 
                />
            </div>

            <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-sm font-semibold text-gray-800 py-2.5 px-6 cursor-pointer border border-sand-line bg-white hover:bg-sand-line rounded-md">Back</button>
                <button 
                    onClick={handleSubmit}
                    className="text-sm font-semibold py-2.5 px-6 rounded-md bg-clay text-white hover:opacity-90 cursor-pointer transition-colors"
                >
                    Confirm Booking
                </button>
            </div>
        </div>
    </div>
  );
}