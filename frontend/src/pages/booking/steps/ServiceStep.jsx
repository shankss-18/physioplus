import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

export function ServiceStep({ onNext }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  const icon = (text) =>{
    if (!text) return '';
    const words = text.split(' ')
    const first = words[0]?.charAt(0)?.toUpperCase() || '';
    const second = words[1] ? words[1].charAt(0).toUpperCase() : '';
    return first + second
  }

  return (
    <div className='flex flex-col lg:flex-row justify-start gap-6 lg:gap-10 items-start max-w-[1280px] mx-auto mt-6 lg:mt-10'>
        <div className='flex flex-row lg:flex-col justify-between lg:justify-start gap-2 lg:gap-4 w-full lg:w-2/7 px-2 lg:px-0'>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-teal flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-bold text-teal-deep'>1</p>
                </div>
                <p className='text-[10px] lg:text-sm text-teal-deep font-semibold'>Service</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-gray-400 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-gray-400'>2</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-400 font-medium'>Therapist</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2 text-center lg:text-left'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-gray-400 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-gray-400'>3</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-400 font-medium leading-[1.1]'>Date <br className="block lg:hidden"/>&amp; <br className="block lg:hidden"/>Time</p>
            </div>
            <div className='flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-2 text-center lg:text-left'>
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-gray-400 flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-normal text-gray-400'>4</p>
                </div>
                <p className='text-[10px] lg:text-sm text-gray-400 font-medium leading-[1.1]'>Your <br className="block lg:hidden"/>Details</p>
            </div>
        </div>
        <div className='w-full lg:w-6/7'>
            <h2 className="font-display text-2xl text-teal-deep">Choose a service</h2>
            <p className='text-sm text-gray-600 mt-1 mb-6'>Select what you'd like to book.</p>
            <div className="flex flex-col gap-3">
                {services.map((s) => (
                <div
                    key={s.id}
                    onClick={() => onNext(s)}
                    className=" rounded-lg p-4 cursor-pointer border border-sand-line hover:border-teal hover:-translate-y-0.5 hover:shadow-lg transition bg-white flex justify-start items-center gap-3"
                >
                    <div className='bg-teal h-[54px] w-[54px] text-white rounded-full flex justify-center items-center text-md font-display font-semibold tracking-wide p-3'>{icon(s.name)}</div>
                    <div>
                        <h3 className="font-semibold">{s.name}  - ₹{s.price}</h3>
                        <p className="text-xs text-gray-600">{s.duration_minutes} min</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
}