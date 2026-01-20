import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "@/pages/LoginPage";
import UserDashboard from "@/pages/UserDashboard";
import ProfessionalProfile from "@/pages/ProfessionalProfile";
import ChatPage from "@/pages/ChatPage";
import ChatsListPage from "@/pages/ChatsListPage";
import ExplorePage from "@/pages/ExplorePage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/AdminDashboard";
import ProfessionalDashboard from "@/pages/ProfessionalDashboard";
import QuoteRequestPage from "@/pages/QuoteRequestPage";
import NotFound from "@/pages/NotFound";

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={
              user?.role === 'admin' ? '/admin' : 
              user?.role === 'professional' ? '/professional-dashboard' : 
              '/dashboard'
            } replace />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* User Routes with Bottom Nav */}
      <Route element={
        <ProtectedRoute allowedRoles={['user']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/chats" element={<ChatsListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* User Routes without Bottom Nav */}
      <Route path="/professional/:id" element={
        <ProtectedRoute allowedRoles={['user']}>
          <ProfessionalProfile />
        </ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      } />
      <Route path="/quote/:id" element={
        <ProtectedRoute allowedRoles={['user']}>
          <QuoteRequestPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Professional Routes */}
      <Route path="/professional-dashboard" element={
        <ProtectedRoute allowedRoles={['professional']}>
          <ProfessionalDashboard />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
