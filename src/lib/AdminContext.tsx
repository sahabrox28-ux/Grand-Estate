import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  nickname: string;
  level: number;
}

export interface PlayerUser {
  id: string;
  nickname: string;
  rank: 'Альфа' | 'Бета';
  coins: number;
  usedPromos?: string[];
}

interface AdminContextProps {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  login: (nickname: string, password: string) => Promise<boolean>;
  logout: () => void;
  isPlayer: boolean;
  playerUser: PlayerUser | null;
  loginPlayer: (nickname: string, password: string) => Promise<boolean>;
  logoutPlayer: () => void;
  addItem: (collection: string, data: any) => Promise<void>;
  updateItem: (collection: string, id: string, data: any) => Promise<void>;
  deleteItem: (collection: string, id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState<string | null>(localStorage.getItem('admin_pwd'));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const [playerUser, setPlayerUser] = useState<PlayerUser | null>(() => {
    const saved = localStorage.getItem('player_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isPlayer, setIsPlayer] = useState(false);

  useEffect(() => {
    const plPwd = localStorage.getItem('player_pwd');
    if (plPwd && playerUser) {
      let unsubscribe: (() => void) | null = null;
      import('firebase/firestore').then(({ onSnapshot, doc: fsDoc }) => {
        import('./firebase').then(({ db }) => {
          unsubscribe = onSnapshot(fsDoc(db, 'players_accounts', playerUser.id), (docSnap) => {
            if (docSnap.exists() && docSnap.data()?.password === plPwd) {
              const data = docSnap.data();
              const updatedPlayerObj: PlayerUser = {
                id: docSnap.id,
                nickname: data?.nickname || playerUser.nickname,
                rank: data?.rank || 'Бета',
                coins: typeof data?.coins === 'number' ? data.coins : 0,
                usedPromos: data?.usedPromos || []
              };
              setPlayerUser(updatedPlayerObj);
              setIsPlayer(true);
              localStorage.setItem('player_user', JSON.stringify(updatedPlayerObj));
            } else {
              setIsPlayer(false);
              setPlayerUser(null);
              localStorage.removeItem('player_pwd');
              localStorage.removeItem('player_user');
            }
          }, () => {
            setIsPlayer(false);
            setPlayerUser(null);
          });
        });
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isPlayer]);

  useEffect(() => {
    if (password) {
      if (adminUser) {
        if (adminUser.id === 'root') {
          verify(password).then(ok => {
            if (ok) {
              setIsAdmin(true);
            } else {
              handleReset();
            }
          });
        } else if (adminUser.id === 'marsel_system') {
          const normPwd = (password || '').trim().toLowerCase();
          if (
            normPwd === '123456789' ||
            normPwd === 'knyazy' || 
            normPwd === 'admin123' || 
            normPwd === 'admin' || 
            normPwd === 'grandestate' || 
            password === '123456789' ||
            password === 'Knyazy'
          ) {
            setIsAdmin(true);
          } else {
            handleReset();
          }
        } else {
          // Verify Custom Admin account
          import('firebase/firestore').then(({ getDoc, doc: fsDoc }) => {
            import('./firebase').then(({ db }) => {
              getDoc(fsDoc(db, 'admin_accounts', adminUser.id)).then(docSnap => {
                if (docSnap.exists() && docSnap.data()?.password === password) {
                  const updatedUser = {
                    id: docSnap.id,
                    nickname: docSnap.data()?.nickname || adminUser.nickname,
                    level: parseInt(docSnap.data()?.level || '1', 10)
                  };
                  setAdminUser(updatedUser);
                  setIsAdmin(true);
                  localStorage.setItem('admin_user', JSON.stringify(updatedUser));
                } else {
                  handleReset();
                }
              }).catch(() => handleReset());
            });
          }).catch(() => handleReset());
        }
      } else {
        // Fallback or legacy password validation
        const normPwd = (password || '').trim().toLowerCase();
        if (
          normPwd === '123456789' ||
          normPwd === 'knyazy' || 
          normPwd === 'admin123' || 
          normPwd === 'admin' || 
          normPwd === 'grandestate' || 
          password === '123456789' ||
          password === 'Knyazy'
        ) {
          const marselUser = { id: 'marsel_system', nickname: 'Марсель', level: 3 };
          setAdminUser(marselUser);
          setIsAdmin(true);
          localStorage.setItem('admin_user', JSON.stringify(marselUser));
        } else {
          verify(password).then(ok => {
            if (ok) {
              const rootUser = { id: 'root', nickname: 'Главный Админ (Root)', level: 3 };
              setAdminUser(rootUser);
              setIsAdmin(true);
              localStorage.setItem('admin_user', JSON.stringify(rootUser));
            } else {
              handleReset();
            }
          });
        }
      }
    }
  }, [password]);

  function handleReset() {
    setIsAdmin(false);
    setAdminUser(null);
    setPassword(null);
    localStorage.removeItem('admin_pwd');
    localStorage.removeItem('admin_user');
  }

  async function verify(pwd: string) {
    try {
      const resp = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      return resp.ok;
    } catch { return false; }
  }

  async function login(nickname: string, pwd: string) {
    const trimmedNick = nickname.trim();
    const lNick = trimmedNick.toLowerCase();
    const trimmedPwd = (pwd || '').trim();
    const lPwd = trimmedPwd.toLowerCase();

    const isMasterPass = 
      lPwd === '123456789' ||
      lPwd === 'knyazy' || 
      lPwd === 'admin123' || 
      lPwd === 'admin' || 
      lPwd === 'grandestate' || 
      trimmedPwd === '123456789' ||
      trimmedPwd === 'Knyazy';

    const isOwnerNick = 
      lNick === 'марсель' || 
      lNick === 'марсел' || 
      lNick === 'marsel' || 
      lNick === 'marsel_estate' || 
      lNick === 'mars' || 
      lNick === 'admin' || 
      lNick === 'root' || 
      !trimmedNick;

    // 1. Check for Marsel / Owner / Creator by nickname or master password
    if (isMasterPass && isOwnerNick) {
      const marselUser = { id: 'marsel_system', nickname: 'Марсель', level: 3 };
      setAdminUser(marselUser);
      setPassword(trimmedPwd || '123456789');
      setIsAdmin(true);
      localStorage.setItem('admin_pwd', trimmedPwd || '123456789');
      localStorage.setItem('admin_user', JSON.stringify(marselUser));
      return true;
    }

    // 2. Direct password match for Marsel regardless of nickname entered if password is master password
    if (isMasterPass) {
      const marselUser = { id: 'marsel_system', nickname: trimmedNick || 'Марсель', level: 3 };
      setAdminUser(marselUser);
      setPassword(trimmedPwd || '123456789');
      setIsAdmin(true);
      localStorage.setItem('admin_pwd', trimmedPwd || '123456789');
      localStorage.setItem('admin_user', JSON.stringify(marselUser));
      return true;
    }
    
    // 3. Otherwise checkout from standard inputs
    if (!trimmedNick) {
      const ok = await verify(trimmedPwd);
      if (ok) {
        const rootUser = { id: 'root', nickname: 'Главный Админ (Root)', level: 3 };
        setAdminUser(rootUser);
        setPassword(trimmedPwd);
        setIsAdmin(true);
        localStorage.setItem('admin_pwd', trimmedPwd);
        localStorage.setItem('admin_user', JSON.stringify(rootUser));
        return true;
      }
      return false;
    }

    // 4. Try querying registered admin accounts from Firestore
    try {
      const { getDocs, collection: fsColl, query, where } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      const q = query(
        fsColl(db, 'admin_accounts'), 
        where('nickname', '==', trimmedNick)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        if (data.password === trimmedPwd || (data.password && data.password.toLowerCase() === lPwd)) {
          const user = {
            id: docSnap.id,
            nickname: data.nickname,
            level: parseInt(data.level || '1', 10)
          };
          setAdminUser(user);
          setPassword(data.password);
          setIsAdmin(true);
          localStorage.setItem('admin_pwd', data.password);
          localStorage.setItem('admin_user', JSON.stringify(user));
          return true;
        }
      }
      
      // Fallback: Check if nickname matches "Root" and passes root password
      if (trimmedNick.toLowerCase() === 'root' || trimmedNick.toLowerCase() === 'admin') {
        const ok = await verify(trimmedPwd);
        if (ok) {
          const rootUser = { id: 'root', nickname: 'Главный Админ (Root)', level: 3 };
          setAdminUser(rootUser);
          setPassword(trimmedPwd);
          setIsAdmin(true);
          localStorage.setItem('admin_pwd', trimmedPwd);
          localStorage.setItem('admin_user', JSON.stringify(rootUser));
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function loginPlayer(nickname: string, pwd: string): Promise<boolean> {
    const trimmedNick = nickname.trim();
    if (!trimmedNick || !pwd) return false;

    try {
      const { getDocs, collection: fsColl, query, where } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      const q = query(
        fsColl(db, 'players_accounts'), 
        where('nickname', '==', trimmedNick)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        if (data.password === pwd) {
          const user: PlayerUser = {
            id: docSnap.id,
            nickname: data.nickname,
            rank: data.rank || 'Бета',
            coins: typeof data.coins === 'number' ? data.coins : 0
          };
          setPlayerUser(user);
          setIsPlayer(true);
          localStorage.setItem('player_pwd', pwd);
          localStorage.setItem('player_user', JSON.stringify(user));
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function logoutPlayer() {
    setIsPlayer(false);
    setPlayerUser(null);
    localStorage.removeItem('player_pwd');
    localStorage.removeItem('player_user');
  }

  function logout() {
    handleReset();
  }

  async function addItem(collectionName: string, data: any) {
    try {
      const { addDoc, collection: fsColl } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await addDoc(fsColl(db, collectionName), {
        ...data,
        createdAt: Date.now()
      });
    } catch (e: any) {
      console.error("Error adding item:", e);
      throw e;
    }
  }

  async function updateItem(collectionName: string, id: string, data: any) {
    try {
      const { doc: fsDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await updateDoc(fsDoc(db, collectionName, id), data);
    } catch (e: any) {
      console.error("Error updating item:", e);
      throw e;
    }
  }

  async function deleteItem(collectionName: string, id: string) {
    try {
      const { doc: fsDoc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await deleteDoc(fsDoc(db, collectionName, id));
    } catch (e: any) {
      console.error("Error deleting item:", e);
      throw e;
    }
  }

  return (
    <AdminContext.Provider value={{ isAdmin, adminUser, login, logout, isPlayer, playerUser, loginPlayer, logoutPlayer, addItem, updateItem, deleteItem }}>
      {children}
    </AdminContext.Provider>
  );
}
