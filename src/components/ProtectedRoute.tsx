import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: Array<'user' | 'professional' | 'admin'>;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // redirect to user's dashboard
    if (user.role === 'user') return <Navigate to="/user-dashboard" replace />;
    if (user.role === 'professional') return <Navigate to="/professional-dashboard" replace />;
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}
