import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import LoginPage from "./pages/LoginPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import ExplorePage from "./pages/ExplorePage";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import QuoteRequestPage from "./pages/QuoteRequestPage";
import ProfilePage from "./pages/ProfilePage";
import ChatsListPage from "./pages/ChatsListPage";
import ChatPage from "./pages/ChatPage";
import ProfessionalChatsPage from "./pages/ProfessionalChatsPage";
import ProfessionalChatPage from "./pages/ProfessionalChatPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Authentication & Entry Routes */}
          <Route path="/" element={<Navigate to="/select-role" replace />} />
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Protected Routes */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/user-dashboard" replace />}
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute allowedRoles={["user", "professional", "admin"]}>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professional/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "professional", "admin"]}>
                <ProfessionalProfile />
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
          <Route
            path="/quote-request/:id"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <QuoteRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute allowedRoles={["user", "professional", "admin"]}>
                <ChatsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={<Navigate to="/chats" replace />}
          />
          <Route
            path="/chat/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "professional", "admin"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Professional Protected Routes */}
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
                <ProfessionalProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin-dashboard" replace />}
          />
          <Route
            path="/admin/chats"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProfessionalChatsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
