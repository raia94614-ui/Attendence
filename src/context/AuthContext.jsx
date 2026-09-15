import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, saveCurrentUser, getUsers, initializeStorage } from '../utils/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    initializeStorage();
    return getCurrentUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);

  useEffect(() => {
    if (currentUser) {
      saveCurrentUser(currentUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('attendx_current_user');
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Invalid email or password. Please use the demo credentials.' };
  };

  const loginAsRole = (role) => {
    const users = getUsers();
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: `No user found with role ${role}` };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
  };

  const value = {
    currentUser,
    isAuthenticated,
    role: currentUser?.role || 'guest',
    isAdmin: currentUser?.role === 'admin',
    isTeacher: currentUser?.role === 'teacher',
    isStudent: currentUser?.role === 'student',
    login,
    loginAsRole,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
