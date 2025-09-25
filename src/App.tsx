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
          <Route path="/" element={
            <ProtectedRoute>
              <CreateExercise />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/exercise/:sessionId" element={
            <ProtectedRoute>
              <ExerciseDetail />
            </ProtectedRoute>
          } />
          <Route path="/exercise/:sessionId/select-types" element={
            <ProtectedRoute>
              <ExerciseTypeSelector />
            </ProtectedRoute>
          } />
          <Route path="/exercise/:sessionId/edit" element={
            <ProtectedRoute>
              <ExerciseDetail />
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
