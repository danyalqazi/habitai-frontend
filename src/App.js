import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Coach from "./pages/Coach";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";

function App() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  // Reset to dashboard whenever user changes (login/logout/switch)
  useEffect(() => {
    setActivePage("dashboard");
    setShowLogin(true);
  }, [user]);

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎯</div>
          <p style={{ color: "#888", fontSize: "18px" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onSwitch={() => setShowLogin(false)} />
    ) : (
      <Signup onSwitch={() => setShowLogin(true)} />
    );
  }

  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin = user?.email === adminEmail;

  // Guard: non-admin trying to access admin page
  const safePage = activePage === "admin" && !isAdmin ? "dashboard" : activePage;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      <Navbar activePage={safePage} setActivePage={setActivePage} />
      {safePage === "dashboard" && <Dashboard key={user.id} />}
      {safePage === "progress" && <Progress key={user.id} />}
      {safePage === "coach" && <Coach key={user.id} />}
      {safePage === "admin" && isAdmin && <Admin key={user.id} />}
    </div>
  );
}

const styles = {
  loader: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#0f0f1a",
  },
};

export default App;