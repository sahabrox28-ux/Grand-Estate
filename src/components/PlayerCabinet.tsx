import React, { useState } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { useCollection } from '../lib/store';
import { 
  Shield, 
  Coins, 
  KeyRound, 
  Check, 
  LogOut, 
  Sparkles, 
  Terminal, 
  AlertCircle, 
  Trophy, 
  Lock, 
  RefreshCw,
  Eye,
  EyeOff,
  ClipboardCopy
} from 'lucide-react';

export default function PlayerCabinet({ onClose }: { onClose: () => void }) {
  const { playerUser, logoutPlayer, updateItem, listPromos } = useAdmin() as any;
  const promosList = useCollection('promocodes');

  // New Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Promo Code Fields
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  // General States
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!playerUser) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400">Ошибка: Пользователь не авторизован.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
        >
          Закрыть
        </button>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(playerUser.id);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    const pwd = newPassword.trim();
    if (!pwd) {
      setPwdError('Введите новый пароль');
      return;
    }
    if (pwd.length < 4) {
      setPwdError('Пароль должен состоять минимум из 4 символов');
      return;
    }
    if (pwd !== confirmPassword.trim()) {
      setPwdError('Пароли не совпадают');
      return;
    }

    try {
      await updateItem('players_accounts', playerUser.id, {
        password: pwd
      });
      setPwdSuccess('Пароль успешно изменен! Используйте его для следующего входа.');
      setNewPassword('');
      setConfirmPassword('');
      // Update local storage so onSnapshot won't log us out because of changed password
      localStorage.setItem('player_pwd', pwd);
    } catch (err: any) {
      setPwdError('Не удалось изменить пароль: ' + err.message);
    }
  };

  const handleActivatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();

    if (!code) {
      setPromoError('Введите промокод');
      return;
    }

    setIsActivating(true);

    try {
      // Check if code has already been used by this player
      const alreadyUsed = (playerUser.usedPromos || []).some(
        (c: string) => c.toUpperCase() === code
      );

      if (alreadyUsed) {
        setPromoError('Вы уже активировали этот промокод!');
        setIsActivating(false);
        return;
      }

      // Find promo code in local firestore collection
      const matchedPromo = promosList.find(
        (p: any) => (p.code || '').toUpperCase() === code
      );

      if (!matchedPromo) {
        // Fallback or general codes
        if (['TOSVA', 'KNYAZEVS', 'MARSEL_X_LOVE', 'XXX', 'MARS', 'ATTIC', 'ОТКАТ', 'BONUS'].includes(code)) {
          // Classic built-in codes
          const bonusAmount = 5000;
          const updatedCoins = (playerUser.coins || 0) + bonusAmount;
          const updatedUsed = [...(playerUser.usedPromos || []), code];

          await updateItem('players_accounts', playerUser.id, {
            coins: updatedCoins,
            usedPromos: updatedUsed
          });

          setPromoSuccess(`Классический промокод ${code} активирован! Зачислено +${bonusAmount} монет 🪙`);
          setPromoInput('');
        } else {
          setPromoError('Такой промокод не существует или срок его действия истек!');
        }
        setIsActivating(false);
        return;
      }

      // Check activation limit
      const maxActivations = matchedPromo.maxActivations !== undefined ? Number(matchedPromo.maxActivations) : 10;
      const currentUsed = Number(matchedPromo.usedCount || 0);

      if (currentUsed >= maxActivations) {
        setPromoError(`Лимит активаций для промокода "${code}" исчерпан (${currentUsed}/${maxActivations})!`);
        setIsActivating(false);
        return;
      }

      // Add money and record as used
      const bonusAmount = matchedPromo.amount || 1000;
      const updatedCoins = (playerUser.coins || 0) + bonusAmount;
      const updatedUsed = [...(playerUser.usedPromos || []), code];

      await updateItem('players_accounts', playerUser.id, {
        coins: updatedCoins,
        usedPromos: updatedUsed
      });

      // Increment activations count on the promo code document
      await updateItem('promocodes', matchedPromo.id, {
        usedCount: currentUsed + 1
      });

      const remaining = maxActivations - (currentUsed + 1);
      setPromoSuccess(`Промокод "${code}" успешно активирован! (${currentUsed + 1}/${maxActivations}) Зачислено +${bonusAmount} монет 🪙${remaining > 0 ? ` (Осталось активаций: ${remaining})` : ''}`);
      setPromoInput('');

    } catch (err: any) {
      setPromoError('Ошибка при активации: ' + err.message);
    } finally {
      setIsActivating(false);
    }
  };

  const isAlpha = playerUser.rank === 'Альфа';

  return (
    <div id="player-cabinet" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
      
      {/* Column 1: Card of Player (col-span-5) */}
      <div className="md:col-span-5 space-y-6">
        {/* Elite Player ID Badge */}
        <div className="bg-[#141414] border border-[#D4AF37]/30 rounded-2xl overflow-hidden relative shadow-[0_4px_30px_rgba(212,175,55,0.05)]">
          <div className="h-2 bg-gradient-to-r from-yellow-600 via-[#D4AF37] to-amber-700"></div>
          
          <div className="p-6 space-y-6 relative">
            <div className="absolute top-4 right-4 animate-pulse">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-zinc-950 font-bold border ${
                isAlpha 
                  ? 'text-[#D4AF37] border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              }`}>
                {playerUser.rank} Active
              </span>
            </div>

            {/* Header Identity */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-inner ${
                isAlpha 
                  ? 'bg-gradient-to-br from-amber-950/20 to-black border-[#D4AF37] text-[#D4AF37]' 
                  : 'bg-gradient-to-br from-cyan-950/20 to-black border-cyan-500 text-cyan-400'
              }`}>
                {isAlpha ? (
                  <Sparkles className="w-7 h-7" />
                ) : (
                  <Shield className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="font-serif text-xl tracking-wider text-white truncate max-w-[180px]">
                  {playerUser.nickname}
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                  ID: <span className="text-zinc-400 font-bold">{playerUser.id.substring(0, 8)}...</span>
                  <button 
                    onClick={handleCopyId}
                    className="text-[#D4AF37] hover:text-[#F5DF8A] transition-colors p-0.5" 
                    title="Копировать полный ID"
                  >
                    {copyFeedback ? <Check className="w-3 h-3 text-green-500" /> : <ClipboardCopy className="w-3 h-3" />}
                  </button>
                </p>
              </div>
            </div>

            {/* Stats list */}
            <div className="bg-black/50 rounded-xl p-4 border border-zinc-900 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Ваш Статус</span>
                <span className={`font-bold ${isAlpha ? 'text-[#D4AF37]' : 'text-cyan-400'}`}>
                  {isAlpha ? 'Элитный Боец [Альфа]' : 'Оперативник [Бета]'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Баланс Монет</span>
                <span className="text-yellow-400 font-bold flex items-center gap-1.5 text-sm">
                  <Coins className="w-4 h-4" /> {playerUser.coins || 0} 🪙
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Код дешифровки</span>
                <span className="text-emerald-500 font-bold uppercase select-all tracking-wider font-mono">
                  KEY_SEC_OK
                </span>
              </div>
            </div>

            {/* Quote of the faction */}
            <div className="p-3.5 bg-[#070e22] rounded-lg border-l-2 border-[#D4AF37] text-[10px] text-slate-300 italic">
              «Верность ордену и железная дисциплина. Мы действуем в тени, защищая величие Grand Estate.»
            </div>
            
            {/* Quick Actions */}
            <button 
              onClick={logoutPlayer}
              className="w-full bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Выйти из кабинета
            </button>
          </div>
        </div>
      </div>

      {/* Column 2: Dashboard Sections (col-span-7) */}
      <div className="md:col-span-7 space-y-6">
        
        {/* Section A: Special Directives & Missions (Strategic tasks) */}
        <div className="bg-[#141414] border border-zinc-850 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-900">
            <Terminal className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h4 className="font-serif text-[#D4AF37] text-sm uppercase tracking-wider">
                Специальные Директивы ордена
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-0.5">Личные тактические поручения для Вашего ранга</p>
            </div>
          </div>

          <div className="space-y-4">
            {isAlpha ? (
              <>
                <div className="p-4 bg-zinc-950 border border-[#D4AF37]/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase flex items-center gap-1.5 font-serif">
                      <Trophy className="w-3.5 h-3.5" /> Директива №1: Глубокий Осведомитель
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono">Выполняется</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Сформируйте лояльную группу среди новых постояльцев и проведите сбор сведений о подозрительных операциях в секторе.
                  </p>
                  <div className="space-y-1.5 font-mono text-[10px] text-zinc-500">
                    <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-500" /> Проинспектировать штабные файлы</div>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-400">●</div> Переговорить со старшим офицером (Marsel)</div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900   rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Задание №2: Защита Высшего Звена
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400 font-mono font-bold">Особая Ложа</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Обеспечивайте беспрепятственное конвоирование высокопоставленных лиц фракции при посещении важных деловых объектов.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-zinc-950 border border-cyan-500/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5 font-serif">
                      <Terminal className="w-3.5 h-3.5" /> Директива №1: Охрана периметра
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono">Активна</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Регулярно обходите все ключевые контрольно-пропускные пункты и фиксируйте любые отклонения в суточном бортовом журнале.
                  </p>
                  <div className="space-y-1.5 font-mono text-[10px] text-zinc-500">
                    <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Проверить ворота северного двора</div>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-cyan-400">●</div> Передать рапорт дежурному диспетчеру</div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-500" /> Задание №2: Снабжение и логистика
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">Доступно</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Доставьте секретный запечатанный дипломат с материалами дел по указанному координатору. Будьте бдительны на дорогах.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section B: Promo Activation (Real dynamic) */}
        <div className="bg-[#141414] border border-zinc-850 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5 mb-4">
            <Coins className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h4 className="font-serif text-[#D4AF37] text-sm uppercase tracking-wider">
                Активация бонусных кодов
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-0.5">Вводите секретные промокоды от руководства</p>
            </div>
          </div>

          <form onSubmit={handleActivatePromo} className="space-y-4">
            <div className="flex gap-2">
              <input
                required
                type="text"
                placeholder="ВВЕДИТЕ ПРОМОКОД (например, TOSVA)"
                value={promoInput}
                onChange={e => { setPromoInput(e.target.value); setPromoError(''); setPromoSuccess(''); }}
                className="flex-1 bg-black/60 border border-zinc-800 text-white px-4 py-3 rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:border-[#D4AF37] placeholder-zinc-600 uppercase"
              />
              <button
                type="submit"
                disabled={isActivating}
                className="bg-[#D4AF37] text-black hover:bg-[#F5DF8A] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] font-mono font-bold text-xs uppercase tracking-wider px-5 rounded-xl transition-all disabled:brightness-50 flex items-center gap-1.5 shrink-0"
              >
                {isActivating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Активировать
              </button>
            </div>

            {promoError && (
              <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            {promoSuccess && (
              <div className="flex items-center gap-2 text-green-500 text-[11px] font-bold bg-green-950/20 border border-green-500/20 p-3 rounded-xl">
                <Check className="w-4 h-4 shrink-0" />
                <span>{promoSuccess}</span>
              </div>
            )}
          </form>
        </div>

        {/* Section C: Safety change password */}
        <div className="bg-[#141414] border border-zinc-850 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5 mb-4">
            <KeyRound className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h4 className="font-serif text-[#D4AF37] text-sm uppercase tracking-wider">
                Безопасность учетной записи
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mt-0.5 font-bold">Изменение пароля для доступа в Личный Кабинет</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5 ml-1 font-mono">
                  Новый пароль
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPwd ? "text" : "password"}
                    placeholder="Минимум 4 символа"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPwdError(''); setPwdSuccess(''); }}
                    className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-700 focus:border-[#D4AF37] text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(!showPwd)} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#D4AF37]"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5 ml-1 font-mono">
                  Повторите пароль
                </label>
                <input
                  required
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPwdError(''); setPwdSuccess(''); }}
                  className="w-full bg-black/60 border border-zinc-800 hover:border-zinc-700 focus:border-[#D4AF37] text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            {pwdError && (
              <p className="text-red-500 text-[11px] font-bold bg-red-950/20 border border-red-500/20 px-3.5 py-2.5 rounded-xl">{pwdError}</p>
            )}

            {pwdSuccess && (
              <p className="text-green-500 text-[11px] font-bold bg-green-950/20 border border-green-500/20 px-3.5 py-2.5 rounded-xl">{pwdSuccess}</p>
            )}

            <button
              type="submit"
              className="bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#F5DF8A] transition-all font-mono font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 w-full shadow-inner"
            >
              <Lock className="w-4 h-4" />
              Применить новый пароль
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
