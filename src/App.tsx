import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateExercise from "./modules/exercises/pages/CreateExercise";
import Dashboard from "./modules/dashboard/pages/Dashboard";
import ExerciseDetail from "./modules/exercises/pages/ExerciseDetail";
import ExerciseTypeSelector from "./modules/exercises/pages/ExerciseTypeSelector";
import Login from "./modules/auth/pages/Login";
import Register from "./modules/auth/pages/Register";
import JoinSession from "./modules/sessions/pages/JoinSession";
import SessionRoom from "./modules/sessions/pages/SessionRoom";
import CreateSession from "./modules/sessions/pages/CreateSession";
import SessionResults from "./modules/sessions/pages/SessionResults";
import StudentDashboard from "./modules/students/pages/StudentDashboard";
import ProtectedRoute from "./components/ui/protected-route";
import { Role } from "./types/enums";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public routes for students */}
          <Route path="/join-session" element={<JoinSession />} />
          <Route path="/session/join/:accessCode" element={<JoinSession />} />
          <Route path="/session/:sessionId" element={<SessionRoom />} />
          
          {/* Home route - redirect to join session for public access */}
          <Route path="/" element={<JoinSession />} />
          
          {/* Protected routes for students */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute requiredRole={Role.STUDENT}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected routes for teachers */}
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
