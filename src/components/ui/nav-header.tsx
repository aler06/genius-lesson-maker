import { GraduationCap, BookOpen, Settings } from "lucide-react";
import { Button } from "./button";
import { useNavigate, useLocation } from "react-router-dom";

export function NavHeader() {
  const navigate = useNavigate();
  const location = useLocation();

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

          <nav className="flex items-center gap-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Crear Sesión
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
        </div>
      </div>
    </header>
  );
}