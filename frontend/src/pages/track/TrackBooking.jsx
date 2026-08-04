import React, { useState } from 'react'
import Navbar2 from '../../components/Navbar2'
import Footer from '../../components/Footer'
import { API_BASE_URL } from '../../config';
const TrackBooking = () => {
    const data = {
        id: '#PP-1042',
        Service : "Ultrasound Therapy",
        Therapist: 'Dr.Priya Sharma',
        Date: 'Aug 3, 3:30 PM',
        Price: 'Rs 800',
        Status: 'Confirmed'
    }
    const [email, setEmail]  = useState('')
    const [booking_id, setBookingId] = useState('')
    const [details, setDetails] = useState(null)
    const [error, setError] = useState(false)
    const getDetails = async() =>{
        const res = await fetch(`${API_BASE_URL}/api/bookings/get/${booking_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                booking_id: booking_id
            })
        })
        const data = await res.json();
        if(res.status == 404){
            setError(true)
            setDetails(null)
            return
        }
        setDetails(data)
        setError(false)
        console.log(error)
        console.log(details)
    }

    function formatBookingDateTime(dateTimeStr) {
        const [datePart, timePart] = dateTimeStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hourRaw, minute] = timePart.split(':').map(Number);
        let hour = hourRaw;
        if (hour >= 1 && hour <= 8) {
            hour += 12;
        }
        const date = new Date(year, month - 1, day, hour, minute);
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
        let hour12 = hour % 12;
        if (hour12 === 0) hour12 = 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const minuteStr = String(minute).padStart(2, '0');
        return `${weekday}, ${monthShort} ${day} · ${hour12}:${minuteStr} ${ampm}`;
    }
    
  return (
    <div id='manage'>
        <Navbar2/>
        <div className='px-6 lg:px-12 py-5 mt-5 max-w-[800px] mr-auto ml-auto'>

            <div className='flex justify-center items-center mt-6 mb-6 flex-col'>
                <h1 className='text-2xl lg:text-3xl lg:font-semibold font-semibold font-display tracking-wide leading-tight'>Manage your booking</h1>
                <p className='text-sm tracking-wide text-teal-deep lg:max-w-2/3 mt-3 mb-4'>Enter your email and booking ID to view or cancel.</p>
            </div>

            <div className='lg:w-2/3 mx-auto flex flex-col justify-start items-center gap-6'>
                <div className='w-full'>
                    <label htmlFor="email" className='text-teal-deep text-sm tracking-wider lg:text-md block mb-2 ml-1'>Email</label>
                    <input type="text" className=" bg-white text-teal-deep w-full px-3 py-2 border border-sand-line rounded-md" placeholder="youremail@gmail.com" onChange={(e) => setEmail(e.target.value)} value={email}/>
                </div>
                <div className='w-full'>
                    <label htmlFor="booking_id" className='text-teal-deep text-sm tracking-wider lg:text-md block mb-2 ml-1'>Booking ID</label>
                    <input type="text" className="bg-white text-teal-deep w-full px-3 py-2 border border-sand-line rounded-md" placeholder="eg. PP-1042" onChange={(e) => setBookingId(e.target.value)} value={booking_id}/>
                </div>
                <div className='w-full'>
                    <button className="bg-clay font-medium text-cream px-3 py-2 rounded-md w-full" onClick={getDetails}>Find my booking</button>
                </div>
            </div>

            {details ? (
                <div className='mt-10 w-full lg:w-2/3 mx-auto bg-white rounded-md px-6 py-4 flex flex-col justify-start items-start gap-2'>
                <div className='py-2 px-3 bg-[#DCE6DC] rounded-md text-teal-deep text-xs tracking-wider lg:text-md mb-2'>Booking #{details.id}</div>
                <div className='flex justify-between items-center w-full'>
                    <p className='text-xs'>Service</p>
                    <p className='text-black font-mono text-xs tracking-wider lg:text-md mb-2 ml-1'>{details.service_name}</p>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <p className='text-xs'>Therapist</p>
                    <p className='text-black font-mono text-xs tracking-wider lg:text-md mb-2 ml-1'>{details.therapist_name}</p>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <p className='text-xs'>Date</p>
                    <p className='text-black font-mono text-xs tracking-wider lg:text-md mb-2 ml-1'>{formatBookingDateTime(details.start_datetime)}</p>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <p className='text-xs'>Price</p>
                    <p className='text-black font-mono text-xs tracking-wider lg:text-md mb-2 ml-1'>{details.price}</p>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <p className='text-xs'>Duration</p>
                    <p className='text-black font-mono text-xs tracking-wider lg:text-md mb-2 ml-1'>{details.duration} min</p>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <p className='text-xs'>Status</p>
                    <p className='text-black font-mono text-xs tracking-wider lg:text-md mb-2 ml-1'>{details.status}</p>
                </div>
                
            </div>

            ) : null}
            {details ? (
            <div className='flex w-full lg:w-2/3 mx-auto justify-center items-center mt-8 mb-6 flex-col'>
                <button className="border border-danger text-danger px-3 py-2 rounded-md w-full cursor-pointer text-sm tracking-wider font-semibold">Cancel this booking</button>
            </div>
            ) : null}

            {error && (
                <div className='mt-10 w-full lg:w-2/3 mx-auto flex justify-center'>
                    <p className='text-danger text-md lg:text-lg lg:font-semibold font-semibold tracking-wide'>Booking not found</p>
                </div>
            )}
        </div>
        <Footer />
    </div>
  )
}

export default TrackBooking