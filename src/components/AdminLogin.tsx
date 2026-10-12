import React, { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { useCollection } from '../lib/store';
import PlayerCabinet from './PlayerCabinet';
import { 
  Lock, 
  Unlock, 
  LogOut, 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  Shuffle, 
  KeyRound, 
  User, 
  FileText,
  UserPlus,
  Shield,
  Ticket,
  Users,
  UserCheck,
  Crown,
  AlertTriangle,
  Loader2,
  X,
  Edit3,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Plus,
  Sparkles,
  Coins,
  Flame,
  Infinity
} from 'lucide-react';

function generateRandomPassword(length: number, options: { upper: boolean, lower: boolean, numbers: boolean, symbols: boolean }) {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numChars = '0123456789';
  const symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let allowedChars = '';
  if (options.upper) allowedChars += upperChars;
  if (options.lower) allowedChars += lowerChars;
  if (options.numbers) allowedChars += numChars;
  if (options.symbols) allowedChars += symChars;

  if (allowedChars.length === 0) return '';

  let generatedPassword = '';
  if (options.upper) generatedPassword += upperChars[Math.floor(Math.random() * upperChars.length)];
  if (options.lower) generatedPassword += lowerChars[Math.floor(Math.random() * lowerChars.length)];
  if (options.numbers) generatedPassword += numChars[Math.floor(Math.random() * numChars.length)];
  if (options.symbols) generatedPassword += symChars[Math.floor(Math.random() * symChars.length)];

  while (generatedPassword.length < length) {
    generatedPassword += allowedChars[Math.floor(Math.random() * allowedChars.length)];
  }

  return generatedPassword.split('').sort(() => Math.random() - 0.5).join('');
}

function generateRandomPromo(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let promo = 'PROMO-';
  for (let i = 0; i < length; i++) {
    promo += chars[Math.floor(Math.random() * chars.length)];
  }
  return promo;
}

export default function AdminLogin() {
  const { 
    isAdmin, 
    adminUser, 
    login, 
    logout, 
    isPlayer, 
    playerUser, 
    loginPlayer, 
    logoutPlayer, 
    addItem, 
    updateItem, 
    deleteItem 
  } = useAdmin();
  const passwordsList = useCollection('user_passwords');
  const promosList = useCollection('promocodes');
  const adminsList = useCollection('admin_accounts');
  const playersList = useCollection('players_accounts');

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'passwords' | 'promos' | 'admins' | 'players'>('passwords');

  // Role selection state for login: 'admin' (level 1-3) or 'player' (Alpha/Beta cabinet)
  const [loginRole, setLoginRole] = useState<'admin' | 'player'>('admin');

  // Login states
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register states
  const [regNickname, setRegNickname] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLevel, setRegLevel] = useState(1);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Player Search Query
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // Password generator states
  const [nickname, setNickname] = useState('');
  const [memo, setMemo] = useState('');
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Promo code generator states
  const [newPromoCode, setNewPromoCode] = useState('');
  const [promoCoins, setPromoCoins] = useState(1000);
  const [promoMaxActivations, setPromoMaxActivations] = useState(10);
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccessStatus, setPromoSuccessStatus] = useState<string | null>(null);

  // Promo editing modal states
  const [editingPromo, setEditingPromo] = useState<{
    id: string;
    code: string;
    amount: number;
    maxActivations: number;
    usedCount: number;
  } | null>(null);
  const [editMaxActivations, setEditMaxActivations] = useState(10);
  const [editUsedCount, setEditUsedCount] = useState(0);
  const [editAmount, setEditAmount] = useState(1000);
  const [isUpdatingPromo, setIsUpdatingPromo] = useState(false);

  // Clipboard copying helpers
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGenerated, setCopiedGenerated] = useState(false);

  // Eyes toggle helper for lists
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Admin deletion confirmation & status states
  const [adminToDelete, setAdminToDelete] = useState<{ id: string; nickname: string } | null>(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [adminActionStatus, setAdminActionStatus] = useState<string | null>(null);
  const [confirmInlineId, setConfirmInlineId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAdmin && !generatedPassword) {
      handleGenerate();
    }
  }, [isOpen, isAdmin]);

  const handleGenerate = () => {
    const newPwd = generateRandomPassword(length, {
      upper: includeUpper,
      lower: includeLower,
      numbers: includeNumbers,
      symbols: includeSymbols,
    });
    setGeneratedPassword(newPwd);
  };

  const handleRandomPromo = () => {
    setNewPromoCode(generateRandomPromo());
  };

  // Submit Login
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    
    const trimmedNick = loginNickname.trim();
    const lNick = trimmedNick.toLowerCase();
    const trimmedPwd = loginPwd.trim();
    const lPwd = trimmedPwd.toLowerCase();

    // Auto-detect owner login even if user was on the player tab
    if (
      lNick === 'марсель' || 
      lNick === 'марсел' || 
      lNick === 'marsel' || 
      lPwd === '123456789' || 
      lPwd === 'knyazy' || 
      lPwd === 'admin123' || 
      lPwd === 'admin' || 
      lPwd === 'grandestate'
    ) {
      const okAdmin = await login(trimmedNick || 'Марсель', trimmedPwd || '123456789');
      if (okAdmin) {
        setLoginNickname('');
        setLoginPwd('');
        return;
      }
    }

    if (loginRole === 'player') {
      const ok = await loginPlayer(trimmedNick, trimmedPwd);
      if (!ok) {
        setLoginError('Неверный никнейм игрока или пароль');
      } else {
        setLoginNickname('');
        setLoginPwd('');
      }
    } else {
      const ok = await login(trimmedNick, trimmedPwd);
      if (!ok) {
        setLoginError('Неверный никнейм администратора или пароль');
      } else {
        setLoginNickname('');
        setLoginPwd('');
      }
    }
  }

  // Submit Registration of new Admin (Level 3 creator only)
  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!canManageAdmins) {
      setRegError('Только администраторы 3 уровня могут регистрировать новые панели!');
      return;
    }

    const trimmedNick = regNickname.trim();
    const pwd = regPassword.trim();
    if (!trimmedNick || !pwd) {
      setRegError('Заполните все поля!');
      return;
    }

    // Check if nickname already exists
    const nickExists = adminsList.some(
      a => (a.nickname || '').toLowerCase() === trimmedNick.toLowerCase()
    );
    if (nickExists || trimmedNick.toLowerCase() === 'root' || trimmedNick.toLowerCase() === 'admin' || trimmedNick.toLowerCase() === 'marsel') {
      setRegError('Администратор с таким никнеймом уже зарегистрирован!');
      return;
    }

    try {
      await addItem('admin_accounts', {
        nickname: trimmedNick,
        password: pwd,
        level: regLevel,
        createdAt: Date.now()
      });
      setRegSuccess(`Админ-панель для игрока ${trimmedNick} успешно создана!`);
      setRegNickname('');
      setRegPassword('');
    } catch (err: any) {
      setRegError('Ошибка регистрации: ' + err.message);
    }
  }

  // Create Promo Code
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccessStatus(null);
    const code = newPromoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Введите текст промокода');
      return;
    }
    if (promoCoins <= 0) {
      setPromoError('Сумма монет должна быть больше 0');
      return;
    }
    if (promoMaxActivations <= 0) {
      setPromoError('Лимит активаций должен быть больше 0');
      return;
    }

    // Check if exists
    const codeExists = promosList.some(p => p.code?.toUpperCase() === code);
    if (codeExists || ['TOSVA', 'KNYAZEVS', 'MARSEL_X_LOVE', 'XXX', 'MARS', 'ATTIC', 'ОТКАТ', 'BONUS'].includes(code)) {
      setPromoError('Такой промокод уже существует!');
      return;
    }

    try {
      await addItem('promocodes', {
        code,
        amount: promoCoins,
        maxActivations: promoMaxActivations,
        usedCount: 0,
        createdBy: adminUser?.nickname || 'Неизвестно',
        createdAt: Date.now()
      });
      setNewPromoCode('');
      setPromoCoins(1000);
      setPromoMaxActivations(10);
      setPromoSuccessStatus(`Промокод «${code}» успешно создан! Лимит активаций: ${promoMaxActivations}`);
      setTimeout(() => setPromoSuccessStatus(null), 4000);
    } catch (err: any) {
      setPromoError('Ошибка при создании промокода');
    }
  };

  const handleOpenEditPromo = (promo: any) => {
    const curMax = promo.maxActivations !== undefined ? parseInt(promo.maxActivations, 10) : 10;
    const curUsed = parseInt(promo.usedCount || '0', 10);
    const curAmount = parseInt(promo.amount || '1000', 10);
    setEditingPromo({
      id: promo.id,
      code: promo.code,
      amount: curAmount,
      maxActivations: curMax,
      usedCount: curUsed
    });
    setEditAmount(curAmount);
    setEditMaxActivations(curMax);
    setEditUsedCount(curUsed);
  };

  const handleSavePromoEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPromo) return;

    setIsUpdatingPromo(true);
    try {
      await updateItem('promocodes', editingPromo.id, {
        maxActivations: Math.max(1, editMaxActivations),
        usedCount: Math.max(0, editUsedCount),
        amount: Math.max(1, editAmount)
      });
      setPromoSuccessStatus(`Параметры промокода «${editingPromo.code}» сохранены: лимит ${editMaxActivations}, использовано ${editUsedCount}`);
      setEditingPromo(null);
      setTimeout(() => setPromoSuccessStatus(null), 4000);
    } catch (err: any) {
      console.error('Error updating promo:', err);
      setPromoError('Ошибка обновления промокода: ' + (err.message || 'Ошибка'));
    } finally {
      setIsUpdatingPromo(false);
    }
  };

  const handleQuickAddActivations = async (promo: any, delta: number) => {
    try {
      const currentMax = promo.maxActivations !== undefined ? parseInt(promo.maxActivations, 10) : 10;
      const newMax = Math.max(1, currentMax + delta);
      await updateItem('promocodes', promo.id, {
        maxActivations: newMax
      });
      setPromoSuccessStatus(`Лимит промокода «${promo.code}» увеличен: ${currentMax} ➔ ${newMax} (+${delta})`);
      setTimeout(() => setPromoSuccessStatus(null), 3500);
    } catch (err: any) {
      console.error('Error adding activations:', err);
    }
  };

  const handleCopy = (text: string, id: string | 'generated') => {
    navigator.clipboard.writeText(text);
    if (id === 'generated') {
      setCopiedGenerated(true);
      setTimeout(() => setCopiedGenerated(false), 2000);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !generatedPassword) {
      return;
    }

    try {
      await addItem('user_passwords', {
        nickname: nickname.trim(),
        password: generatedPassword,
        memo: memo.trim() || 'Пользовательский пароль',
      });
      setNickname('');
      setMemo('');
      handleGenerate();
    } catch (err) {
      console.error("Failed to save password:", err);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filters
  const filteredPasswords = passwordsList.filter(item => {
    const q = searchQuery.toLowerCase();
    const userNick = (item.nickname || '').toLowerCase();
    const userMemo = (item.memo || '').toLowerCase();
    return userNick.includes(q) || userMemo.includes(q);
  });

  const filteredPromos = promosList.filter(item => {
    const q = promoSearchQuery.toLowerCase();
    const pCode = (item.code || '').toLowerCase();
    const pCreator = (item.createdBy || '').toLowerCase();
    return pCode.includes(q) || pCreator.includes(q);
  });

  // Authorization checks: any logged-in administrator has access to manage the system
  const currentLevel = adminUser?.level || 3;
  const canManagePromos = isAdmin;
  const canManageAdmins = isAdmin;

  // Safe Admin Deletion Handler
  const handleDeleteAdmin = async (id: string, nick: string) => {
    setIsDeletingAdmin(true);
    try {
      await deleteItem('admin_accounts', id);
      setAdminActionStatus(`Администратор «${nick}» успешно удален!`);
      setTimeout(() => setAdminActionStatus(null), 4000);
    } catch (e: any) {
      console.error('Failed to delete admin:', e);
      setAdminActionStatus(`Ошибка удаления: ${e?.message || 'Не удалось удалить'}`);
      setTimeout(() => setAdminActionStatus(null), 5000);
    } finally {
      setIsDeletingAdmin(false);
      setAdminToDelete(null);
      setConfirmInlineId(null);
    }
  };

  return (
    <>
      <button 
        id="admin-padlock-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3.5 bg-[#0a1533] border border-[#D4AF37]/40 rounded-full text-[#F5DF8A] hover:text-[#FFF] hover:bg-[#12265c] hover:border-[#D4AF37] transition-all z-50 shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center group"
        title={isAdmin ? "Панель Администратора Grand Estate" : isPlayer ? "Личный Кабинет Grand Estate" : "Вход в систему Grand Estate"}
      >
        {(isAdmin || isPlayer) ? (
          <Unlock className="w-5 h-5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
        ) : (
          <Lock className="w-5 h-5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#02050f]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id="admin-dashboard-container"
            className={`bg-[#070e24] border border-[#D4AF37]/40 rounded-2xl p-6 w-full relative transition-all duration-300 max-h-[90vh] overflow-y-auto shadow-[0_20px_70px_rgba(2,6,23,0.95)] ${
              (isAdmin || isPlayer) ? 'max-w-6xl' : 'max-w-sm'
            }`}
          >
            {/* Close button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#D4AF37] hover:rotate-90 duration-200 text-xl font-bold p-1 z-10"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif text-[#F5DF8A] tracking-wider uppercase font-bold">Панель Управления</h3>
              <p className="text-xs text-[#D4AF37]/80 uppercase tracking-widest mt-1 font-mono">Grand Estate Admin Workspace</p>
            </div>

            {isAdmin ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                
                {/* Side Admin Panel column */}
                <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-zinc-800 pb-6 lg:pb-0 lg:pr-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-[#161616] border border-[#D4AF37]/10 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2 text-[#D4AF37]">
                        <Unlock className="w-4 h-4" />
                        <h4 className="font-bold text-xs tracking-widest uppercase truncate">{adminUser?.nickname || 'Админ'}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-3 bg-black/40 px-2.5 py-1.5 rounded border border-zinc-900">
                        <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase">Уровень {currentLevel}/3</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                        {currentLevel === 1 && "У вас базовый уровень доступа (просмотр, генерация паролей пользователей)."}
                        {currentLevel === 2 && "У вас средний уровень (управление паролями пользователей и создание/удаление промокодов)."}
                        {currentLevel >= 3 && "У вас полный уровень доступа (управление паролями, промокодами и другими администраторами)."}
                      </p>
                      <div className="text-[9px] font-mono text-zinc-500">
                        ROLES: {currentLevel >= 3 ? 'ALL' : currentLevel === 2 ? 'MODERATOR, PROMOS' : 'ASSISTANT'}
                      </div>
                    </div>

                    {/* Navigation tabs inside Dashboard */}
                    <div className="flex flex-col gap-1.5 pt-2">
                      <button
                        onClick={() => setActiveTab('passwords')}
                        className={`w-full py-2.5 px-3 rounded text-left text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2.5 ${
                          activeTab === 'passwords' 
                            ? 'bg-[#D4AF37] text-black font-bold' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                        }`}
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Пароли пользователей</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('promos')}
                        className={`w-full py-2.5 px-3 rounded text-left text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2.5 ${
                          activeTab === 'promos' 
                            ? 'bg-[#D4AF37] text-black font-bold' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                        }`}
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Промокоды {promosList.length > 0 && `(${promosList.length})`}</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('admins')}
                        className={`w-full py-2.5 px-3 rounded text-left text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2.5 ${
                          activeTab === 'admins' 
                            ? 'bg-[#D4AF37] text-black font-bold' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Администраторы ({adminsList.length + 1})</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full mt-6 bg-red-900/10 hover:bg-red-950/30 border border-red-500/40 text-red-400 py-3 rounded-lg hover:text-red-300 transition-colors flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-wider"
                  >
                    <LogOut className="w-4 h-4" /> Выйти из панели
                  </button>
                </div>

                {/* Main Admin Panels col-span-9 */}
                <div className="lg:col-span-9 space-y-6">

                  {/* TAB 1: User Passwords Management */}
                  {activeTab === 'passwords' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-2">
                          <KeyRound className="w-5 h-5" /> Генератор Паролей Пользователей
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Генерируйте уникальные пароли для ваших пользователей и игроков, а также сохраняйте их в защищенную внутрисайтовую базу.
                        </p>
                      </div>

                      {/* Password Generator Form UI */}
                      <div className="bg-[#161616] border border-zinc-800/80 rounded-xl p-5">
                        <form onSubmit={handleSavePassword} className="space-y-4">
                          
                          {/* Nickname & Note Inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-1.5 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Никнейм Пользователя
                              </label>
                              <input 
                                required
                                type="text" 
                                placeholder="Например, ProGamer_777" 
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-zinc-800 text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#D4AF37] transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] uppercase tracking-widest text-zinc-400 font-bold mb-1.5 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Назначение / Заметка
                              </label>
                              <input 
                                type="text" 
                                placeholder="Например, Пароль от кабинета" 
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-zinc-800 text-white p-2.5 text-sm rounded focus:outline-none focus:border-[#D4AF37] transition-colors"
                              />
                            </div>
                          </div>

                          {/* Controls Options block */}
                          <div className="bg-black/50 p-4 rounded-lg border border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Length Slider control */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Длина пароля:</span>
                                <span className="text-sm font-bold text-[#D4AF37] font-mono">{length}</span>
                              </div>
                              <input 
                                type="range" 
                                min="6" 
                                max="30" 
                                value={length}
                                onChange={e => {
                                  setLength(parseInt(e.target.value));
                                  setTimeout(handleGenerate, 10);
                                }}
                                className="w-full accent-[#D4AF37] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            {/* Complexity criteria checkboxes */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={includeUpper} 
                                  onChange={e => { setIncludeUpper(e.target.checked); setTimeout(handleGenerate, 10); }}
                                  className="accent-[#D4AF37] rounded"
                                />
                                <span>[A-Z] Буквы</span>
                              </label>
                              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={includeLower} 
                                  onChange={e => { setIncludeLower(e.target.checked); setTimeout(handleGenerate, 10); }}
                                  className="accent-[#D4AF37] rounded"
                                />
                                <span>[a-z] Буквы</span>
                              </label>
                              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={includeNumbers} 
                                  onChange={e => { setIncludeNumbers(e.target.checked); setTimeout(handleGenerate, 10); }}
                                  className="accent-[#D4AF37] rounded"
                                />
                                <span>[0-9] Цифры</span>
                              </label>
                              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={includeSymbols} 
                                  onChange={e => { setIncludeSymbols(e.target.checked); setTimeout(handleGenerate, 10); }}
                                  className="accent-[#D4AF37] rounded"
                                />
                                <span>[!@#] Символы</span>
                              </label>
                            </div>
                          </div>

                          {/* Display Generated password */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#1e1e1e] p-3 rounded-lg border border-zinc-800">
                            <div className="flex-1 font-mono text-base font-bold text-[#D4AF37] bg-black/40 px-3 py-2 rounded border border-zinc-900 tracking-wider overflow-x-auto whitespace-nowrap min-h-[42px] flex items-center">
                              {generatedPassword || 'Нажмите "Сгенерировать"...'}
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <button 
                                type="button" 
                                onClick={handleGenerate}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2.5 rounded transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                                title="Перегенерировать"
                              >
                                <Shuffle className="w-4 h-4 text-[#D4AF37]" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleCopy(generatedPassword, 'generated')}
                                disabled={!generatedPassword}
                                className={`p-2.5 rounded transition-all text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                                  copiedGenerated 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40'
                                }`}
                              >
                                {copiedGenerated ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copiedGenerated ? 'ОК' : 'Копировать'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Save to protected collection Button */}
                          <button 
                            type="submit" 
                            disabled={!nickname.trim() || !generatedPassword}
                            className="w-full bg-[#D4AF37] hover:bg-[#F5DF8A] disabled:opacity-50 text-black font-bold uppercase tracking-widest py-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]"
                          >
                            <UserPlus className="w-4 h-4 stroke-[2.5]" /> Сохранить в базу паролей
                          </button>

                        </form>
                      </div>

                      {/* Stored user passwords search & list */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-3">
                          <h4 className="font-serif text-base text-[#D4AF37] tracking-wider uppercase flex items-center gap-2">
                            <Key className="w-4.5 h-4.5 text-[#D4AF37]/80" /> Сохраненные пароли пользователей ({filteredPasswords.length})
                          </h4>
                          <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text" 
                              placeholder="Поиск по имени или заметке..." 
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full bg-[#181818] border border-zinc-800 text-xs text-white pl-9 pr-3 py-2 rounded-md focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-zinc-900 bg-black/60 max-h-[300px] overflow-y-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800/80 text-[10px] uppercase tracking-widest text-zinc-500 bg-[#141414]/90">
                                <th className="py-3.5 px-4 font-semibold">Пользователь (Ник)</th>
                                <th className="py-3.5 px-4 font-semibold">Назначение</th>
                                <th className="py-3.5 px-4 font-semibold">Пароль</th>
                                <th className="py-3.5 px-4 font-semibold text-right">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40 text-xs">
                              {filteredPasswords.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="py-8 text-center text-zinc-600 font-mono uppercase text-[10px]">
                                    База пуста или ничего не найдено
                                  </td>
                                </tr>
                              ) : (
                                filteredPasswords.map((item) => {
                                  const isVisible = !!visiblePasswords[item.id];
                                  const isCopied = copiedId === item.id;
                                  
                                  return (
                                    <tr key={item.id} className="hover:bg-[#151515] transition-colors">
                                      <td className="py-3 px-4 font-bold text-zinc-200">
                                        <div className="flex items-center gap-1.5 text-[#D4AF37]">
                                          <User className="w-3.5 h-3.5 stroke-[1.5]" />
                                          <span>{item.nickname}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-zinc-400 italic">
                                        {item.memo || 'Без описания'}
                                      </td>
                                      <td className="py-3 px-4 font-mono select-all">
                                        <span className="bg-black/40 px-2 py-1 rounded border border-zinc-900/60 text-[#D4AF37]/90 tracking-wider">
                                          {isVisible ? item.password : '••••••••••••'}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button 
                                            type="button"
                                            onClick={() => togglePasswordVisibility(item.id)}
                                            className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded transition-colors"
                                            title={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
                                          >
                                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                          </button>
                                          
                                          <button 
                                            type="button"
                                            onClick={() => handleCopy(item.password, item.id)}
                                            className={`p-1.5 rounded transition-all ${
                                              isCopied ? 'text-green-500' : 'text-zinc-500 hover:text-[#D4AF37]'
                                            }`}
                                            title="Скопировать пароль"
                                          >
                                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                          </button>
                                          
                                          <button 
                                            type="button"
                                            onClick={() => deleteItem('user_passwords', item.id)}
                                            className="text-zinc-600 hover:text-red-500 p-1.5 rounded transition-colors"
                                            title="Удалить пароль"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Dynamic Promocodes Manager */}
                  {activeTab === 'promos' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Ticket className="w-5 h-5" /> Управление Промокодами и Активациями
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Создавайте и редактируйте промокоды, задавайте количество доступных активаций, увеличивайте или сбрасывайте лимиты.
                          </p>
                        </div>
                        {!canManagePromos && (
                          <span className="bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] px-2.5 py-1 rounded font-bold uppercase">
                            Лвл 2+ Требуется
                          </span>
                        )}
                      </div>

                      {/* Success / Status Banner */}
                      {promoSuccessStatus && (
                        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-[0_2px_15px_rgba(16,185,129,0.15)] animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{promoSuccessStatus}</span>
                        </div>
                      )}

                      {/* Promo generator UI form - Luxury Glassmorphic Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#181818] via-[#121212] to-[#0c0c0c] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                        {/* Subtle ambient gold glow */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                        
                        {canManagePromos ? (
                          <form onSubmit={handleCreatePromo} className="relative z-10 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white tracking-wide">
                                    Генератор нового промокода
                                  </h4>
                                  <p className="text-[11px] text-zinc-400">
                                    Задайте код, награду и лимит активаций
                                  </p>
                                </div>
                              </div>
                              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[10px] font-mono text-[#D4AF37]">
                                <Shield className="w-3 h-3" /> Доступно админам
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* 1. Code input */}
                              <div className="space-y-1.5">
                                <label className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-300 font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" /> Промокод
                                  </span>
                                  <span className="text-[10px] text-zinc-400 lowercase">текст кода</span>
                                </label>
                                <div className="relative flex rounded-xl shadow-inner bg-[#0a0a0a] border border-zinc-800 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/30 transition-all">
                                  <input 
                                    required
                                    type="text" 
                                    placeholder="НАПРИМЕР: VIPBONUS" 
                                    value={newPromoCode}
                                    onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                                    className="w-full bg-transparent text-white px-3.5 py-2.5 text-sm rounded-l-xl focus:outline-none font-bold uppercase tracking-wider placeholder:text-zinc-600 placeholder:font-normal placeholder:normal-case font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRandomPromo}
                                    className="px-3 bg-zinc-800/80 hover:bg-[#D4AF37] hover:text-black text-zinc-300 rounded-r-xl text-xs font-semibold flex items-center gap-1.5 transition-all border-l border-zinc-800 hover:border-[#D4AF37]"
                                    title="Сгенерировать случайный промокод"
                                  >
                                    <Shuffle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[11px]">Рандом</span>
                                  </button>
                                </div>
                              </div>

                              {/* 2. Coins amount */}
                              <div className="space-y-1.5">
                                <label className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-300 font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <Coins className="w-3.5 h-3.5 text-amber-400" /> Награда
                                  </span>
                                  <span className="text-[10px] text-amber-400/80 font-mono">монеты 🪙</span>
                                </label>
                                <div className="relative rounded-xl shadow-inner bg-[#0a0a0a] border border-zinc-800 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/30 transition-all">
                                  <input 
                                    required
                                    type="number" 
                                    min="1"
                                    max="99999999999"
                                    placeholder="1000" 
                                    value={promoCoins}
                                    onChange={e => setPromoCoins(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="w-full bg-transparent text-[#D4AF37] px-3.5 py-2.5 text-sm rounded-xl focus:outline-none font-bold font-mono pl-3.5 pr-14"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 pointer-events-none">
                                    монет
                                  </span>
                                </div>
                              </div>

                              {/* 3. Activations limit */}
                              <div className="space-y-1.5">
                                <label className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-300 font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Лимит активаций
                                  </span>
                                  <span className="text-[10px] text-[#D4AF37] font-mono">
                                    {promoMaxActivations >= 999999 ? '∞ безлимит' : `${promoMaxActivations} раз`}
                                  </span>
                                </label>
                                <div className="relative rounded-xl shadow-inner bg-[#0a0a0a] border border-zinc-800 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/30 transition-all">
                                  <input 
                                    required
                                    type="number" 
                                    min="1"
                                    max="999999"
                                    placeholder="10" 
                                    value={promoMaxActivations >= 999999 ? 999999 : promoMaxActivations}
                                    onChange={e => setPromoMaxActivations(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="w-full bg-transparent text-[#D4AF37] px-3.5 py-2.5 text-sm rounded-xl focus:outline-none font-bold font-mono pl-3.5 pr-20"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 pointer-events-none">
                                    активаций
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Preset Buttons Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                                <span>Быстрый выбор лимита:</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {[1, 5, 10, 25, 50, 100, 500, 999999].map(preset => {
                                  const isActive = promoMaxActivations === preset;
                                  return (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => setPromoMaxActivations(preset)}
                                      className={`text-[11px] px-2.5 py-1 rounded-lg font-mono font-semibold transition-all border ${
                                        isActive 
                                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
                                          : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                                      }`}
                                    >
                                      {preset === 999999 ? '∞ Безлимит' : `${preset}x`}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {promoError && (
                              <p className="text-red-400 text-xs font-semibold bg-red-950/40 border border-red-500/40 p-2.5 rounded-xl flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                {promoError}
                              </p>
                            )}

                            {/* Submit button with luxury styling */}
                            <button
                              type="submit"
                              className="group w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] hover:from-[#F5DF8A] hover:to-[#F5DF8A] text-black font-extrabold uppercase tracking-widest py-3 text-xs transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.4)] hover:-translate-y-0.5"
                            >
                              <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-black">
                                <Plus className="w-3.5 h-3.5" />
                              </div>
                              <span>Создать промокод с лимитом {promoMaxActivations >= 999999 ? '∞' : promoMaxActivations} активаций</span>
                            </button>
                          </form>
                        ) : (
                          <div className="p-6 border border-zinc-800/80 bg-black/40 rounded-xl text-center text-zinc-400 text-xs py-10">
                            🔒 Извините, создание промокодов доступно только администраторам с уровнем доступа 2 и 3. У Вас: уровень {currentLevel}.
                          </div>
                        )}
                      </div>

                      {/* Promocodes list */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-3">
                          <h4 className="font-serif text-base text-[#D4AF37]/95 tracking-wider uppercase flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-[#D4AF37]/80" /> Активные промокоды в базе ({filteredPromos.length})
                          </h4>
                          <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text" 
                              placeholder="Поиск по коду или создателю..." 
                              value={promoSearchQuery}
                              onChange={e => setPromoSearchQuery(e.target.value)}
                              className="w-full bg-[#181818] border border-zinc-800 text-xs text-white pl-9 pr-3 py-2 rounded-md focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                            />
                          </div>
                        </div>

                        {/* List dynamic promos table */}
                        <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-black/60 max-h-[360px] overflow-y-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800/80 text-[10px] uppercase tracking-widest text-zinc-500 bg-[#141414]/90 sticky top-0 z-10">
                                <th className="py-3.5 px-4 font-semibold">Промокод</th>
                                <th className="py-3.5 px-4 font-semibold">Сумма (Монеты)</th>
                                <th className="py-3.5 px-4 font-semibold">Активации (Использовано / Лимит)</th>
                                <th className="py-3.5 px-4 font-semibold">Выдал (Админ)</th>
                                <th className="py-3.5 px-4 font-semibold text-right">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40 text-xs">
                              {filteredPromos.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-zinc-600 font-mono uppercase text-[10px]">
                                    Нет пользовательских промокодов
                                  </td>
                                </tr>
                              ) : (
                                filteredPromos.map((item) => {
                                  const maxAct = item.maxActivations !== undefined ? parseInt(item.maxActivations, 10) : 10;
                                  const used = parseInt(item.usedCount || '0', 10);
                                  const isExhausted = used >= maxAct;
                                  const pct = maxAct >= 999999 ? Math.min(100, used) : Math.min(100, Math.round((used / maxAct) * 100));
                                  const remaining = Math.max(0, maxAct - used);

                                  return (
                                    <tr key={item.id} className="hover:bg-[#151515] transition-colors">
                                      <td className="py-3 px-4 font-bold font-mono text-[#D4AF37] tracking-wider uppercase">
                                        {item.code}
                                      </td>
                                      <td className="py-3 px-4 font-bold text-zinc-200 font-mono">
                                        +{parseInt(item.amount || '0', 10).toLocaleString()} 🪙
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="space-y-1.5 min-w-[150px]">
                                          <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-mono font-bold text-white">
                                              {used} / {maxAct >= 999999 ? '∞' : maxAct}
                                            </span>
                                            {isExhausted ? (
                                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-950/80 border border-red-500/60 text-red-300 uppercase tracking-wider">
                                                Исчерпан
                                              </span>
                                            ) : (
                                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono">
                                                {maxAct >= 999999 ? 'Безлимит' : `${remaining} ост.`}
                                              </span>
                                            )}
                                          </div>
                                          <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                              className={`h-full transition-all duration-300 ${isExhausted ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-[#D4AF37]'}`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-zinc-400 font-semibold">
                                        <div className="flex items-center gap-1.5">
                                          <User className="w-3.5 h-3.5 text-zinc-500" />
                                          <span>{item.createdBy}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          {/* Edit activations button */}
                                          <button 
                                            type="button"
                                            disabled={!canManagePromos}
                                            onClick={() => handleOpenEditPromo(item)}
                                            className="bg-zinc-800/90 hover:bg-[#D4AF37] text-zinc-300 hover:text-black px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-700/60 hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                            title="Редактировать лимит и количество активаций"
                                          >
                                            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-black" />
                                            <span className="text-[11px] font-bold hidden sm:inline">Изменить</span>
                                          </button>

                                          {/* Quick +10 activations button */}
                                          <button
                                            type="button"
                                            disabled={!canManagePromos}
                                            onClick={() => handleQuickAddActivations(item, 10)}
                                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-[#D4AF37] px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border border-zinc-800 hover:border-zinc-700 disabled:opacity-30"
                                            title="Быстро добавить +10 к лимиту активаций"
                                          >
                                            +10
                                          </button>

                                          {/* Copy button */}
                                          <button 
                                            type="button"
                                            onClick={() => handleCopy(item.code, item.id)}
                                            className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-all"
                                            title="Скопировать промокод"
                                          >
                                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                          </button>
                                          
                                          {/* Delete button */}
                                          <button 
                                            type="button"
                                            disabled={!canManagePromos}
                                            onClick={() => deleteItem('promocodes', item.id)}
                                            className="text-zinc-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-950/20 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                            title={canManagePromos ? 'Удалить промокод' : 'Нужен доступ'}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Modal for Editing Promocode Activations & Limits */}
                      {editingPromo && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
                          <div className="bg-[#141414] border border-[#D4AF37]/50 rounded-2xl max-w-md w-full p-6 shadow-[0_10px_50px_rgba(212,175,55,0.2)] relative">
                            <button 
                              onClick={() => setEditingPromo(null)}
                              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                                <Sliders className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-serif text-lg font-bold text-[#F5DF8A] uppercase tracking-wider">
                                  Настройка промокода
                                </h3>
                                <p className="font-mono text-xs text-[#D4AF37] font-bold">
                                  {editingPromo.code}
                                </p>
                              </div>
                            </div>

                            {/* Quick stats box */}
                            <div className="grid grid-cols-3 gap-2 bg-black/60 border border-zinc-800 p-3 rounded-xl mb-5 text-center">
                              <div>
                                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Использовано</div>
                                <div className="text-sm font-bold text-white font-mono mt-0.5">{editUsedCount}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Лимит</div>
                                <div className="text-sm font-bold text-[#D4AF37] font-mono mt-0.5">
                                  {editMaxActivations >= 999999 ? '∞' : editMaxActivations}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Осталось</div>
                                <div className={`text-sm font-bold font-mono mt-0.5 ${Math.max(0, editMaxActivations - editUsedCount) === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {editMaxActivations >= 999999 ? '∞' : Math.max(0, editMaxActivations - editUsedCount)}
                                </div>
                              </div>
                            </div>

                            <form onSubmit={handleSavePromoEdit} className="space-y-4">
                              {/* Field 1: Max Activations */}
                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                    Лимит активаций (максимум)
                                  </label>
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    Сколько раз можно ввести
                                  </span>
                                </div>
                                <input 
                                  type="number"
                                  min="1"
                                  max="999999"
                                  required
                                  value={editMaxActivations}
                                  onChange={e => setEditMaxActivations(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-full bg-[#1c1c1c] border border-zinc-700 text-[#D4AF37] font-mono font-bold text-base p-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {[1, 5, 10, 50, 100, 500, 999999].map(num => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => setEditMaxActivations(num)}
                                      className={`text-[10px] px-2 py-1 rounded font-mono font-bold transition-all border ${
                                        editMaxActivations === num 
                                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                                      }`}
                                    >
                                      {num === 999999 ? '∞ Безлимит' : num}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setEditMaxActivations(prev => prev + 10)}
                                    className="text-[10px] px-2 py-1 rounded font-mono font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5DF8A] hover:bg-[#D4AF37]/30"
                                    title="Добавить +10 к текущему лимиту"
                                  >
                                    +10
                                  </button>
                                </div>
                              </div>

                              {/* Field 2: Used Count */}
                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                    Текущее число активаций (счетчик)
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setEditUsedCount(0)}
                                    className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Сбросить на 0
                                  </button>
                                </div>
                                <input 
                                  type="number"
                                  min="0"
                                  value={editUsedCount}
                                  onChange={e => setEditUsedCount(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-full bg-[#1c1c1c] border border-zinc-700 text-white font-mono text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                />
                                <p className="text-[10px] text-zinc-500 mt-1">
                                  Вы можете вручную изменить счетчик или нажать «Сбросить на 0», чтобы промокод можно было снова активировать.
                                </p>
                              </div>

                              {/* Field 3: Amount Coins */}
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                                  Награда (Монеты за активацию)
                                </label>
                                <input 
                                  type="number"
                                  min="1"
                                  max="99999999999"
                                  required
                                  value={editAmount}
                                  onChange={e => setEditAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                  className="w-full bg-[#1c1c1c] border border-zinc-700 text-[#D4AF37] font-mono font-bold text-sm p-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                />
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPromo(null)}
                                  className="flex-1 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                  Отмена
                                </button>
                                <button
                                  type="submit"
                                  disabled={isUpdatingPromo}
                                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#D4AF37] hover:bg-[#F5DF8A] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_2px_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {isUpdatingPromo ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Сохранение...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span>Сохранить</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 3: Registered Admins List and Registration Management */}
                  {activeTab === 'admins' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Административный состав
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Список всех игроков, имеющих доступ к админ панелям, с возможностью изменения прав и удаления.
                          </p>
                        </div>
                        <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                          Управление активно
                        </span>
                      </div>

                      {/* Action Status Notification */}
                      {adminActionStatus && (
                        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-lg">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-medium">{adminActionStatus}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setAdminActionStatus(null)}
                            className="text-emerald-400 hover:text-white text-xs ml-2 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Display roster of administrators */}
                      <div className="bg-black/40 border border-zinc-900 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800/80 text-[10px] uppercase tracking-widest text-zinc-500 bg-[#141414]/90">
                              <th className="py-3.5 px-4 font-semibold">Имя Администратора</th>
                              <th className="py-3.5 px-4 font-semibold">Уровень доступа</th>
                              <th className="py-3.5 px-4 font-semibold">Права доступа</th>
                              <th className="py-3.5 px-4 font-semibold text-right">Действия</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/40 text-xs">
                            {/* Owner System Account: Марсель */}
                            <tr className="bg-[#D4AF37]/5 border-b border-[#D4AF37]/20">
                              <td className="py-3.5 px-4 font-bold text-zinc-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                                    <Crown className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#F5DF8A] font-semibold">Марсель</span>
                                    <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded border border-[#D4AF37]/40 font-bold uppercase tracking-wider">
                                      Владелец
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="bg-[#D4AF37] text-black font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                  Уровень 3
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[#D4AF37]/80 italic">
                                Полный доступ ко всему сайту и базе
                              </td>
                              <td className="py-3.5 px-4 text-right text-zinc-500 text-[10px] uppercase font-mono tracking-wider pr-4">
                                ОСНОВАТЕЛЬ
                              </td>
                            </tr>

                            {/* Custom registered admins in Firestore */}
                            {adminsList.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-zinc-500 italic">
                                  Дополнительных администраторов пока нет. Вы можете создать их через форму ниже.
                                </td>
                              </tr>
                            ) : (
                              adminsList.map((item) => {
                                const lvl = parseInt(item.level || '1', 10);
                                const isCurrentDeleting = isDeletingAdmin && adminToDelete?.id === item.id;
                                const isInlineConfirm = confirmInlineId === item.id;

                                return (
                                  <tr key={item.id} className="hover:bg-[#151515] transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-zinc-200">
                                      <div className="flex items-center gap-2 text-zinc-300">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                                          <User className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{item.nickname}</span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <select
                                        value={lvl}
                                        onChange={async (e) => {
                                          const newLvl = parseInt(e.target.value, 10);
                                          try {
                                            await updateItem('admin_accounts', item.id, { level: newLvl });
                                            setAdminActionStatus(`Уровень для «${item.nickname}» обновлен на ${newLvl}!`);
                                            setTimeout(() => setAdminActionStatus(null), 3000);
                                          } catch (error) {
                                            console.error("Failed to update admin level:", error);
                                          }
                                        }}
                                        className="bg-[#1c1c1c] border border-[#D4AF37]/30 text-[#D4AF37] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#D4AF37] font-semibold cursor-pointer"
                                      >
                                        <option value={1}>Уровень 1</option>
                                        <option value={2}>Уровень 2</option>
                                        <option value={3}>Уровень 3</option>
                                      </select>
                                    </td>
                                    <td className="py-3.5 px-4 text-zinc-400 italic">
                                      {lvl === 3 && "Полные права + удаление админов"}
                                      {lvl === 2 && "Выпуск промокодов + пароли"}
                                      {lvl === 1 && "Выгрузка и генерация паролей"}
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      {isInlineConfirm ? (
                                        <div className="flex items-center justify-end gap-1.5 animate-fadeIn">
                                          <button
                                            type="button"
                                            disabled={isDeletingAdmin}
                                            onClick={() => handleDeleteAdmin(item.id, item.nickname)}
                                            className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                                            title="Подтвердить удаление"
                                          >
                                            {isCurrentDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                            <span>Удалить?</span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isDeletingAdmin}
                                            onClick={() => setConfirmInlineId(null)}
                                            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                                            title="Отмена"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-end gap-1">
                                          <button 
                                            type="button"
                                            onClick={() => setAdminToDelete({ id: item.id, nickname: item.nickname })}
                                            className="text-zinc-500 hover:text-red-400 hover:bg-red-950/40 p-1.5 rounded transition-all cursor-pointer flex items-center gap-1 group/del border border-transparent hover:border-red-500/30"
                                            title={`Удалить администратора ${item.nickname}`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" />
                                            <span className="text-[10px] hidden group-hover/del:inline">Удалить</span>
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Modal Confirmation for Deleting Administrator */}
                      {adminToDelete && (
                        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                          <div className="bg-[#070e24] border border-red-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                            <button 
                              type="button"
                              disabled={isDeletingAdmin}
                              onClick={() => setAdminToDelete(null)}
                              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-white uppercase tracking-wider mb-1">
                                  Удалить администратора?
                                </h4>
                                <p className="text-xs text-zinc-300">
                                  Вы уверены, что хотите удалить панель администратора игрока <strong className="text-[#F5DF8A]">«{adminToDelete.nickname}»</strong>?
                                </p>
                                <p className="text-[11px] text-zinc-400 mt-2.5 bg-red-950/30 border border-red-900/40 p-2.5 rounded">
                                  Этот аккаунт будет навсегда удален из базы данных и больше не сможет войти в систему Grand Estate.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-zinc-800">
                              <button
                                type="button"
                                disabled={isDeletingAdmin}
                                onClick={() => setAdminToDelete(null)}
                                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                disabled={isDeletingAdmin}
                                onClick={() => handleDeleteAdmin(adminToDelete.id, adminToDelete.nickname)}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
                              >
                                {isDeletingAdmin ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Удаление...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Да, удалить администратора</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Create New Admin Account Form (Only for Level 3 Admins) */}
                      {canManageAdmins && (
                        <div className="bg-[#161616] border border-zinc-800/80 rounded-xl p-5 mt-6">
                          <h4 className="font-serif text-[#D4AF37] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-[#D4AF37]" /> Создать Административную Панель
                          </h4>
                          <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5 ml-1">
                                  Никнейм игрока (латиница)
                                </label>
                                <input
                                  required
                                  type="text"
                                  placeholder="Например, ProGamer_Mars"
                                  value={regNickname}
                                  onChange={e => { setRegNickname(e.target.value); setRegError(''); setRegSuccess(''); }}
                                  className="w-full bg-[#1e1e1e] border border-zinc-800 focus:border-[#D4AF37] text-white px-3 py-2.5 rounded-lg text-xs focus:outline-none transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5 ml-1">
                                  Пароль панели
                                </label>
                                <input
                                  required
                                  type="password"
                                  placeholder="••••••••"
                                  value={regPassword}
                                  onChange={e => { setRegPassword(e.target.value); setRegError(''); setRegSuccess(''); }}
                                  className="w-full bg-[#1e1e1e] border border-zinc-800 focus:border-[#D4AF37] text-white px-3 py-2.5 rounded-lg text-xs focus:outline-none transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5 ml-1">
                                  Начальный уровень доступа
                                </label>
                                <select
                                  value={regLevel}
                                  onChange={e => setRegLevel(parseInt(e.target.value))}
                                  className="w-full bg-[#1e1e1e] border border-zinc-800 focus:border-[#D4AF37] text-white px-2 py-2.5 rounded-lg text-xs focus:outline-none transition-colors font-bold text-[#D4AF37]"
                                >
                                  <option value={1}>Уровень 1 (Junior) - Просмотр/Пароли</option>
                                  <option value={2}>Уровень 2 (Middle) - Промокоды + Пароли</option>
                                  <option value={3}>Уровень 3 (Senior) - Полный доступ</option>
                                </select>
                              </div>
                            </div>

                            {regError && (
                              <p className="text-red-500 text-xs font-bold bg-red-950/20 border border-red-500/20 px-3 py-2 rounded-lg">{regError}</p>
                            )}
                            
                            {regSuccess && (
                              <p className="text-green-500 text-xs font-bold bg-green-950/20 border border-green-500/20 px-3 py-2 rounded-lg">{regSuccess}</p>
                            )}

                            <button 
                              type="submit"
                              className="w-full bg-[#D4AF37] hover:bg-[#F5DF8A] text-black font-bold uppercase tracking-widest py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                            >
                              <UserPlus className="w-4 h-4 stroke-[2]" />
                              <span>Создать аккаунт администратора</span>
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Info callout for self-creating admins */}
                      <div className="bg-zinc-950/60 border border-[#D4AF37]/10 p-4 rounded-xl text-xs text-zinc-400 mt-4">
                        <div className="flex items-start gap-2.5">
                          <Shield className="w-4.5 h-4.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-zinc-200 block mb-1">УПРАВЛЕНИЕ АДМИНИСТРАТИВНЫМ СОСТАВОМ</span>
                            Регистрация новых панелей и выдача доступов осуществляется исключительно администраторами 3-го уровня (Senior). Игроки больше не могут самостоятельно регистрировать свои аккаунты на внешнем экране. Используйте форму выше для создания новых админов, а также меняйте уровень прав прямо в таблице.
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            ) : isPlayer ? (
              // Player Cabinet rendering
              <div className="w-full">
                <div className="flex items-center justify-between border-b border-[#1b2f60] pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-serif text-[#F5DF8A] tracking-wider uppercase font-bold">Личный Кабинет Синдиката</h3>
                    <p className="text-[10px] text-[#D4AF37]/80 uppercase tracking-widest mt-1 font-mono">Grand Estate Member Portal</p>
                  </div>
                  <button 
                    onClick={() => { logoutPlayer(); }} 
                    className="text-xs text-red-400 hover:text-red-300 font-mono uppercase tracking-widest bg-red-950/20 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Выйти
                  </button>
                </div>
                <PlayerCabinet onClose={() => setIsOpen(false)} />
              </div>
            ) : (
              // Login form
              <div className="max-w-sm mx-auto my-4">
                
                {/* Sub-Title */}
                <div className="text-center mb-6">
                  <p className="text-[10px] text-[#F5DF8A] tracking-[0.25em] uppercase font-bold font-mono">
                    АВТОРИЗАЦИЯ ДОСТУПА
                  </p>
                </div>

                {/* Role selection tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#060e22] border border-[#1b2f60] rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('admin');
                      setLoginError('');
                    }}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      loginRole === 'admin'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] text-[#060e22] shadow font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 font-bold" /> Админ-панель
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('player');
                      setLoginError('');
                    }}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      loginRole === 'player'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5DF8A] text-[#060e22] shadow font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 font-bold" /> Личный кабинет
                  </button>
                </div>



                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5 ml-1 font-mono">
                      {loginRole === 'player' ? 'Никнейм игрока' : 'Никнейм (Пусто для Root)'}
                    </label>
                    <input
                      required={loginRole === 'player'}
                      type="text"
                      placeholder={loginRole === 'player' ? 'Например, Игрок_Mars' : 'Никнейм администратора'}
                      value={loginNickname}
                      onChange={e => { setLoginNickname(e.target.value); setLoginError(''); }}
                      className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5 ml-1 font-mono">
                      {loginRole === 'player' ? 'Пароль доступа' : 'Пароль админ-панели'}
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={loginPwd}
                      onChange={e => { setLoginPwd(e.target.value); setLoginError(''); }}
                      className="w-full bg-[#060e22] border border-[#1b2f60] focus:border-[#D4AF37] text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {loginError && (
                    <p className="text-red-500 text-xs mt-1 text-center font-bold">{loginError}</p>
                  )}

                  {regSuccess && (
                     <p className="text-green-500 text-xs mt-1 text-center font-bold bg-green-950/20 border border-green-500/20 py-2 rounded-lg">{regSuccess}</p>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D4AF37] via-[#ECC867] to-[#D4AF37] hover:from-[#F5DF8A] hover:to-[#D4AF37] text-[#060e22] font-black uppercase tracking-widest py-3 rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Войти в систему</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Inline helper component for PlusCircle
function PlusCircleIcon() {
  return (
    <svg className="w-4 h-4 text-black stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
