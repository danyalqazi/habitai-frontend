import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
  CartesianGrid,
} from "recharts";
import { getProgressSummary } from "../utils/api";
import { calculateStreak, getLast30Days } from "../utils/streaks";
import toast from "react-hot-toast";

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("30"); // "7" or "30"

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const res = await getProgressSummary();
      setData(res.data);
    } catch {
      toast.error("Failed to load progress");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#888" }}>Loading your progress... 📊</p>
      </div>
    );
  }

  if (!data || data.totalHabits === 0) {
    return (
      <div style={styles.center}>
        <p style={{ fontSize: "48px" }}>📊</p>
        <p style={{ fontSize: "18px", fontWeight: "600", marginTop: "16px" }}>
          No data yet!
        </p>
        <p style={{ color: "#888", marginTop: "8px" }}>
          Add habits and complete them to see your progress
        </p>
      </div>
    );
  }

  // Build chart data for last 30 days
  const last30 = getLast30Days();
  const last7 = last30.slice(-7);
  const days = view === "7" ? last7 : last30;

  const chartData = days.map((date) => ({
    date: date.slice(5), // MM-DD
    completed: data.dailyMap[date] || 0,
    total: data.totalHabits,
    rate: data.totalHabits > 0
      ? Math.round(((data.dailyMap[date] || 0) / data.totalHabits) * 100)
      : 0,
  }));

  // Calculate streaks per habit
  const habitStreaks = data.habitStats.map((habit) => ({
    ...habit,
    streak: calculateStreak(habit.logDates.map((d) => ({ completed_date: d }))),
  }));

  const totalCompletionsAll = data.habitStats.reduce(
    (sum, h) => sum + h.totalCompleted, 0
  );

  const avgRate = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.rate, 0) / chartData.length)
    : 0;

  const bestStreak = Math.max(...habitStreaks.map((h) => h.streak), 0);

  return (
    <div className="page-container">
      <h1 style={styles.title}>📊 Your Progress</h1>

      {/* Top Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: "#7F77DD" }}>{totalCompletionsAll}</p>
          <p style={styles.statLabel}>Total Completions</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: "#4ECDC4" }}>{avgRate}%</p>
          <p style={styles.statLabel}>Avg Completion Rate</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: "#FF6B6B" }}>{bestStreak} 🔥</p>
          <p style={styles.statLabel}>Best Current Streak</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: "#FFEAA7" }}>{data.totalHabits}</p>
          <p style={styles.statLabel}>Active Habits</p>
        </div>
      </div>

      {/* Chart Toggle */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h2 style={styles.chartTitle}>Daily Completions</h2>
          <div style={styles.toggle}>
            <button
              onClick={() => setView("7")}
              style={{ ...styles.toggleBtn, ...(view === "7" ? styles.toggleActive : {}) }}
            >
              7 Days
            </button>
            <button
              onClick={() => setView("30")}
              style={{ ...styles.toggleBtn, ...(view === "30" ? styles.toggleActive : {}) }}
            >
              30 Days
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
            <XAxis dataKey="date" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "10px" }}
              labelStyle={{ color: "white" }}
            />
            <Bar dataKey="completed" fill="#7F77DD" radius={[6, 6, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate Line Chart */}
      <div style={styles.chartCard}>
        <h2 style={styles.chartTitle}>Completion Rate %</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
            <XAxis dataKey="date" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "10px" }}
              formatter={(v) => [`${v}%`, "Rate"]}
            />
            <Line
              type="monotone" dataKey="rate"
              stroke="#4ECDC4" strokeWidth={3}
              dot={{ fill: "#4ECDC4", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per Habit Stats */}
      <div style={styles.chartCard}>
        <h2 style={styles.chartTitle}>Habit Streaks & Stats</h2>
        <div style={styles.habitList}>
          {habitStreaks.map((habit) => (
            <div key={habit.id} style={styles.habitRow}>
              <div style={styles.habitLeft}>
                <span style={{ fontSize: "24px" }}>{habit.icon}</span>
                <div>
                  <p style={styles.habitName}>{habit.name}</p>
                  <p style={styles.habitSub}>
                    {habit.totalCompleted} total completions
                  </p>
                </div>
              </div>
              <div style={styles.habitRight}>
                <div style={styles.streakBadge}>
                  <span style={{ fontSize: "18px" }}>🔥</span>
                  <span style={styles.streakNum}>{habit.streak}</span>
                  <span style={styles.streakLabel}>day streak</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "8px" },
  title: { fontSize: "26px", fontWeight: "700", marginBottom: "24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "20px", textAlign: "center" },
  statNum: { fontSize: "28px", fontWeight: "700", marginBottom: "4px" },
  statLabel: { color: "#888", fontSize: "12px" },
  chartCard: { background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "24px", marginBottom: "20px" },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  chartTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "20px" },
  toggle: { display: "flex", gap: "8px" },
  toggleBtn: { background: "transparent", border: "1px solid #2a2a4a", color: "#888", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  toggleActive: { background: "#7F77DD", border: "1px solid #7F77DD", color: "white" },
  habitList: { display: "flex", flexDirection: "column", gap: "12px" },
  habitRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f0f1a", borderRadius: "12px", padding: "14px 16px" },
  habitLeft: { display: "flex", alignItems: "center", gap: "12px" },
  habitName: { fontWeight: "600", marginBottom: "2px" },
  habitSub: { fontSize: "12px", color: "#888" },
  habitRight: {},
  streakBadge: { display: "flex", alignItems: "center", gap: "6px", background: "#2a2a4a", padding: "8px 14px", borderRadius: "10px" },
  streakNum: { fontSize: "20px", fontWeight: "700", color: "#FF6B6B" },
  streakLabel: { fontSize: "12px", color: "#888" },
};