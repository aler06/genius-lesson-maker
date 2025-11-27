// Componentes de UI y notificaciones
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// React Query para manejo de estado del servidor
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas de ejercicios
import CreateExercise from "./modules/exercises/pages/CreateExercise";
import ExerciseDetail from "./modules/exercises/pages/ExerciseDetail";
import ExerciseTypeSelector from "./modules/exercises/pages/ExerciseTypeSelector";

// Páginas de autenticación
import Login from "./modules/auth/pages/Login";
import Register from "./modules/auth/pages/Register";

// Páginas de sesiones
import JoinSession from "./modules/sessions/pages/JoinSession";
import SessionRoom from "./modules/sessions/pages/SessionRoom";
import CreateSession from "./modules/sessions/pages/CreateSession";
import SessionResults from "./modules/sessions/pages/SessionResults";
import DynamicSessionView from "./modules/sessions/pages/DynamicSessionView";

// Dashboards
import Dashboard from "./modules/dashboard/pages/Dashboard";
import StudentDashboard from "./modules/students/pages/StudentDashboard";

// Componentes de protección y utilidades
import ProtectedRoute from "./components/ui/protected-route";
import { Role } from "./types/enums";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente principal de la aplicación con rutas y proveedores
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas públicas - acceso sin autenticación */}
          <Route path="/join-session" element={<JoinSession />} />
          <Route path="/session/join/:accessCode" element={<JoinSession />} />
          <Route path="/session/:sessionId" element={<SessionRoom />} />
          <Route path="/" element={<JoinSession />} />
          
          {/* Rutas protegidas para estudiantes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute requiredRole={Role.STUDENT}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Rutas protegidas para profesores */}
          <Route path="/create-exercise" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <CreateExercise />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-session" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <CreateSession />
            </ProtectedRoute>
          } />
          <Route path="/session/:sessionId/results" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <SessionResults />
            </ProtectedRoute>
          } />
          <Route path="/session/dynamic/:sessionId" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <DynamicSessionView />
            </ProtectedRoute>
          } />
          <Route path="/exercise/:exerciseId" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <ExerciseDetail />
            </ProtectedRoute>
          } />
          <Route path="/exercise-type-selector" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <ExerciseTypeSelector />
            </ProtectedRoute>
          } />
          <Route path="/exercise/:sessionId/select-types" element={
            <ProtectedRoute requiredRole={Role.PROFESSOR}>
              <ExerciseTypeSelector />
            </ProtectedRoute>
          } />
          {/* Ruta catch-all para páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
