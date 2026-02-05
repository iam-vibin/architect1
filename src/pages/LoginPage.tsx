import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { role } = useAuth();


  const handleLogin = (role: "user" | "professional" | "admin") => {
    login(role);

    if (role === "user") navigate("/user");
    if (role === "professional") navigate("/professional");
    if (role === "admin") navigate("/admin");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>
      <p>Select your role to continue</p>

      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        <button onClick={() => handleLogin("user")}>
          Login as User
        </button>

        <button onClick={() => handleLogin("professional")}>
          Login as Professional
        </button>

        <button onClick={() => handleLogin("admin")}>
          Login as Admin
        </button>
      </div>
    </div>
  );
}
