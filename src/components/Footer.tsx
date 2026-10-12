import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#030713] py-10 border-t border-[#D4AF37]/20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] uppercase tracking-[0.2em]">
        <Link to="/#home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-[#0a1533] border border-[#D4AF37]/40 flex items-center justify-center">
            <Crown className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-serif font-bold text-base tracking-[0.25em] text-[#D4AF37] uppercase">
            GRAND <span className="text-slate-100">ESTATE</span>
          </span>
        </Link>
        
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-center md:text-right font-mono text-[10px]">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} GRAND ESTATE SYNDICATE • BLACK RUSSIA PROJECT
          </p>
          <span className="hidden md:inline text-[#D4AF37]/40">•</span>
          <p className="text-[#F5DF8A]/70">Превосходство и Единство</p>
        </div>
      </div>
    </footer>
  );
}
