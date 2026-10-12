import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Calendar, User, Trash2, Plus, Sparkles } from 'lucide-react';
import { useCollection } from '../lib/store';
import { useAdmin } from '../lib/AdminContext';

export default function News() {
  const items = useCollection('news');
  const { isAdmin, addItem, deleteItem } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem('news', {
      title: newTitle,
      content: newContent,
      date: newDate,
      author: 'Grand Estate Admin'
    });
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
    setNewDate('');
  };

  return (
    <section id="news" className="py-24 bg-[#050b18] border-t border-[#D4AF37]/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 relative">
          <div className="flex items-center gap-4 w-full max-w-2xl mb-3">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="font-serif text-2xl md:text-3xl text-[#F5DF8A] uppercase tracking-[0.2em] text-center font-bold">
                Хроника Grand Estate
              </h2>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]/70">
            Главные события и приказы синдиката
          </p>

          {isAdmin && !isAdding && (
            <button 
              onClick={() => setIsAdding(true)} 
              className="mt-6 md:mt-0 md:absolute md:right-0 md:top-0 text-xs text-[#060e22] bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] hover:from-[#F5DF8A] hover:to-[#D4AF37] px-4 py-2 rounded-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Добавить новость</span>
            </button>
          )}
        </div>

        {/* Admin Add Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-[#0a1533] border border-[#D4AF37]/50 p-6 rounded-lg mb-12 max-w-2xl mx-auto shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
                <h4 className="font-serif text-sm uppercase tracking-wider text-[#F5DF8A]">Новое объявление</h4>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Grand Estate Dispatch</span>
              </div>
              <input 
                required 
                placeholder="Заголовок объявления" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-3 rounded text-sm focus:outline-none transition-colors" 
              />
              <input 
                required 
                placeholder="Дата (например, Сегодня | 20:00)" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-3 text-sm rounded focus:outline-none transition-colors" 
              />
              <textarea 
                required 
                placeholder="Подробный текст новости..." 
                value={newContent} 
                onChange={e => setNewContent(e.target.value)} 
                rows={3} 
                className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white p-3 rounded text-sm focus:outline-none transition-colors" 
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
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] text-[#060e22] text-xs uppercase tracking-widest font-black px-5 py-2.5 rounded shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
                >
                  Опубликовать
                </button>
              </div>
            </div>
          </form>
        )}

        {/* News Cards */}
        {items.length === 0 ? (
          <div className="text-center py-12 bg-[#08122a] border border-[#1b2f60] rounded-lg">
            <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">Нет активных объявлений</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-b from-[#0a1533] to-[#070f24] border border-[#192c5a] hover:border-[#D4AF37]/60 rounded-lg p-7 flex flex-col group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(2,6,23,0.8)] hover:-translate-y-1 relative"
              >
                {isAdmin && (
                  <button 
                    onClick={() => deleteItem('news', item.id)} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1.5 transition-colors rounded hover:bg-red-950/30"
                    title="Удалить новость"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex justify-between items-start mb-5">
                  <div className="p-3 bg-[#0e1d44] border border-[#D4AF37]/30 rounded-lg group-hover:bg-[#D4AF37]/15 group-hover:border-[#D4AF37] transition-colors">
                    <Megaphone className="w-5 h-5 text-[#F5DF8A]" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D4AF37]/80 uppercase mt-1 bg-[#050b18] px-2.5 py-1 rounded border border-[#192c5a]">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    <span>{item.date}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-[#F5DF8A] transition-colors font-serif leading-snug pr-6">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow font-sans font-light">
                  {item.content}
                </p>
                
                <div className="mt-auto flex justify-between items-center pt-5 border-t border-[#192c5a] text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-6 h-6 rounded bg-[#060e22] flex items-center justify-center border border-[#D4AF37]/30 text-xs">
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <span className="font-medium text-slate-300">{item.author}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37]/60">
                    Grand Estate
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
