import { motion } from 'motion/react';
import { ShieldCheck, Scale, Award } from 'lucide-react';

const rules = [
  {
    id: 1,
    numeral: "I",
    title: "Честь и Преданность",
    text: "Уважай своих братьев по синдикату, не провоцируй внутренних конфликтов и не оставляй команду в решающие моменты битв."
  },
  {
    id: 2,
    numeral: "II",
    title: "Вклад в Величие",
    text: "Каждый ресурс, транспорт или оружие из арсенала семьи — общее достояние. Возвращай долг и вноси вклад в процветание синдиката."
  },
  {
    id: 3,
    numeral: "III",
    title: "Дисциплина и Пунктуальность",
    text: "На ключевые события (контейнеры, капты, сборы) являемся вовремя. В случае форс-мажора заблаговременно информируем старший состав."
  }
];

export default function Rules() {
  return (
    <section id="rules" className="py-24 bg-gradient-to-b from-[#050b18] via-[#08132e] to-[#050b18] border-t border-[#D4AF37]/15 relative overflow-hidden">
      {/* Subtle background glow and texture */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#0c1a40] border border-[#D4AF37]/30 text-[10px] font-mono uppercase tracking-[0.2em] text-[#F5DF8A]">
            <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Нерушимый Кодекс</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-serif text-[#F5DF8A] mb-3 uppercase tracking-[0.15em] font-bold drop-shadow-[0_4px_20px_rgba(212,175,55,0.25)]">
            Кодекс Чести Grand Estate
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
            Три основополагающих правила, на которых держится могущество нашей семьи
          </p>
          <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-6"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group relative bg-[#091533]/90 backdrop-blur-md border border-[#1d3163] p-7 sm:p-8 rounded-lg flex flex-col sm:flex-row gap-6 items-start hover:border-[#D4AF37]/70 transition-all duration-300 shadow-[0_4px_25px_rgba(2,6,23,0.6)] hover:shadow-[0_10px_35px_rgba(2,6,23,0.9)] hover:-translate-y-0.5"
            >
              {/* Left Gold Border Accent */}
              <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-lg bg-gradient-to-b from-[#D4AF37] via-[#ECC867] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Roman numeral symbol */}
              <div className="flex sm:flex-col items-center justify-center min-w-[70px] min-h-[70px] rounded-lg bg-[#060e22] border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-all">
                <span className="text-[#F5DF8A] font-serif text-3xl font-black group-hover:scale-110 transition-transform">
                  {rule.numeral}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37]/60 hidden sm:block">
                  Закон
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-[#F5DF8A] transition-colors tracking-wide uppercase">
                    {rule.title}
                  </h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
                  {rule.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
