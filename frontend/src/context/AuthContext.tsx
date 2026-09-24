import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { Permission, hasPermission } from '../config/permissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  checkPermission: (permission: Permission) => boolean;
  canVerify: (requiredRole: UserRole) => boolean;
  canOverride: () => boolean;
  canFinalApprove: () => boolean;
  switchRole?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('surgical_safety_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session invalid or expired');
          localStorage.removeItem('surgical_safety_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('surgical_safety_token', res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('surgical_safety_token');
    setUser(null);
  };

  const checkPermission = (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canVerify = (requiredRole: UserRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const canOverride = () => {
    if (!user) return false;
    return checkPermission('APPROVE_OVERRIDE');
  };

  const canFinalApprove = () => {
    if (!user) return false;
    return checkPermission('FINAL_APPROVAL');
  };

  const switchRole = (_role: UserRole) => {
    // Role switches are handled strictly via authentication sign-in
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkPermission,
        canVerify,
        canOverride,
        canFinalApprove,
        switchRole,
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
