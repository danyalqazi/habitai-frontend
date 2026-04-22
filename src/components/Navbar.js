import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar({ activePage, setActivePage }) {
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
  };

  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin = user?.email === adminEmail;

  const pages = [
    { id: "dashboard", label: "🏠 Dashboard" },
    { id: "progress", label: "📊 Progress" },
    { id: "coach", label: "🤖 AI Coach" },
    ...(isAdmin ? [{ id: "admin", label: "⚙️ Admin" }] : []),
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo}>🎯</span>
        <span style={styles.brand}>HabitAI</span>
      </div>

      <div style={styles.middle}>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            style={{
              ...styles.navBtn,
              ...(activePage === page.id ? styles.navBtnActive : {}),
            }}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div style={styles.right}>
        <span style={styles.userName}>
          👤 {user?.name}
          {isAdmin && <span style={styles.adminTag}> 👑</span>}
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#1a1a2e", borderBottom: "1px solid #2a2a4a",
    padding: "0 24px", height: "64px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
  },
  left: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { fontSize: "28px" },
  brand: { fontSize: "20px", fontWeight: "700", color: "#7F77DD" },
  middle: { display: "flex", gap: "8px" },
  navBtn: {
    background: "transparent", border: "none",
    color: "#888", padding: "8px 16px",
    borderRadius: "10px", cursor: "pointer",
    fontSize: "14px", fontWeight: "600", transition: "all 0.2s",
  },
  navBtnActive: { background: "#2a2a4a", color: "#7F77DD" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  userName: { color: "#aaa", fontSize: "14px" },
  adminTag: { color: "#FFEAA7" },
  logoutBtn: {
    background: "transparent", border: "1px solid #ff4444",
    color: "#ff4444", padding: "6px 14px",
    borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontWeight: "600",
  },
};