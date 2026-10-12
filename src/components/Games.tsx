import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, RotateCw, Trophy, AlertCircle, KeyRound, Sparkles, Gem } from 'lucide-react';
import { useAdmin } from '../lib/AdminContext';
import { useCollection } from '../lib/store';

const SYMBOLS = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '7️⃣'];
const SPIN_DURATION = 2000;
const INITIAL_BALANCE = 1000;

export default function Games() {
  const { isAdmin, updateItem } = useAdmin();
  const promosList = useCollection('promocodes');
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('games_balance');
    return saved !== null ? parseInt(saved, 10) : INITIAL_BALANCE;
  });
  const [betAmount, setBetAmount] = useState(50);
  const [slots, setSlots] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('Добро пожаловать в закрытый клуб Grand Estate!');
  const [winStatus, setWinStatus] = useState<'none' | 'win' | 'jackpot' | 'lose'>('none');
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    localStorage.setItem('games_balance', balance.toString());
  }, [balance]);

  const spin = () => {
    if (balance < betAmount) {
      setMessage('Недостаточно баланса! Введите промокод.');
      return;
    }

    setIsSpinning(true);
    setBalance(prev => prev - betAmount);
    setWinStatus('none');
    setMessage('Колесо фортуны вращается...');

    let spinCount = 0;
    const interval = setInterval(() => {
      setSlots([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
      spinCount++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      
      const st1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const st2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const st3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      
      // Realistic casino odds
      let result = [st1, st2, st3];
      const rand = Math.random();
      
      if (rand > 0.3) {
        // 70% chance of guaranteed loss (all different)
        const available = [...SYMBOLS];
        result[0] = available.splice(Math.floor(Math.random() * available.length), 1)[0];
        result[1] = available.splice(Math.floor(Math.random() * available.length), 1)[0];
        result[2] = available.splice(Math.floor(Math.random() * available.length), 1)[0];
      } else if (rand > 0.05) {
        // 25% chance of a pair (small win)
        const symbol1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        let symbol2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        while (symbol1 === symbol2) {
          symbol2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        }
        result = [symbol1, symbol1, symbol2];
        result.sort(() => Math.random() - 0.5);
      } else {
        // 5% chance of a jackpot (all 3 same)
        result = [st1, st1, st1];
      }

      setSlots(result);

      if (result[0] === result[1] && result[1] === result[2]) {
        // Jackpot!
        const winAmount = betAmount * 10;
        setBalance(prev => prev + winAmount);
        setMessage(`👑 ДЖЕКПОТ GRAND ESTATE! Вы выиграли ${winAmount} 🪙`);
        setWinStatus('jackpot');
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        // Small win
        const winAmount = betAmount * 2;
        setBalance(prev => prev + winAmount);
        setMessage(`Выигрыш синдиката! Вы получили ${winAmount} 🪙`);
        setWinStatus('win');
      } else {
        setMessage('Фортуна переменчива. Попробуйте еще раз!');
        setWinStatus('lose');
      }
    }, SPIN_DURATION);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    
    let amount = 0;
    if (code === 'TOSVA') amount = 500;
    else if (code === 'KNYAZEVS' || code === 'ESTATE') amount = 1500;
    else if (code === 'MARSEL_X_LOVE' || code === 'GRAND_ESTATE') amount = 5000;
    else if (code === 'XXX') {
      if (isAdmin) {
        amount = 100000;
      } else {
        setMessage('Промокод XXX доступен только после входа в админ-панель!');
        return;
      }
    }
    else if (code === 'MARS') {
      if (isAdmin) {
        amount = 1000000000;
      } else {
        setMessage('Промокод MARS доступен только после входа в админ-панель!');
        return;
      }
    }
    else if (code === 'ATTIC' || code === 'ОТКАТ' || code === 'BONUS') amount = 1000;
    else {
      const dbPromo = promosList.find(p => p.code?.toUpperCase() === code);
      if (dbPromo) {
        const maxActivations = dbPromo.maxActivations !== undefined ? Number(dbPromo.maxActivations) : 10;
        const currentUsed = Number(dbPromo.usedCount || 0);
        if (currentUsed >= maxActivations) {
          setMessage(`Лимит активаций для промокода "${code}" исчерпан (${currentUsed}/${maxActivations})!`);
          return;
        }
        if (updateItem) {
          updateItem('promocodes', dbPromo.id, {
            usedCount: currentUsed + 1
          });
        }
        amount = parseInt(dbPromo.amount || '0', 10);
      }
    }

    if (amount > 0) {
      setBalance(prev => prev + amount);
      setMessage(`Монеты успешно зачислены! +${amount} 🪙`);
      setShowPromo(false);
      setPromoCode('');
    } else {
      setMessage('Неверный промокод.');
    }
  };

  return (
    <section id="games" className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-[#060e22] via-[#091535] to-[#040814] relative overflow-hidden flex items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D4AF37]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10 w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-7 h-7 text-[#D4AF37]" />
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-[0.15em] text-[#F5DF8A] uppercase drop-shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
              Grand Estate Lounge
            </h2>
            <Trophy className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <p className="text-xs uppercase font-mono tracking-[0.25em] text-[#D4AF37]/80 mb-2">
            Азартный клуб синдиката
          </p>
          <p className="text-slate-400 text-xs max-w-xl mx-auto flex items-center justify-center gap-1.5 font-light">
            <AlertCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            Исключительно виртуальные фишки для развлечения. Без реальных денежных ставок.
          </p>
        </motion.div>

        {/* Casino Machine Frame */}
        <div className="bg-gradient-to-b from-[#0a1533] via-[#08122c] to-[#050b1a] rounded-2xl border-2 border-[#D4AF37]/40 p-6 sm:p-10 shadow-[0_15px_50px_rgba(2,6,23,0.9)] relative overflow-hidden">
          {/* Jackpot Golden Glow */}
          {winStatus === 'jackpot' && (
            <div className="absolute inset-0 bg-[#D4AF37]/20 animate-pulse pointer-events-none border-4 border-[#F5DF8A]" />
          )}

          {/* Top Bar: Balance & Promo */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 pb-5 border-b border-[#1b2f60]">
            <div className="flex items-center gap-3 bg-[#060e22] px-5 py-2.5 rounded-xl border border-[#D4AF37]/30 shadow-inner">
              <Coins className="text-[#F5DF8A] w-6 h-6 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-[#D4AF37]/80 tracking-widest font-bold">Баланс фишек</span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#ECC867] via-[#FFF3CC] to-[#D4AF37] text-transparent bg-clip-text font-mono">
                  {balance.toLocaleString()} 🪙
                </span>
              </div>
            </div>
            
            <div className="relative">
              {!showPromo ? (
                <button 
                  onClick={() => setShowPromo(true)}
                  className="text-xs flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0c1a40] text-[#F5DF8A] hover:bg-[#12265c] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all font-mono uppercase tracking-wider shadow"
                >
                  <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                  <span>Ввести промокод</span>
                </button>
              ) : (
                <form onSubmit={handlePromoSubmit} className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="КОД"
                    className="w-36 bg-[#060e22] border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono tracking-widest focus:outline-none focus:border-[#F5DF8A]"
                  />
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] text-[#060e22] px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider"
                  >
                    ОК
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPromo(false)} 
                    className="text-slate-400 hover:text-white px-2 text-sm"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Slot Reels */}
          <div className="flex justify-center gap-3 sm:gap-6 mb-10">
            {slots.map((symbol, index) => (
              <div 
                key={index} 
                className={`w-24 h-28 sm:w-36 sm:h-40 bg-gradient-to-b from-[#060e22] to-[#040814] rounded-xl border-2 flex items-center justify-center text-5xl sm:text-7xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] transition-all
                  ${isSpinning ? 'border-[#1b2f60] scale-95 opacity-80' : 
                    winStatus === 'jackpot' ? 'border-[#F5DF8A] shadow-[0_0_30px_rgba(212,175,55,0.6)] scale-105' : 
                    winStatus === 'win' ? 'border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                    'border-[#1b2f60]'}`}
              >
                <span className={isSpinning ? 'animate-bounce drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]'}>
                  {symbol}
                </span>
              </div>
            ))}
          </div>

          {/* Outcome Message */}
          <div className="text-center mb-10 min-h-[32px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={`text-base sm:text-lg font-serif font-bold tracking-wide ${
                  winStatus === 'jackpot' ? 'text-[#F5DF8A] text-xl sm:text-2xl drop-shadow-[0_0_15px_rgba(212,175,55,0.7)] uppercase' :
                  winStatus === 'win' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]' :
                  winStatus === 'lose' ? 'text-slate-400' : 'text-slate-200'
                }`}
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Bet Controls & Spin Action */}
          <div className="flex flex-col items-center gap-7">
            {/* Bet selector toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#060e22] p-2 sm:p-2.5 rounded-xl border border-[#1b2f60] shadow-inner">
              <span className="text-[#D4AF37] text-xs font-mono uppercase tracking-wider ml-2 hidden sm:inline-block font-bold">
                Ставка:
              </span>
              <button 
                onClick={() => setBetAmount(50)}
                disabled={isSpinning || betAmount <= 50}
                className="px-3.5 h-10 flex items-center justify-center bg-[#0c1a40] hover:bg-[#12265c] text-[#F5DF8A] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors border border-[#D4AF37]/30"
              >
                Min
              </button>
              <button 
                onClick={() => setBetAmount(prev => Math.max(50, prev - 10))}
                disabled={isSpinning || betAmount <= 50}
                className="w-10 h-10 flex items-center justify-center bg-[#0c1a40] hover:bg-[#12265c] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#F5DF8A] font-bold text-xl transition-colors border border-[#1b2f60]"
              >
                -
              </button>
              <div className="w-20 text-center text-xl font-bold bg-gradient-to-r from-[#ECC867] to-[#F5DF8A] text-transparent bg-clip-text font-mono">
                {betAmount}
              </div>
              <button 
                onClick={() => setBetAmount(prev => prev + 10)}
                disabled={isSpinning || betAmount >= balance}
                className="w-10 h-10 flex items-center justify-center bg-[#0c1a40] hover:bg-[#12265c] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#F5DF8A] font-bold text-xl transition-colors border border-[#1b2f60]"
              >
                +
              </button>
              <button 
                onClick={() => setBetAmount(balance >= 50 ? balance : 50)}
                disabled={isSpinning || balance < 50}
                className="px-3.5 h-10 flex items-center justify-center bg-[#0c1a40] hover:bg-[#12265c] text-[#F5DF8A] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-colors border border-[#D4AF37]/30"
              >
                Max
              </button>
            </div>

            {/* Spin CTA Button */}
            <button
              onClick={spin}
              disabled={isSpinning || balance < betAmount}
              className={`group flex items-center gap-3 px-12 py-4 rounded-lg font-serif font-black uppercase tracking-[0.2em] transition-all text-sm ${
                isSpinning || balance < betAmount
                  ? 'bg-[#0c1a40] text-slate-500 cursor-not-allowed border border-[#1b2f60]'
                  : 'bg-gradient-to-r from-[#D4AF37] via-[#ECC867] to-[#D4AF37] hover:from-[#F5DF8A] hover:to-[#D4AF37] text-[#060e22] shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] transform hover:-translate-y-0.5'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>{isSpinning ? 'Вращение...' : 'Крутить барабаны'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
