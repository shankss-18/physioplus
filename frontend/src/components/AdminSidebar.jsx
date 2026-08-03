import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { label: 'Calendar', icon: '🗓', path: '/admin/calendar' },
  { label: 'Services', icon: '🧾', path: '/admin/services' },
  { label: 'Staff', icon: '🧑‍⚕️', path: '/admin/staff' },
  { label: 'Rooms', icon: '🚪', path: '/admin/rooms' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const burgerRef = useRef(null);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  }

  // Close drawer on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        burgerRef.current &&
        !burgerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when drawer is open on mobile/tablet
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* ── Shared nav links & logout ── */
  const NavItems = ({ onNavigate }) => (
    <>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/5 transition"
        >
          <span>🌐</span> View Customer Site
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-danger hover:bg-white/5 transition"
        >
          <span>↩</span> Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP sidebar  (md and above)
      ════════════════════════════════════════ */}
      <div className="hidden md:flex bg-teal-deep text-white h-screen sticky top-0 flex-col p-5 w-56 shrink-0">
        {/* Logo */}
        <div
          onClick={() => navigate('/admin/dashboard')}
          className="font-display font-semibold text-lg flex items-center gap-2 mb-10 px-1 cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-teal relative shrink-0">
            <span className="absolute inset-1.5 rounded-full bg-clay" />
          </span>
          Physio Plus
        </div>

        <NavItems onNavigate={undefined} />
      </div>

      {/* ════════════════════════════════════════
          MOBILE / TABLET top bar  (below md)
      ════════════════════════════════════════ */}
      <div className="md:hidden bg-teal-deep text-white flex items-center justify-between px-5 py-4">
        {/* Logo — left */}
        <div
          onClick={() => navigate('/admin/dashboard')}
          className="font-display font-semibold text-lg flex items-center gap-2 cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-teal relative shrink-0">
            <span className="absolute inset-1.5 rounded-full bg-clay" />
          </span>
          Physio Plus
        </div>

        {/* Hamburger — right */}
        <button
          ref={burgerRef}
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center text-2xl text-white focus:outline-none"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-teal-deep text-white flex flex-col p-5 z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header: logo + close */}
        <div className="flex items-center justify-between mb-10">
          <div
            onClick={() => { navigate('/admin/dashboard'); setIsOpen(false); }}
            className="font-display font-semibold text-lg flex items-center gap-2 px-1 cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-teal relative shrink-0">
              <span className="absolute inset-1.5 rounded-full bg-clay" />
            </span>
            Physio Plus
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="text-white/60 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <NavItems onNavigate={() => setIsOpen(false)} />
      </div>
    </>
  );
};

export default AdminSidebar;