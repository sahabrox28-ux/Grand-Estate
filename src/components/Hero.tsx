import { motion } from 'motion/react';
import { Shield, Sparkles, Trophy, Car, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20 bg-gradient-to-b from-[#060e22] via-[#081536] to-[#050b18]">
      {/* Background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060e22]/50 to-[#050b18]" />
      </div>
      
      {/* Ambient luxury glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#B8860B]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Heraldic Crest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto bg-gradient-to-br from-[#0c1a40] via-[#081536] to-[#040916] rounded-2xl border-2 border-[#D4AF37] rotate-45 shadow-[0_0_40px_rgba(212,175,55,0.35)] group">
            <Shield className="w-11 h-11 text-[#D4AF37] -rotate-45 drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#D4AF37]/20 to-transparent animate-pulse" />
          </div>
        </motion.div>

        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c1a40]/80 border border-[#D4AF37]/40 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F5DF8A]" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#F5DF8A] uppercase font-bold">
            Официальный Синдикат • Black Russia
          </span>
        </motion.div>
        
        {/* Main Title: GRAND ESTATE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.08em] uppercase mb-6 drop-shadow-[0_10px_35px_rgba(2,6,23,0.9)]"
        >
          <span className="text-slate-100">GRAND </span>
          <span className="bg-gradient-to-r from-[#ECC867] via-[#FFF3CC] to-[#D4AF37] bg-clip-text text-transparent">
            ESTATE
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
        >
          Элитная семья проекта <span className="text-[#F5DF8A] font-semibold tracking-wide">Black Russia</span>. Статус, влияние и нерушимое братство победителей.
        </motion.p>
        
        {/* Family Highlights Pills */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl w-full mb-10"
        >
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-lg bg-[#0a142e]/70 border border-[#D4AF37]/20 backdrop-blur-sm shadow-md">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-wider text-slate-200 font-mono font-medium">Контейнеры & Капты</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-lg bg-[#0a142e]/70 border border-[#D4AF37]/20 backdrop-blur-sm shadow-md">
            <Car className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-wider text-slate-200 font-mono font-medium">Премиум Автопарк</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-lg bg-[#0a142e]/70 border border-[#D4AF37]/20 backdrop-blur-sm shadow-md">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-wider text-slate-200 font-mono font-medium">Сплоченный Состав</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
        >
          <Link 
            to="/#news" 
            className="px-8 py-4 bg-[#0a1533]/80 hover:bg-[#0e204c] border border-[#D4AF37]/60 hover:border-[#D4AF37] text-[#F5DF8A] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg rounded-sm flex items-center justify-center group"
          >
            Хроника событий
          </Link>
          <Link 
            to="/games" 
            className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#ECC867] to-[#D4AF37] hover:from-[#F5DF8A] hover:to-[#D4AF37] text-[#060e22] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] rounded-sm flex items-center justify-center"
          >
            Азарт Лоб
          </Link>
        </motion.div>
      </div>

      {/* Elegant Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <span className="text-[10px] text-[#D4AF37]/70 uppercase tracking-[0.3em] mb-2 font-mono">Прокрутка</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-[#D4AF37] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
