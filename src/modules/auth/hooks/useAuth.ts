import { useState, useEffect } from 'react';
import { UserResponseDTO } from '@/types/dtos';

export const useAuth = () => {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isProfessor = user?.role === 'professor';
  const isStudent = user?.role === 'student';

  return {
    user,
    isLoading,
    isAuthenticated,
    isProfessor,
    isStudent,
    logout,
  };
};