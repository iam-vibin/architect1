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

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/select-role" replace />} />
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

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
                <React.Suspense fallback={null}>
                  <ProfessionalProfilePage />
                </React.Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
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
            path="/admin/chats"
            element={
              <ProtectedRoute>
                <ProfessionalChatsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
