import { useState, useEffect } from "react";
import {
  getAdminStats, getAdminUsers, deleteAdminUser,
  getAdminHabits, getAdminMessages, getAdminSignups,
} from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";

const TABS = ["overview", "users", "habits", "messages"];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [habits, setHabits] = useState([]);
  const [messages, setMessages] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, habitsRes, messagesRes, signupsRes] =
        await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminHabits(),
          getAdminMessages(),
          getAdminSignups(),
        ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setHabits(habitsRes.data);
      setMessages(messagesRes.data);
      setSignups(signupsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Access denied");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will delete all their data!`)) return;
    try {
      await deleteAdminUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={{ fontSize: "48px" }}>⚙️</p>
        <p style={{ color: "#888", marginTop: "16px" }}>Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ fontSize: "48px" }}>🚫</p>
        <p style={{ fontSize: "20px", fontWeight: "700", marginTop: "16px" }}>
          Access Denied
        </p>
        <p style={{ color: "#888", marginTop: "8px" }}>{error}</p>
        <p style={{ color: "#888", marginTop: "8px" }}>
          Only the admin account can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Admin Panel</h1>
          <p style={styles.subtitle}>Full control over your HabitAI app</p>
        </div>
        <div style={styles.adminBadge}>👑 Admin</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab === "overview" && "📊 Overview"}
            {tab === "users" && `👥 Users (${users.length})`}
            {tab === "habits" && `🎯 Habits (${habits.length})`}
            {tab === "messages" && `🤖 AI Messages (${messages.length})`}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div>
          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={{ ...styles.statNum, color: "#7F77DD" }}>{stats.totalUsers}</p>
              <p style={styles.statLabel}>Total Users</p>
            </div>
            <div style={styles.statCard}>
              <p style={{ ...styles.statNum, color: "#4ECDC4" }}>{stats.totalHabits}</p>
              <p style={styles.statLabel}>Total Habits</p>
            </div>
            <div style={styles.statCard}>
              <p style={{ ...styles.statNum, color: "#FF6B6B" }}>{stats.totalCompletions}</p>
              <p style={styles.statLabel}>Total Completions</p>
            </div>
            <div style={styles.statCard}>
              <p style={{ ...styles.statNum, color: "#FFEAA7" }}>{stats.totalAiMessages}</p>
              <p style={styles.statLabel}>AI Conversations</p>
            </div>
            <div style={styles.statCard}>
              <p style={{ ...styles.statNum, color: "#96CEB4" }}>{stats.todayCompletions}</p>
              <p style={styles.statLabel}>Today's Completions</p>
            </div>
            <div style={styles.statCard}>
              <p style={{ ...styles.statNum, color: "#DDA0DD" }}>{stats.newUsersThisWeek}</p>
              <p style={styles.statLabel}>New Users This Week</p>
            </div>
          </div>

          {/* Signups Chart */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>📈 Daily Signups (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={signups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid #2a2a4a",
                    borderRadius: "10px",
                  }}
                />
                <Bar dataKey="signups" fill="#7F77DD" radius={[6, 6, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Summary */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>🏆 App Health Summary</h2>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryIcon}>👤</span>
                <div>
                  <p style={styles.summaryLabel}>Avg Habits Per User</p>
                  <p style={styles.summaryValue}>
                    {stats.totalUsers > 0
                      ? (stats.totalHabits / stats.totalUsers).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryIcon}>🔥</span>
                <div>
                  <p style={styles.summaryLabel}>Avg Completions Per User</p>
                  <p style={styles.summaryValue}>
                    {stats.totalUsers > 0
                      ? (stats.totalCompletions / stats.totalUsers).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryIcon}>🤖</span>
                <div>
                  <p style={styles.summaryLabel}>Avg AI Chats Per User</p>
                  <p style={styles.summaryValue}>
                    {stats.totalUsers > 0
                      ? (stats.totalAiMessages / stats.totalUsers).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryIcon}>📅</span>
                <div>
                  <p style={styles.summaryLabel}>Today's Activity</p>
                  <p style={styles.summaryValue}>{stats.todayCompletions} completions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div style={styles.tableCard}>
          <h2 style={styles.chartTitle}>👥 All Users</h2>
          {users.length === 0 ? (
            <p style={styles.empty}>No users yet</p>
          ) : (
            <div style={styles.table}>
              {/* Table Header */}
              <div style={styles.tableHeader}>
                <span style={styles.th}>User</span>
                <span style={styles.th}>Habits</span>
                <span style={styles.th}>Completions</span>
                <span style={styles.th}>AI Chats</span>
                <span style={styles.th}>Joined</span>
                <span style={styles.th}>Action</span>
              </div>
              {/* Table Rows */}
              {users.map((user) => (
                <div key={user.id} style={styles.tableRow}>
                  <div style={styles.userCell}>
                    <div style={styles.userAvatar}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.userName}>{user.name}</p>
                      <p style={styles.userEmail}>{user.email}</p>
                    </div>
                  </div>
                  <span style={styles.td}>{user.totalHabits}</span>
                  <span style={styles.td}>{user.totalCompletions}</span>
                  <span style={styles.td}>{user.totalAiMessages}</span>
                  <span style={styles.td}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    style={styles.deleteBtn}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HABITS TAB */}
      {activeTab === "habits" && (
        <div style={styles.tableCard}>
          <h2 style={styles.chartTitle}>🎯 All Habits</h2>
          {habits.length === 0 ? (
            <p style={styles.empty}>No habits yet</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.th}>Habit</span>
                <span style={styles.th}>User</span>
                <span style={styles.th}>Frequency</span>
                <span style={styles.th}>Completions</span>
                <span style={styles.th}>Created</span>
              </div>
              {habits.map((habit) => (
                <div key={habit.id} style={styles.tableRow}>
                  <div style={styles.habitCell}>
                    <span style={{ fontSize: "20px" }}>{habit.icon}</span>
                    <span style={{ ...styles.habitName, color: habit.color }}>
                      {habit.name}
                    </span>
                  </div>
                  <div>
                    <p style={styles.userName}>{habit.userName}</p>
                    <p style={styles.userEmail}>{habit.userEmail}</p>
                  </div>
                  <span style={styles.td}>{habit.frequency}</span>
                  <span style={{ ...styles.td, color: "#4ECDC4", fontWeight: "700" }}>
                    {habit.totalCompletions}
                  </span>
                  <span style={styles.td}>
                    {new Date(habit.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MESSAGES TAB */}
     {/* MESSAGES TAB */}
{activeTab === "messages" && (
  <div style={styles.tableCard}>
    <h2 style={styles.chartTitle}>🤖 All User Conversations</h2>
    {messages.length === 0 ? (
      <p style={styles.empty}>No AI conversations yet</p>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {messages.map((convo) => (
          <div key={convo.userId} style={styles.convoCard}>
            {/* User Header */}
            <div style={styles.convoHeader}>
              <div style={styles.userAvatar}>
                {convo.userName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.userName}>{convo.userName}</p>
                <p style={styles.userEmail}>{convo.userEmail}</p>
              </div>
              <div style={styles.msgCount}>
                {convo.messages.length} messages
              </div>
            </div>

            {/* Chat Messages */}
            <div style={styles.chatHistory}>
              {convo.messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.chatBubbleRow,
                    justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{
                    ...styles.chatBubble,
                    ...(msg.type === "user" ? styles.chatUser : styles.chatBot),
                  }}>
                    <p style={styles.chatText}>{msg.message}</p>
                    <p style={styles.chatTime}>
                      {msg.type === "user" ? "👤 User" : "🤖 AI"} •{" "}
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
}

const styles = {
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: "70vh", gap: "8px",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "24px",
  },
  title: { fontSize: "26px", fontWeight: "700", marginBottom: "4px" },
  subtitle: { color: "#888", fontSize: "14px" },
  adminBadge: {
    background: "linear-gradient(135deg, #FFEAA7, #fdcb6e)",
    color: "#333", padding: "8px 16px",
    borderRadius: "20px", fontWeight: "700", fontSize: "14px",
  },
  tabs: {
    display: "flex", gap: "8px",
    marginBottom: "24px", flexWrap: "wrap",
  },
  tab: {
    background: "transparent", border: "1px solid #2a2a4a",
    color: "#888", padding: "10px 18px",
    borderRadius: "10px", cursor: "pointer",
    fontSize: "14px", fontWeight: "600",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#2a2a4a", color: "#7F77DD",
    borderColor: "#7F77DD",
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px", marginBottom: "24px",
  },
  statCard: {
    background: "#1a1a2e", border: "1px solid #2a2a4a",
    borderRadius: "16px", padding: "20px", textAlign: "center",
  },
  statNum: { fontSize: "32px", fontWeight: "700", marginBottom: "4px" },
  statLabel: { color: "#888", fontSize: "13px" },
  chartCard: {
    background: "#1a1a2e", border: "1px solid #2a2a4a",
    borderRadius: "16px", padding: "24px", marginBottom: "20px",
  },
  chartTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "20px" },
  summaryGrid: {
    display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px",
  },
  summaryItem: {
    display: "flex", alignItems: "center", gap: "14px",
    background: "#0f0f1a", borderRadius: "12px", padding: "16px",
  },
  summaryIcon: { fontSize: "28px" },
  summaryLabel: { color: "#888", fontSize: "12px", marginBottom: "4px" },
  summaryValue: { fontSize: "18px", fontWeight: "700" },
  tableCard: {
    background: "#1a1a2e", border: "1px solid #2a2a4a",
    borderRadius: "16px", padding: "24px",
  },
  table: { display: "flex", flexDirection: "column", gap: "2px" },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    padding: "12px 16px", color: "#888",
    fontSize: "12px", fontWeight: "600",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
    padding: "14px 16px", background: "#0f0f1a",
    borderRadius: "10px", alignItems: "center",
    marginBottom: "4px",
  },
  th: {},
  td: { fontSize: "14px", color: "#ccc" },
  userCell: { display: "flex", alignItems: "center", gap: "10px" },
  userAvatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #7F77DD, #5a52c5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "14px", flexShrink: 0,
  },
  userName: { fontSize: "14px", fontWeight: "600", marginBottom: "2px" },
  userEmail: { fontSize: "12px", color: "#888" },
  deleteBtn: {
    background: "transparent", border: "1px solid #ff4444",
    color: "#ff4444", padding: "6px 12px",
    borderRadius: "8px", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  habitCell: { display: "flex", alignItems: "center", gap: "10px" },
  habitName: { fontSize: "14px", fontWeight: "600" },
  empty: { color: "#888", textAlign: "center", padding: "40px" },
  messageCard: {
    background: "#0f0f1a", borderRadius: "12px", padding: "16px",
  },
  messageHeader: {
    display: "flex", alignItems: "center",
    gap: "10px", marginBottom: "12px",
  },
  aiBadge: {
    marginLeft: "auto", background: "#2a2a4a",
    padding: "4px 10px", borderRadius: "20px",
    fontSize: "12px", color: "#7F77DD",
  },
  messageText: { fontSize: "14px", color: "#ccc", lineHeight: "1.6" },

  convoCard: {
    background: "#0f0f1a", borderRadius: "16px",
    padding: "20px", border: "1px solid #2a2a4a",
  },
  convoHeader: {
    display: "flex", alignItems: "center",
    gap: "12px", marginBottom: "16px",
    paddingBottom: "12px", borderBottom: "1px solid #2a2a4a",
  },
  msgCount: {
    marginLeft: "auto", background: "#2a2a4a",
    padding: "4px 12px", borderRadius: "20px",
    fontSize: "12px", color: "#7F77DD",
  },
  chatHistory: {
    display: "flex", flexDirection: "column", gap: "10px",
    maxHeight: "300px", overflowY: "auto",
  },
  chatBubbleRow: { display: "flex" },
  chatBubble: {
    maxWidth: "70%", padding: "10px 14px",
    borderRadius: "12px",
  },
  chatUser: {
    background: "linear-gradient(135deg, #7F77DD, #5a52c5)",
    borderBottomRightRadius: "4px",
  },
  chatBot: {
    background: "#1a1a2e", border: "1px solid #2a2a4a",
    borderBottomLeftRadius: "4px",
  },
  chatText: { fontSize: "13px", lineHeight: "1.5", margin: 0 },
  chatTime: {
    fontSize: "10px", color: "rgba(255,255,255,0.4)",
    marginTop: "4px",
  },
};