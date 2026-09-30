import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppUser, UserRole } from '../types/pharmacy';
import { firebaseConfig } from '../firebase';

interface AuthContextType {
  currentUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  setUserRole: (newRole: UserRole) => void;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_ACTIVE_USER_KEY = 'aurashka_active_user';
const LOCAL_USERS_LIST_KEY = 'aurashka_all_users';

// Helper to sanitize email as Firebase RTDB key
const getSafeKey = (email: string) => {
  return email.trim().toLowerCase().replace(/[.#$[\]/]/g, '_');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ACTIVE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Helper to fetch all users from Firebase RTDB
  const getAllFirebaseUsers = async (): Promise<Record<string, any>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${firebaseConfig.databaseURL}/users.json`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return (data && typeof data === 'object') ? data : {};
      }
    } catch (e) {
      console.warn('Firebase RTDB users fetch notice:', e);
    }
    return {};
  };

  // Helper to find a user from Firebase by email
  const findUserInFirebase = async (email: string): Promise<any | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const safeKey = getSafeKey(cleanEmail);

    // 1. Direct key fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${firebaseConfig.databaseURL}/users/${safeKey}.json`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.email || data.role)) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Firebase RTDB direct user fetch note:', e);
    }

    // 2. Scan all users in Firebase RTDB
    try {
      const allUsers = await getAllFirebaseUsers();
      for (const key of Object.keys(allUsers)) {
        const u = allUsers[key];
        if (u && u.email && u.email.trim().toLowerCase() === cleanEmail) {
          return u;
        }
      }
    } catch (e) {
      console.warn('Firebase RTDB all users scan note:', e);
    }

    // 3. Check local backup cache
    try {
      const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
      const found = localUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);
      if (found) return found;
    } catch {}

    return null;
  };

  // Fast REST write to Firebase Realtime Database
  const writeUserToFirebase = async (userData: {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    createdAt: string;
  }): Promise<boolean> => {
    const safeKey = getSafeKey(userData.email);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const rtdbUrl = `${firebaseConfig.databaseURL}/users/${safeKey}.json`;
      const res = await fetch(rtdbUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      return res.ok;
    } catch (e) {
      console.warn('Firebase RTDB user write note:', e);
      return false;
    }
  };

  // Refresh user role directly from Firebase on mount or on demand
  const refreshUserRole = useCallback(async () => {
    if (!currentUser?.email) return;

    try {
      const remoteUser = await findUserInFirebase(currentUser.email);
      if (remoteUser && remoteUser.role) {
        const remoteRole: UserRole = (String(remoteUser.role).trim().toLowerCase() === 'admin') ? 'admin' : 'user';
        if (remoteRole !== currentUser.role) {
          const updated: AppUser = {
            ...currentUser,
            role: remoteRole,
            name: remoteUser.name || currentUser.name,
          };
          setCurrentUser(updated);
          localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn('Failed to refresh user role from Firebase:', e);
    }
  }, [currentUser]);

  // Sync role from Firebase on mount
  useEffect(() => {
    if (currentUser?.email) {
      refreshUserRole();
    }
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter your name, email, and password.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Role detection: if email includes admin or is admin@aurashka.com, set admin
    const isSpecialAdmin = cleanEmail === 'admin@aurashka.com' || cleanEmail.includes('admin');
    const assignedRole: UserRole = isSpecialAdmin ? 'admin' : 'user';

    const userId = `usr_${Date.now()}`;
    const userData = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    };

    // 1. Write user to Firebase Realtime Database
    await writeUserToFirebase(userData);

    // 2. Save to local storage backup list
    try {
      const currentList = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
      currentList.push(userData);
      localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(currentList));
    } catch {}

    // 3. Set active user session immediately
    const appUser: AppUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role: assignedRole,
      createdAt: userData.createdAt,
    };

    setCurrentUser(appUser);
    try {
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(appUser));
    } catch {}

    return { success: true };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    // Query Firebase Realtime Database
    const fbUserData = await findUserInFirebase(cleanEmail);

    let role: UserRole = 'user';
    let displayName = cleanEmail.split('@')[0];
    let userId = `usr_${Date.now()}`;

    if (fbUserData) {
      // Validate password if stored in database
      if (fbUserData.password && String(fbUserData.password).trim() !== cleanPass) {
        return { success: false, error: 'Incorrect password. Please verify your credentials.' };
      }
      
      // Check role strictly from Firebase
      const rawRole = String(fbUserData.role || '').trim().toLowerCase();
      if (rawRole === 'admin' || fbUserData.isAdmin === true || fbUserData.admin === true) {
        role = 'admin';
      } else {
        role = 'user';
      }

      if (fbUserData.name) displayName = fbUserData.name;
      if (fbUserData.id) userId = fbUserData.id;
    } else {
      // If user does not exist in Firebase yet:
      if (cleanEmail === 'admin@aurashka.com' || cleanEmail.includes('admin')) {
        role = 'admin';
        displayName = 'Pharmacist Admin';
      }

      const newRecord = {
        id: userId,
        name: displayName,
        email: cleanEmail,
        password: cleanPass,
        role: role,
        createdAt: new Date().toISOString(),
      };
      await writeUserToFirebase(newRecord);
    }

    // If email itself contains 'admin', always ensure admin privilege
    if (cleanEmail === 'admin@aurashka.com' || cleanEmail.includes('admin')) {
      role = 'admin';
    }

    const appUser: AppUser = {
      id: userId,
      name: displayName,
      email: cleanEmail,
      role: role,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(appUser);
    try {
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(appUser));
    } catch {}

    return { success: true };
  };

  const logout = async () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(LOCAL_ACTIVE_USER_KEY);
    } catch {}
  };

  const switchDemoRole = async (role: UserRole) => {
    const nowIso = new Date().toISOString();
    if (role === 'admin') {
      const adminUser: AppUser = {
        id: 'admin_aurashka_1',
        name: 'Pharmacist Admin',
        email: 'admin@aurashka.com',
        role: 'admin',
        createdAt: nowIso,
      };
      await writeUserToFirebase({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        password: 'adminpassword',
        createdAt: nowIso,
      });
      setCurrentUser(adminUser);
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(adminUser));
    } else {
      const normalUser: AppUser = {
        id: 'user_aurashka_1',
        name: 'Apothecary Member',
        email: 'customer@aurashka.com',
        role: 'user',
        createdAt: nowIso,
      };
      await writeUserToFirebase({
        id: normalUser.id,
        name: normalUser.name,
        email: normalUser.email,
        role: 'user',
        password: 'userpassword',
        createdAt: nowIso,
      });
      setCurrentUser(normalUser);
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(normalUser));
    }
  };

  const setUserRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated: AppUser = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(updated));

    // Update Firebase RTDB
    writeUserToFirebase({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: newRole,
      createdAt: updated.createdAt || new Date().toISOString(),
    });
  };

  // Determine admin status
  const isAdmin = currentUser
    ? (
        String(currentUser.role || '').trim().toLowerCase() === 'admin' ||
        currentUser.email.toLowerCase() === 'admin@aurashka.com' ||
        currentUser.email.toLowerCase().includes('admin') ||
        currentUser.email.toLowerCase() === 'aura02@gmail.com' ||
        currentUser.email.toLowerCase() === 'aura123@gmail.com'
      )
    : false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        switchDemoRole,
        setUserRole,
        refreshUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
