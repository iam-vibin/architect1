import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
