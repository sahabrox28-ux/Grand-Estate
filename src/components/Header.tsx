import { useState, useEffect } from 'react';
import { Menu, X, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Главная', href: '/#home' },
    { name: 'Хроника', href: '/#news' },
    { name: 'Кодекс', href: '/#rules' },
    { name: 'Состав', href: '/#roster' },
    { name: 'Связь', href: '/#contact' },
    { name: 'Азарт Лоб', href: '/games' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#060e22]/95 backdrop-blur-md border-b border-[#D4AF37]/30 py-3.5 shadow-[0_4px_30px_rgba(2,6,23,0.8)]' 
          : 'border-b border-[#D4AF37]/15 bg-gradient-to-b from-[#091534]/90 via-[#060e22]/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo / Brand Name */}
          <Link to="/#home" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#0c1a40] to-[#060e22] border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all">
              <Crown className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-[0.22em] text-[#D4AF37] uppercase flex items-center gap-1.5 drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">
                GRAND <span className="text-slate-100 font-semibold">ESTATE</span>
              </span>
              <span className="text-[9px] font-mono tracking-[0.25em] text-[#D4AF37]/70 uppercase hidden sm:block">
                Black Russia Syndicate
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-xs font-semibold text-slate-300 hover:text-[#F5DF8A] transition-all uppercase tracking-[0.18em] relative py-1 group/item"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] transition-all duration-300 group-hover/item:w-full" />
              </Link>
            ))}

            <Link
              to="/games"
              className="ml-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#060e22] bg-gradient-to-r from-[#D4AF37] via-[#ECC867] to-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] rounded-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#060e22]" />
              <span>Играть</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-300 hover:text-[#D4AF37] p-2 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-[#060e22] z-50 flex flex-col pt-20 px-8 border-l border-[#D4AF37]/30 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-6 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-[#D4AF37]" />
                <span className="font-serif font-bold text-lg tracking-[0.2em] text-[#D4AF37] uppercase">
                  GRAND <span className="text-white">ESTATE</span>
                </span>
              </div>
              <button
                className="text-slate-400 hover:text-[#D4AF37] transition-colors p-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex flex-col gap-6 items-center mt-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-serif font-semibold text-slate-200 hover:text-[#F5DF8A] uppercase tracking-[0.2em] transition-colors w-full text-center py-2 border-b border-[#D4AF37]/10"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full mt-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-[#060e22] bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] rounded"
              >
                Азарт Лоб
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
