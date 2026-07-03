import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResidentDashboard from "./pages/ResidentDashboard.jsx";
import ComplaintDetail from "./pages/ComplaintDetail.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NoticeBoard from "./pages/NoticeBoard.jsx";

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="centered">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function BrandMark() {
  // A simple ticket/stub glyph — stands in for the maintenance-request slip
  // this whole app is digitizing, rather than a generic building emoji.
  return (
    <svg className="brand-mark" width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="2" y="5" width="22" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="13" r="1.6" fill="currentColor" />
      <line x1="5" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5" y1="17" x2="10" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <BrandMark />
          <span>
            Society Maintenance <strong>Tracker</strong>
          </span>
        </div>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            {user.role === "ADMIN" ? "Dashboard" : "My Complaints"}
          </NavLink>
          <NavLink to="/notices" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            Notice Board
          </NavLink>
        </div>

        <div className="navbar-user">
          <div className="user-chip">
            <span className="user-avatar">{initials(user.name)}</span>
            <span className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role === "ADMIN" ? "Administrator" : "Resident"}</span>
            </span>
          </div>
          <button
            className="btn-logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Nav />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route
            path="/"
            element={
              <Protected>
                {user?.role === "ADMIN" ? <AdminDashboard /> : <ResidentDashboard />}
              </Protected>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <Protected>
                <ComplaintDetail />
              </Protected>
            }
          />
          <Route
            path="/notices"
            element={
              <Protected>
                <NoticeBoard />
              </Protected>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
