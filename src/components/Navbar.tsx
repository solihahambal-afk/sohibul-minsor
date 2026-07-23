import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Plane, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Hajj & Umrah', path: '/hajj-umrah' },
  { name: 'Scholarships', path: '/scholarships' },
  { name: 'News & Updates', path: '/news' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-primary-900 shadow-md py-2' : 'bg-transparent py-4 sm:py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 sm:space-x-4">
            <img 
              src="/new_logo.png?v=3" 
              alt="Sohibulminsor Classic Logo" 
              className="h-12 w-auto sm:h-16 lg:h-20 object-contain relative z-10" 
            />
            <div className="flex flex-col justify-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20 sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0 sm:border-none sm:rounded-none">
              <span className="font-serif text-lg sm:text-xl font-bold text-gold-500 leading-none tracking-wide whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Sohibul Minsor
              </span>
              <span className={`font-sans text-[10px] sm:text-[11px] font-black tracking-wider uppercase mt-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] text-white`} style={{ borderColor: '#e8e9ef' }}>
                CLASSIC LTD
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors duration-300 py-2 group ${
                    isActive ? 'text-gold-500' : 'text-white/90 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-gold-500 transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* CTA & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/2347068609404"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-2 bg-gold-500 text-primary-900 px-5 py-2.5 rounded-full font-semibold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
            >
              <Phone size={18} />
              <span>Consult Now</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary-800 bg-primary-900 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 mt-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-800 text-gold-500'
                        : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <a
                href="https://wa.me/2347068609404"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="mt-4 flex items-center justify-center space-x-2 bg-gold-500 text-primary-900 px-4 py-3 rounded-lg font-semibold"
              >
                <Phone size={18} />
                <span>Consult Now</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
