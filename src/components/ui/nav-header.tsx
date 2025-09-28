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
            onClick={() => navigate('/')}
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
            {user && location.pathname !== '/' && location.pathname !== '/join-session' && (
              <nav className="flex items-center gap-2">
                <Button
                  variant={location.pathname === '/create-exercise' ? 'default' : 'ghost'}
                  onClick={() => navigate('/create-exercise')}
                  className={location.pathname === '/create-exercise' ? 
                    "gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600" : 
                    "gap-2 hover:bg-gradient-to-r hover:from-primary hover:to-blue-500 hover:text-white"
                  }
                >
                  <BookOpen className="h-4 w-4" />
                  Crear Ejercicio
                </Button>
                
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  onClick={() => navigate('/dashboard')}
                  className={location.pathname === '/dashboard' ? 
                    "gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600" : 
                    "gap-2 hover:bg-gradient-to-r hover:from-primary hover:to-blue-500 hover:text-white"
                  }
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
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600"
                >
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