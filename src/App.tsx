import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import ChatPage from "./pages/ChatPage";
import ProfessionalChatsPage from "./pages/ProfessionalChatsPage";
import ProfessionalChatPage from "./pages/ProfessionalChatPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import QuoteRequestPage from "./pages/QuoteRequestPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/select-role" replace />} />
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User routes */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quote/:id"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <QuoteRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Professional routes */}
          <Route
            path="/professional-dashboard"
            element={
              <ProtectedRoute allowedRoles={["professional"]}>
                <ProfessionalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professional/chats"
            element={
              <ProtectedRoute allowedRoles={["professional"]}>
                <ProfessionalChatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professional/chat/:id"
            element={
              <ProtectedRoute allowedRoles={["professional"]}>
                <ProfessionalChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professional/profile"
            element={
              <ProtectedRoute allowedRoles={["professional"]}>
                <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
                  <ProfessionalProfilePage />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chats"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProfessionalChatsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/select-role" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
