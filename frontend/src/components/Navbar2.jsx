import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const navigate = useNavigate()

  

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

    </nav>
  );
}

export default Navbar2