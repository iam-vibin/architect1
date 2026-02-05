import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Mock professionals data (PoC)
  const professionals = [
    { id: 1, name: "Arun Kumar", role: "Architect" },
    { id: 2, name: "Priya Sharma", role: "Interior Designer" },
    { id: 3, name: "Ramesh Builders", role: "Builder" },
    { id: 4, name: "Sneha Designs", role: "Interior Designer" },
  ];

  return (
    <div style={{ padding: 30 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>Welcome back,</h2>
          <h1>User</h1>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            height: 40,
            padding: "0 16px",
            background: "#e53935",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Search */}
      <input
        placeholder="Search professionals, locations..."
        style={{
          marginTop: 20,
          padding: 10,
          width: "100%",
          maxWidth: 400,
        }}
      />

      {/* Filters */}
      <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
        <span>All</span>
        <span>Architect</span>
        <span>Interior Designer</span>
        <span>Builder</span>
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Stats */}
      <div style={{ display: "flex", gap: 100 }}>
        <div>
          <h1>3</h1>
          <p>Verified Professionals</p>
        </div>

        <div>
          <h1>4</h1>
          <p>Available Experts</p>
        </div>
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Professionals List */}
      <h2>All Professionals</h2>
      <p>{professionals.length} found</p>

      <div style={{ marginTop: 20 }}>
        {professionals.map((pro) => (
          <div
            key={pro.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
              padding: 10,
              border: "1px solid #ddd",
              maxWidth: 500,
            }}
          >
            <div>
              <strong>{pro.name}</strong>
              <div>{pro.role}</div>
            </div>

            <button
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "6px 12px",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/chat/${pro.id}`)}
            >
              Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
