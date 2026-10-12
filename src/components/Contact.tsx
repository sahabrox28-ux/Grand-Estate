import { motion } from 'motion/react';
import { Send, Trash2, Plus, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useCollection } from '../lib/store';
import { useAdmin } from '../lib/AdminContext';

export default function Contact() {
  const contacts = useCollection('contacts');
  const { isAdmin, addItem, deleteItem } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newPlatform, setNewPlatform] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const formatDetails = (text: string) => {
    if (!text) return '';
    if (text.startsWith('http://') || text.startsWith('https://')) {
      try {
        const url = new URL(text);
        let display = url.hostname + url.pathname;
        if (display.endsWith('/')) {
          display = display.slice(0, -1);
        }
        display = display.replace(/^www\./, '');
        return display.length > 32 ? display.substring(0, 29) + '...' : display;
      } catch {
        // Fallback
      }
    }
    return text.length > 32 ? text.substring(0, 29) + '...' : text;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem('contacts', {
      platform: newPlatform,
      details: newDetails,
      url: newUrl || '#'
    });
    setIsAdding(false);
    setNewPlatform('');
    setNewDetails('');
    setNewUrl('');
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-[#050b18] via-[#081432] to-[#040814] border-t border-[#D4AF37]/15">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-center mb-8 relative">
            <h2 className="font-serif text-2xl md:text-3xl text-[#F5DF8A] uppercase tracking-[0.2em] text-center font-bold">
              Связь с Grand Estate
            </h2>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]/70 mt-1">
              Официальные каналы связи и вступление
            </p>

            {isAdmin && !isAdding && (
              <button 
                onClick={() => setIsAdding(true)} 
                className="mt-4 md:mt-0 md:absolute md:right-0 md:top-0 text-xs text-[#060e22] bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] hover:from-[#F5DF8A] hover:to-[#D4AF37] px-4 py-2 rounded-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Добавить канал</span>
              </button>
            )}
          </div>

          {/* Family Motto Quote */}
          <div className="relative mb-12 p-8 rounded-xl bg-gradient-to-r from-[#0a1738] via-[#0d1f4b] to-[#0a1738] border border-[#D4AF37]/30 shadow-[0_4px_30px_rgba(2,6,23,0.7)] text-center">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3 text-[#F5DF8A]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-serif italic">
              «Сила в единстве, статус в безупречности. Семья Grand Estate — твой путь к абсолютной вершине Black Russia.»
            </p>
            <div className="w-16 h-0.5 bg-[#D4AF37]/40 mx-auto mt-4" />
          </div>

          {/* Add contact form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="bg-[#0a1533] border border-[#D4AF37]/50 p-6 rounded-lg mb-8 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D4AF37]/20">
                <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5DF8A]">Новый контакт</h4>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Связь</span>
              </div>
              <div className="space-y-3.5">
                <input 
                  required 
                  placeholder="Платформа (например, Discord, Telegram, VK)" 
                  value={newPlatform} 
                  onChange={e => setNewPlatform(e.target.value)} 
                  className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-2.5 rounded text-sm focus:outline-none transition-colors" 
                />
                <input 
                  required 
                  placeholder="Контакты (ID, никнейм или тег)" 
                  value={newDetails} 
                  onChange={e => setNewDetails(e.target.value)} 
                  className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-2.5 text-sm rounded focus:outline-none transition-colors" 
                />
                <input 
                  placeholder="Ссылка на ресурс (URL)" 
                  value={newUrl} 
                  onChange={e => setNewUrl(e.target.value)} 
                  className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-2.5 rounded text-sm focus:outline-none transition-colors" 
                />
                <div className="flex gap-3 justify-end pt-2">
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
              </div>
            </form>
          )}

          {/* Contact list cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.length === 0 ? (
              <div className="col-span-2 text-center py-8 bg-[#0a1533] border border-[#1b2f60] rounded-lg">
                <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Контакты еще не внесены</p>
              </div>
            ) : contacts.map(c => (
              <div 
                key={c.id} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-[#091534] to-[#071026] border border-[#1b2f60] hover:border-[#D4AF37]/50 rounded-lg group transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                <a 
                  href={c.url !== '#' ? c.url : undefined} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-3.5 flex-grow cursor-pointer"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-[#0c1c44] to-[#060e22] rounded-lg flex items-center justify-center text-[#F5DF8A] font-mono text-xs uppercase font-bold border border-[#D4AF37]/35 group-hover:border-[#D4AF37] shadow-sm">
                    {c.platform.substring(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[#D4AF37] text-[10px] font-mono uppercase tracking-wider font-bold">
                        {c.platform}
                      </h4>
                      {c.url && c.url !== '#' && (
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-[#D4AF37] transition-colors" />
                      )}
                    </div>
                    <p className="text-slate-100 font-mono text-xs mt-0.5 font-medium">{formatDetails(c.details)}</p>
                  </div>
                </a>
                {isAdmin && (
                  <button 
                    onClick={() => deleteItem('contacts', c.id)} 
                    className="text-slate-500 hover:text-red-400 p-2 ml-3 rounded hover:bg-red-950/30 transition-colors"
                    title="Удалить контакт"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
