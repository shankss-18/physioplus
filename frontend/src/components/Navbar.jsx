import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Services', href: '#services_sec' },
    { label: 'Our Team', href: '#team_sec' },
    { label: 'Manage Booking', href: '#manage' },
    { label: 'Admin Panel', href: '/admin/dashboard' },
  ];

  const handleNavigate = (href) => {
    if (href === '#manage') {
      navigate('/track-booking');
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !burgerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <nav className="relative z-40 flex items-center justify-between px-6 md:px-12 py-5 border-b border-sand-line bg-cream">
      <div className="font-display font-semibold text-xl text-ink flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <span className="w-7 h-7 rounded-full bg-teal relative shrink-0">
          <span className="absolute inset-2 rounded-full bg-clay" />
        </span>
        Physio Plus
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium text-teal-deep">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} className="opacity-75 hover:opacity-100 transition" onClick={() => handleNavigate(link.href)}>
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/booking')} className=" md:block bg-teal text-white md:px-5 px-2.5 md:py-2.5 py-2 rounded-md md:text-sm text-xs font-semibold hover:opacity-90 transition">
          Book a Session
        </button>
        <button
          ref={burgerRef}
          type="button"
          className="md:hidden text-2xl text-teal-deep w-9 h-9 flex items-center justify-center"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      <div
        ref={menuRef}
        className={`md:hidden absolute top-full left-0 right-0 bg-cream border-b border-sand-line shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-teal-deep font-medium" onClick={() => { setIsOpen(false); handleNavigate(link.href); }}>{link.label}</a>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar