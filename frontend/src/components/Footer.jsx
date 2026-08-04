import { useNavigate } from 'react-router-dom';

/* ── SVG Social Icons ── */
const icons = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
};

const socialLinks = [
  { name: 'Instagram',  href: 'https://instagram.com',  icon: 'instagram',  color: 'hover:text-pink-500' },
  { name: 'Facebook',   href: 'https://facebook.com',   icon: 'facebook',   color: 'hover:text-blue-500' },
  { name: 'X / Twitter',href: 'https://twitter.com',    icon: 'twitter',    color: 'hover:text-sky-400'  },
  { name: 'LinkedIn',   href: 'https://linkedin.com',   icon: 'linkedin',   color: 'hover:text-blue-600' },
  { name: 'YouTube',    href: 'https://youtube.com',    icon: 'youtube',    color: 'hover:text-red-500'  },
  { name: 'WhatsApp',   href: 'https://wa.me/919999999999', icon: 'whatsapp', color: 'hover:text-green-500' },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-teal-deep text-white/70 mt-0">
      {/* ── Main footer grid ── */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <div
            className="font-display font-semibold text-xl text-white flex items-center gap-2 cursor-pointer mb-4"
            onClick={() => navigate('/')}
          >
            <span className="w-7 h-7 rounded-full bg-teal relative shrink-0">
              <span className="absolute inset-2 rounded-full bg-clay" />
            </span>
            Physio Plus
          </div>
          <p className="text-sm leading-relaxed text-white/60 mb-6">
            Expert physiotherapy at Whitefield Clinic. Smart booking that checks therapist & room availability together — no surprises.
          </p>
          {/* Social icons */}
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-110 ${s.color}`}
              >
                {icons[s.icon]}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">Quick Links</p>
          <ul className="flex flex-col gap-3 text-sm">
            {[
              { label: 'Home',            action: () => navigate('/') },
              { label: 'Book a Session',  action: () => navigate('/booking') },
              { label: 'Track Booking',   action: () => navigate('/track-booking') },
              { label: 'Our Services',    action: () => document.querySelector('#services_sec')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Our Team',        action: () => document.querySelector('#team_sec')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map((item) => (
              <li key={item.label}>
                <button
                  onClick={item.action}
                  className="text-white/60 hover:text-white transition text-left"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">Services</p>
          <ul className="flex flex-col gap-3 text-sm text-white/60">
            {[
              'Initial Consultation',
              'Sports Massage',
              'Deep Tissue Therapy',
              'Posture Correction',
              'Rehab Exercise Session',
              'Ultrasound Therapy',
              'Electrotherapy',
            ].map((s) => (
              <li key={s} className="hover:text-white transition cursor-default">{s}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">Contact Us</p>
          <ul className="flex flex-col gap-4 text-sm text-white/60">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">📍</span>
              <span>12, Whitefield Main Road,<br />Bengaluru – 560066, Karnataka</span>
            </li>
            <li className="flex items-center gap-3">
              <span>📞</span>
              <a href="tel:+919999999999" className="hover:text-white transition">+91 99999 99999</a>
            </li>
            <li className="flex items-center gap-3">
              <span>✉️</span>
              <a href="mailto:hello@physioplus.in" className="hover:text-white transition">hello@physioplus.in</a>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">🕐</span>
              <span>Mon – Fri: 9:00 AM – 5:00 PM<br />Sat: 9:00 AM – 1:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Physio Plus. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70 transition">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 transition">Terms of Service</a>
            <a href="#" className="hover:text-white/70 transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
