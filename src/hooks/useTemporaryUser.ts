import { useState, useEffect } from 'react';
import { USER_CONFIG } from '@/constants/app';

export interface TemporaryUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string; // Consistent email based on user ID
  isTemporary: true;
  role: 'student';
}

export const useTemporaryUser = () => {
  const [tempUser, setTempUser] = useState<TemporaryUser | null>(null);

  useEffect(() => {
    // Load temporary user from localStorage on mount
    const stored = localStorage.getItem(USER_CONFIG.localStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTempUser(parsed);
      } catch (error) {
        console.error('Error parsing temporary user:', error);
        localStorage.removeItem(USER_CONFIG.localStorageKey);
      }
    }
  }, []);

  const createTemporaryUser = (name: string): TemporaryUser => {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Estudiante';
    const lastName = nameParts.slice(1).join(' ') || 'Temporal';
    
    const userId = `${USER_CONFIG.tempUserPrefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTempUser: TemporaryUser = {
      id: userId,
      firstName,
      lastName,
      fullName: name.trim(),
      email: `guest_${userId}@temp.com`, // Generate consistent email based on user ID
      isTemporary: true,
      role: 'student'
    };

    setTempUser(newTempUser);
    localStorage.setItem(USER_CONFIG.localStorageKey, JSON.stringify(newTempUser));
    
    return newTempUser;
  };

  const clearTemporaryUser = () => {
    setTempUser(null);
    localStorage.removeItem(USER_CONFIG.localStorageKey);
  };

  const updateTemporaryUser = (name: string): TemporaryUser | null => {
    if (!tempUser) return null;

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Estudiante';
    const lastName = nameParts.slice(1).join(' ') || 'Temporal';

    const updatedUser: TemporaryUser = {
      ...tempUser,
      firstName,
      lastName,
      fullName: name.trim(),
      // Keep the same email - it's based on the ID which doesn't change
      email: tempUser.email || `guest_${tempUser.id}@temp.com`
    };

    setTempUser(updatedUser);
    localStorage.setItem(USER_CONFIG.localStorageKey, JSON.stringify(updatedUser));
    
    return updatedUser;
  };

  return {
    tempUser,
    createTemporaryUser,
    clearTemporaryUser,
    updateTemporaryUser
  };
};
