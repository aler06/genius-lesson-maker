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
  const { user, logout, isProfessor } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (isProfessor) {
      navigate('/create-exercise');
    } else {
      navigate('/');
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className={`border-b ${isAuthPage ? 'bg-white border-gray-200' : 'bg-card'} shadow-soft`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isAuthPage ? 'text-gray-900' : 'text-foreground'}`}>EduAI</h1>
              <p className={`text-sm ${isAuthPage ? 'text-gray-600' : 'text-muted-foreground'}`}>Generador de Ejercicios</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && location.pathname !== '/' && location.pathname !== '/join-session' && (
              <nav className="flex items-center gap-2">
                <Button
                  variant={location.pathname === '/create-exercise' ? 'default' : 'ghost'}
                  onClick={() => navigate('/create-exercise')}
                  className={location.pathname === '/create-exercise' ? 
                    "gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" : 
                    "gap-2 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white"
                  }
                >
                  <BookOpen className="h-4 w-4" />
                  Crear Ejercicio
                </Button>
                
                <Button
                  variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                  onClick={() => navigate('/dashboard')}
                  className={location.pathname === '/dashboard' ? 
                    "gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" : 
                    "gap-2 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white"
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
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className={isAuthPage ? 
                    "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400" :
                    "border-primary/30 text-primary hover:bg-primary/0 hover:border-primary/50"
                  }
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
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