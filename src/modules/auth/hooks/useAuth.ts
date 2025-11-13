import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { UserProfile } from '../model/auth-response.model';

// Hook principal para manejo de autenticación y estado del usuario
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

        // Cargar usuario desde cache primero (UX más rápida)
        const cached = authService.getStoredUser();
        if (cached) {
          setUser(cached);
        }

        // Verificar token y actualizar datos del usuario
        const profile = await authService.getProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        // Cualquier error = usuario no autenticado
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

  // Estados derivados para facilitar validaciones
  const isAuthenticated = !!user;
  const isProfessor = user?.role === 'teacher';
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