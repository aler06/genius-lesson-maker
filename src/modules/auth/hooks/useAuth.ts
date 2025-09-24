import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { UserProfile } from '../model/auth-response.model';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Try to read cached user first
        const cached = authService.getStoredUser();
        if (cached) {
          setUser(cached);
        }

        // Always verify token and refresh user data
        const profile = await authService.getProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        // Any error means unauthenticated
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const logout = () => {
    authService.logout();
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