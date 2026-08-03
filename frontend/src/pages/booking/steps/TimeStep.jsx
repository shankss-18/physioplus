import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

export function TimeStep({ service, staff, onNext, onBack }) {
  const generateDates = () => {
    const datesList = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datesList.push(d);
    }
    return datesList;
  };

  const [dates] = useState(generateDates());
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const localDateStr = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000))
      .toISOString().split('T')[0];

    fetch(`${API_BASE_URL}/api/availability?staffId=${staff.id}&serviceId=${service.id}&date=${localDateStr}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedDate, staff, service]);

  const generateAllSlots = () => {
    const allSlots = [];
    let current = new Date(selectedDate);
    current.setHours(9, 0, 0, 0); // 9:00 AM
    const end = new Date(selectedDate);
    end.setHours(17, 0, 0, 0); // 5:00 PM

    while (current < end) {
      allSlots.push(new Date(current));
      current.setMinutes(current.getMinutes() + 30);
    }
    return allSlots;
  };

  const allSlots = generateAllSlots();

  const isAvailable = (slotDate) => {
    return slots.some(availableSlot => {
      const availDate = new Date(availableSlot.start);
      return availDate.getHours() === slotDate.getHours() && availDate.getMinutes() === slotDate.getMinutes();
    });
  };

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
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-teal flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-bold text-teal-deep'>3</p>
                </div>
                <p className='text-[10px] lg:text-sm text-teal-deep font-semibold leading-[1.1]'>Date <br className="block lg:hidden"/>&amp; <br className="block lg:hidden"/>Time</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2 text-center lg:text-left'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-gray-400 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-gray-400'>4</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-400 font-medium leading-[1.1]'>Your <br className="block lg:hidden"/>Details</p>
            </div>
        </div>
        <div className='w-full lg:w-6/7 px-4 lg:px-0'>
            <h2 className="font-display text-2xl text-teal-deep font-semibold mb-2">Pick a date &amp; time</h2>
            <p className='text-sm text-gray-600 mb-6'>Slots shown are already checked against both therapist and room availability.</p>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {dates.map((d, i) => {
                const isSelected = selectedDate.toDateString() === d.toDateString();
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dayNum = d.getDate();
                return (
                  <div
                    key={i}
                    onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                    className={`flex items-center justify-start gap-1 pl-3 w-16 h-12 rounded-lg cursor-pointer border transition-colors ${
                      isSelected
                        ? 'border-teal bg-sage'
                        : 'border-sand-line bg-white hover:border-teal'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-teal-deep font-semibold' : 'text-gray-400'}`}>{dayName}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-teal-deep' : 'text-gray-800'}`}>{dayNum}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-sand-line rounded bg-white"></div>
                <span className="text-xs text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-sand-line rounded bg-[#F4F4F4]"></div>
                <span className="text-xs text-gray-600">Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-teal"></div>
                <span className="text-xs text-gray-600">Selected</span>
              </div>
            </div>

            {loading ? (
               <p className="text-sm text-ink/60 mb-8">Checking availability...</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {allSlots.map((slotTime, i) => {
                  const isAvail = isAvailable(slotTime);
                  const isSelected = selectedSlot && selectedSlot.getTime() === slotTime.getTime();
                  
                  return (
                    <button
                      key={i}
                      disabled={!isAvail}
                      onClick={() => setSelectedSlot(slotTime)}
                      className={`flex flex-col items-center justify-center h-14 rounded-lg border font-mono transition-colors
                        ${!isAvail ? 'bg-[#F4F4F4] border-sand-line text-gray-400 cursor-not-allowed opacity-70' : 
                          isSelected ? 'bg-teal border-teal text-white' : 
                          'bg-white border-sand-line text-gray-800 hover:border-teal hover:bg-sage'
                        }
                      `}
                    >
                      <span className="text-sm">{slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      {!isAvail && <span className="text-[10px] mt-1 font-sans font-semibold text-[#A0A0A0]">THERAPIST BUSY</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-sm font-semibold text-gray-800 py-2.5 px-6 cursor-pointer border border-sand-line bg-white hover:bg-sand-line rounded-md">Back</button>
              <button 
                onClick={() => {
                if (!selectedSlot) return;
                // Build a LOCAL datetime string (no timezone conversion) so the backend
                // stores exactly the time the user picked, not its UTC equivalent.
                const pad = (n) => String(n).padStart(2, '0');
                const localStr = `${selectedSlot.getFullYear()}-${pad(selectedSlot.getMonth() + 1)}-${pad(selectedSlot.getDate())}T${pad(selectedSlot.getHours())}:${pad(selectedSlot.getMinutes())}:00`;
                onNext({ start: localStr });
              }}
                disabled={!selectedSlot} 
                className={`text-sm font-semibold py-2.5 px-6 rounded-md transition-colors ${selectedSlot ? 'bg-clay text-white hover:opacity-90 cursor-pointer' : 'bg-clay/50 text-white/70 cursor-not-allowed'}`}
              >
                Continue
              </button>
            </div>
        </div>
    </div>
  );
}