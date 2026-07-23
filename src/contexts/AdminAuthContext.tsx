import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { apiClient } from '../lib/apiClient';

type Role = 'Super Admin' | 'Admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  lastLogin: string;
  avatarUrl?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const { data: profile, error } = await apiClient.from('users').select('*').eq('id', firebaseUser.uid).single();
      
      if (!error && profile) {
        const adminUser: AdminUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: profile.name || profile.full_name || firebaseUser.email?.split('@')[0] || 'Admin User',
          role: profile.role || 'Admin',
          lastLogin: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          avatarUrl: profile.avatarUrl || profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        };
        setUser(adminUser);
      } else {
        // If profile doesn't exist, create it
        const newUser = {
          email: firebaseUser.email || '',
          role: 'Admin',
        };
        await apiClient.from('users').insert({ id: firebaseUser.uid, ...newUser });
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.email?.split('@')[0] || 'Admin User',
          role: 'Admin',
          lastLogin: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        });
      }
    } catch (error) {
      console.warn('Could not fetch profile, defaulting to Admin role.', error);
      const adminUser: AdminUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.email?.split('@')[0] || 'Admin User',
        role: 'Admin',
        lastLogin: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      };
      setUser(adminUser);
    }
  };

  const checkAuth = async () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          await fetchProfile(user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
        resolve();
      });
      // We don't unsubscribe immediately as we want to keep listening to auth changes
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.clear(); sessionStorage.clear(); window.location.href = '/';
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
