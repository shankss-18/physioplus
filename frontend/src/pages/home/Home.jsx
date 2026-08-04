import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import {useNavigate} from 'react-router-dom'
import { API_BASE_URL } from '../../config';

const Home = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [rooms, setRooms] = useState([])
  const [staff, setStaff] = useState([])
  const [boardData, setBoardData] = useState(null)

  useEffect(() => {
    // using local date string for 'YYYY-MM-DD'
    const today = new Date().toLocaleDateString('en-CA');
    Promise.all([
      fetch(`${API_BASE_URL}/api/services`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/rooms`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/staff`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/availability/board?date=${today}`).then(res => res.json())
    ]).then(([svcData, roomData, staffData, board]) => {
      setServices(svcData)
      setRooms(roomData)
      setStaff(staffData)
      setBoardData(board)
    }).catch(err => console.error("Error fetching data:", err))
  }, [])

  // Helpers
  const getRoomName = (roomId) => rooms.find(r => Number(r.id) === Number(roomId))?.name || 'ROOM';
  const getInitials = (name) => {
    if (!name) return '';
    const words = name.split(' ');
    const first = words[0]?.charAt(0)?.toUpperCase() || '';
    const second = words.length > 1 ? words[1].charAt(0).toUpperCase() : '';
    return first + second;
  };

  const renderLiveAvailability = () => {
    const slots = useMemo(() => {
      if (!boardData || services.length === 0) return [];

      const now = new Date();
      let startTime = new Date(now);
      if (now.getMinutes() > 0 && now.getMinutes() <= 30) {
        startTime.setMinutes(30, 0, 0);
      } else if (now.getMinutes() > 30) {
        startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
      } else {
        startTime.setMinutes(0, 0, 0);
      }

      const generatedSlots = [];
      for (let i = 0; i < 4; i++) {
        const slotTime = new Date(startTime.getTime() + i * 30 * 60000);
        let availableServiceNames = [];
        if (boardData && boardData[slotTime.getTime()]) {
          availableServiceNames = boardData[slotTime.getTime()];
        }
        
        // Pick 1 random unique service
        const shuffled = [...services].sort(() => 0.5 - Math.random());
        const selectedServices = shuffled.slice(0, 1).map(s => ({
          name: s.name,
          isAvailable: availableServiceNames.includes(s.name)
        }));

        let status = 'Open';
        let badgeClass = 'bg-[#2F554A] text-[#9FDDBC]';
        // If there are no available services overall for this slot, show Booked
        if (availableServiceNames.length === 0) {
          status = 'Fully Booked';
          badgeClass = 'bg-[#423D37] text-[#E8A29E]';
        }

        generatedSlots.push({
          timeString: slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          displayServices: selectedServices,
          status,
          badgeClass,
          dateStr: startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
        });
      }
      return generatedSlots;
    }, [boardData, services]);

    if (slots.length === 0) return <div className='hidden lg:flex w-4/5 rounded-xl bg-teal-deep p-6 text-white text-sm items-center justify-center min-h-[350px]'>Loading live availability...</div>;

    const dateStr = slots[0].dateStr;

    const Content = () => (
      <>
        <div className="flex justify-between items-center mb-6">
          <p className='text-xs text-sage font-mono tracking-widest'>LIVE AVAILABILITY</p>
          <p className='text-xs text-sage font-mono bg-white/5 px-2 py-1 rounded'>{dateStr}</p>
        </div>
        <div className='flex flex-col gap-2'>
          {slots.map((slot, idx) => (
            <React.Fragment key={idx}>
              <div className='flex justify-between items-center group hover:bg-white/5 p-2.5 -mx-2.5 rounded-lg transition-colors cursor-default'>
                <p className='text-white/90 font-mono text-sm whitespace-nowrap w-[70px]'>{slot.timeString}</p>
                
                <div className='hidden sm:flex flex-grow mx-6 relative items-center justify-center'>
                   <div className="absolute w-full h-[1px] bg-gradient-to-r from-sage-line/5 via-sage-line/30 to-sage-line/5 transition-opacity group-hover:opacity-100 opacity-60"></div>
                </div>

                <div className='flex justify-end gap-3 items-center ml-auto'>
                  {slot.displayServices.map((s, i) => (
                    <span 
                      key={i} 
                      className={`truncate max-w-[150px] sm:max-w-[180px] px-2.5 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-2 transition-colors border border-white/5 ${
                        s.isAvailable 
                          ? 'bg-[#2F554A]/80 text-[#9FDDBC] shadow-sm' 
                          : 'bg-[#423D37]/60 text-[#E8A29E]/80 shadow-sm'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm ${s.isAvailable ? 'bg-[#9FDDBC] shadow-[#9FDDBC]/50' : 'bg-[#E8A29E]/60 shadow-[#E8A29E]/30'}`}></span>
                      {s.name}
                    </span>
                  ))}
                  <div className={`${slot.badgeClass} px-2.5 py-1.5 text-[11px] font-medium rounded-md whitespace-nowrap shadow-sm border border-white/5`}>{slot.status}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </>
    );

    return (
      <>
        <div className='hidden lg:flex flex-col justify-center w-4/5 rounded-xl bg-teal-deep p-6 min-h-[350px] shadow-inner'>
          <Content />
        </div>
        <div className='lg:hidden w-full flex flex-col justify-center rounded-xl bg-teal-deep p-6 min-h-[350px] shadow-inner'>
          <Content />
        </div>
      </>
    );
  };

  return (
    <div>
      <Navbar />

      <div className='px-6 lg:px-12 py-5 mt-5 max-w-[1280px] mr-auto ml-auto'>
        {/**primary section */}
        <div id='primary_sec' className='lg:flex lg:justify-between lg:items-center lg:gap-15 mt-6 mb-15 lg:mt-15'>
          <div>
            <p className='text-clay font-mono text-sm tracking-wider lg:text-md'> Now booking — Whitefield Clinic</p>
            <h1 className='text-ink font-display mt-4 mb-4 text-3xl lg:text-5xl lg:font-semibold font-bold tracking-wide leading-tight '>Book with the right therapist, in the right room, every time.</h1>
            <p className='text-md tracking-wide text-teal-deep lg:max-w-2/3'>Physio Plus checks your therapist's schedule and the treatment room's availability together, so what you see is what you actually get, no surprises.</p>

            <div className='flex justify-start align-centre mt-8 mb-15 gap-5'>
              <button className='text-cream bg-clay px-6 py-3 rounded-md cursor-pointer' onClick={() => navigate('/booking')}>Book a Session</button>
              <button className='text-ink bg-cream border border-[1px] border-sand-line px-6 py-3 rounded-md cursor-pointer' onClick={() => {
                const target = document.querySelector('#services_sec');
                target.scrollIntoView({ behavior: 'smooth' });
              }}>View Services</button>
            </div>
          </div>

          {renderLiveAvailability()}
        </div>

        {/**services section */}

        <div id='services_sec' className='mt-10 lg:mt-20'>
          <h1 className='text-teal-deep text-3xl font-semibold font-display'>Our Services</h1>
          <p className='mt-5 text-ink tracking-wider text-sm leading-snug font-normal '>Each service is matched to the room it needs, so availability is always accurate.</p>

          <div className='mt-6 pt-4 flex gap-4 lg:gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory'>
            {services.map(service => (
              <div key={service.id} className='snap-start shrink-0 w-[85vw] sm:w-[380px] bg-white rounded-md p-5 flex flex-col gap-4 justify-start items-start cursor-pointer border border-sand-line hover:border-teal hover:-translate-y-2 hover:shadow-xl transition-all duration-300'> 
                <div className='bg-[#DCE6DC] text-teal text-xs font-mono px-2 py-0.5 rounded-sm uppercase'>
                  {getRoomName(service.room_id)}
                </div>
                <h1 className='text-xl font-display font-semibold tracking-wide text-black'>{service.name}</h1>
                <p className='text-sm text-gray-600 line-clamp-2'>{service.description || 'Professional physiotherapy service.'}</p>
                <div className='flex justify-between items-center w-full mt-auto'>
                  <p className='text-black font-bold text-sm'>₹{service.price}</p>
                  <p className='text-gray-600 text-sm'>{service.duration_minutes} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/**team section */}

        <div id='team_sec' className='mt-10 lg:mt-20 mb-20'>
          <h1 className='text-teal-deep text-3xl font-semibold font-display'>Our Team</h1>
          <p className='mt-5 text-ink tracking-wider text-sm leading-snug font-normal '>Meet the therapists at our Whitefield clinic..</p>
          

          <div className='mt-6 pt-4 flex gap-4 lg:gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory'>
            {staff.map(member => (
              <div key={member.id} className='snap-start shrink-0 w-[90vw] sm:w-[420px] bg-white rounded-md p-5 flex flex-row gap-4 justify-start items-start border border-sand-line hover:border-teal hover:-translate-y-2 hover:shadow-xl transition-all duration-300'> 
                <div className='flex flex-col justify-center items-center h-full'>
                  <div className='bg-teal h-[54px] w-[54px] text-white rounded-full flex justify-center items-center text-md font-display font-semibold tracking-wide p-3'>
                    {getInitials(member.name)}
                  </div>
                </div>
                <div className='flex flex-col gap-2 w-4/5'>
                  <h1 className='text-lg font-display font-semibold tracking-wide text-black'>{member.name}</h1>
                  <p className='text-xs font-mono text-clay'>PHYSIOTHERAPIST</p>
                  <p className='text-xs text-gray-600 '>Expert in {member.specialties || 'general physiotherapy'} and related treatments.</p>
                  <div className='flex justify-start gap-3 items-center mt-3 flex-wrap'>
                    {member.specialties ? member.specialties.split(',').map((spec, i) => (
                      <div key={i} className='bg-[#DCE6DC] px-2 py-1 text-[10px] rounded-full text-teal font-mono'>{spec.trim()}</div>
                    )) : (
                      <div className='bg-[#DCE6DC] px-2 py-1 text-[10px] rounded-full text-teal font-mono'>General Physio</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home