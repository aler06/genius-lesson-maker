import { GraduationCap, BookOpen, Settings, User, LogOut } from "lucide-react";
import { Button } from "./button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function NavHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-blue-500">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EduAI</h1>
              <p className="text-sm text-muted-foreground">Generador de Ejercicios</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <nav className="flex items-center gap-2">
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Crear Ejercicio
                </Button>
                
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  onClick={() => navigate('/dashboard')}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Dashboard
                </Button>
              </nav>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.firstName} {user.lastName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}