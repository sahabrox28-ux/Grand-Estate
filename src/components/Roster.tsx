import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Trash2, Crown, Plus, Sparkles } from 'lucide-react';
import { useCollection } from '../lib/store';
import { useAdmin } from '../lib/AdminContext';

export default function Roster() {
  const members = useCollection('members');
  const { isAdmin, addItem, deleteItem } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('');
  const [newLevel, setNewLevel] = useState(1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem('members', {
      name: newName,
      rank: newRank,
      level: Number(newLevel)
    });
    setIsAdding(false);
    setNewName('');
    setNewRank('');
    setNewLevel(1);
  };

  return (
    <section id="roster" className="py-24 bg-[#050b18] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-16 relative">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#F5DF8A] uppercase tracking-[0.2em] text-center border-b border-[#D4AF37]/30 pb-3 max-w-md w-full">
              Элитный Состав Grand Estate
            </h2>
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]/70">
            Иерархия и верховное командование
          </p>

          {isAdmin && !isAdding && (
            <button 
              onClick={() => setIsAdding(true)} 
              className="mt-6 md:mt-0 md:absolute md:right-0 md:top-0 text-xs text-[#060e22] bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] hover:from-[#F5DF8A] hover:to-[#D4AF37] px-4 py-2 rounded-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Добавить участника</span>
            </button>
          )}
        </div>

        {/* Add Member Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-[#0a1533] border border-[#D4AF37]/50 p-6 rounded-lg mb-10 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D4AF37]/20">
              <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5DF8A]">Внести участника в состав</h4>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Grand Estate Registry</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Никнейм</label>
                <input 
                  required 
                  placeholder="Имя_Фамилия" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-2.5 rounded text-sm focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Ранг</label>
                <input 
                  required 
                  placeholder="[10] Лидер" 
                  value={newRank} 
                  onChange={e => setNewRank(e.target.value)} 
                  className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-2.5 text-sm rounded focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Уровень</label>
                <input 
                  required 
                  type="number" 
                  placeholder="Уровень (цифра)" 
                  value={newLevel} 
                  onChange={e => setNewLevel(parseInt(e.target.value))} 
                  className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-2.5 text-sm rounded focus:outline-none transition-colors" 
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-slate-400 text-xs uppercase tracking-widest hover:text-white px-4 py-2 transition-colors"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] text-[#060e22] text-xs uppercase tracking-widest font-black px-5 py-2.5 rounded shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
              >
                Сохранить
              </button>
            </div>
          </form>
        )}

        {/* Members Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1b2f60] bg-[#08122a] shadow-[0_10px_40px_rgba(2,6,23,0.8)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1b2f60] text-xs uppercase tracking-[0.2em] text-[#D4AF37] bg-[#0c1a40]">
                <th className="py-5 px-6 font-semibold">Имя (Никнейм)</th>
                <th className="py-5 px-6 font-semibold">Ранг</th>
                {isAdmin && <th className="py-5 px-6 font-semibold text-right">Действия</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132247]">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 3 : 2} className="py-12 text-center text-slate-400 text-sm font-mono uppercase tracking-widest">
                    Нет участников в составе
                  </td>
                </tr>
              ) : members.map((member, index) => {
                const isLeader = member.rank.includes('10');
                const isDeputy = member.rank.includes('9');
                
                return (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    className="hover:bg-[#0c1a40]/60 transition-colors group"
                  >
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all
                          ${isLeader ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#0c1a40] border-[#D4AF37] text-[#F5DF8A] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 
                            isDeputy ? 'bg-[#0a1533] border-[#D4AF37]/40 text-[#F5DF8A]' : 
                            'bg-[#060e22] border-[#1b2f60] text-slate-400 group-hover:text-[#D4AF37]'}
                        `}>
                          {isLeader ? <Crown className="w-5 h-5 text-[#D4AF37]" /> : 
                           isDeputy ? <Shield className="w-4 h-4 text-[#D4AF37]" /> : 
                           <User className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm md:text-base ${
                            isLeader 
                              ? 'text-[#F5DF8A] font-serif tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]' 
                              : isDeputy 
                              ? 'text-slate-100 font-semibold' 
                              : 'text-slate-200'
                          }`}>
                            {member.name}
                          </span>
                          {isLeader && (
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37]/80">
                              Глава Синдиката
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex px-3.5 py-1.5 text-[11px] uppercase font-mono tracking-wider rounded border
                        ${isLeader ? 'bg-[#D4AF37]/15 text-[#F5DF8A] border-[#D4AF37]/60 font-bold' : 
                          isDeputy ? 'bg-[#0c1a40] text-slate-200 border-[#D4AF37]/30 font-medium' : 
                          'bg-[#060e22] text-slate-400 border-[#1b2f60]'}
                      `}>
                        {member.rank}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4.5 px-6 text-right">
                        <button 
                          onClick={() => deleteItem('members', member.id)} 
                          className="text-slate-500 hover:text-red-400 p-2 rounded hover:bg-red-950/30 transition-colors"
                          title="Исключить из состава"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
