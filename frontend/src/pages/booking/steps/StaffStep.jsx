import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

export function StaffStep({ service, onNext, onBack }) {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/staff`)
      .then((res) => res.json())
      .then((data) => setStaff(data));
      
  }, []);
  console.log(staff)
  const icon = (text) =>{
    const words = text.split(' ')
    const first = words[0].charAt(0).toUpperCase()
    const second = words[1].charAt(0).toUpperCase()
    return first + second
  }

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
                <div className='h-[24px] w-[24px] lg:h-[20px] lg:w-[20px] rounded-full border border-teal flex justify-center items-center'>
                    <p className='text-[10px] lg:text-xs font-bold text-teal-deep'>2</p>
                </div>
                <p className='text-[10px] lg:text-sm text-teal-deep font-semibold'>Therapist</p>
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
            <h2 className="font-display text-2xl text-teal-deep mb-8">Choose your therapist</h2>

            <div className="flex flex-col gap-3">
                {staff.map((person) => (
                <div
                    key={person.id}
                    onClick={() => onNext(person)}
                    className="rounded-lg p-4 cursor-pointer border border-sand-line hover:border-teal hover:-translate-y-0.5 hover:shadow-lg transition bg-white flex justify-start items-center gap-3"
                >
                    <div className='bg-teal h-[54px] w-[54px] text-white rounded-full flex justify-center items-center text-md font-display font-semibold tracking-wide p-3'>{icon(person.name)}</div>
                    <div>
                        <h3 className="font-semibold">{person.name}</h3>
                        <p className="text-xs text-gray-600">{person.specialties}</p>
                    </div>
                </div>
                ))}
            </div>

            <button onClick={onBack} className="mt-4 text-sm text-teal-deep py-2 px-6 cursor-pointer border border-sage rounded-md">Back</button>
            </div>
    </div>
    
  );
}