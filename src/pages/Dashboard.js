import { useState, useEffect } from "react";
import { getHabits, getTodayCompleted } from "../utils/api";
import HabitCard from "../components/HabitCard";
import AddHabitModal from "../components/AddHabitModal";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsRes, completedRes] = await Promise.all([
        getHabits(),
        getTodayCompleted(),
      ]);
      setHabits(habitsRes.data);
      setCompletedIds(completedRes.data);
    } catch {
      toast.error("Failed to load habits");
    }
    setLoading(false);
  };

  const handleToggle = (habitId, isNowCompleted) => {
    if (isNowCompleted) {
      setCompletedIds([...completedIds, habitId]);
    } else {
      setCompletedIds(completedIds.filter((id) => id !== habitId));
    }
  };

  const handleDelete = (habitId) => {
    setHabits(habits.filter((h) => h.id !== habitId));
    setCompletedIds(completedIds.filter((id) => id !== habitId));
  };

  const handleAdded = (newHabit) => {
    setHabits([newHabit, ...habits]);
  };

  const completedCount = completedIds.length;
  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#888", fontSize: "18px" }}>Loading your habits... ⏳</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>
            {new Date().getHours() < 12 ? "Good Morning" :
             new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}, {user?.name}! 👋
          </h1>
          <p style={styles.date}>{today}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ width: "auto", padding: "12px 20px" }}
        >
          + Add Habit
        </button>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{totalCount}</p>
          <p style={styles.statLabel}>Total Habits</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: "#4ECDC4" }}>{completedCount}</p>
          <p style={styles.statLabel}>Done Today</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: "#7F77DD" }}>{percentage}%</p>
          <p style={styles.statLabel}>Today's Score</p>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Today's Progress</span>
            <span style={styles.progressPct}>{completedCount}/{totalCount} habits</span>
          </div>
          <div style={styles.progressBg}>
            <div style={{
              ...styles.progressFill,
              width: `${percentage}%`,
              background: percentage === 100
                ? "linear-gradient(90deg, #4ECDC4, #45B7D1)"
                : "linear-gradient(90deg, #7F77DD, #5a52c5)",
            }} />
          </div>
          {percentage === 100 && (
            <p style={styles.perfectDay}>🎉 Perfect day! All habits completed!</p>
          )}
        </div>
      )}

      {/* Habits List */}
      <div style={styles.habitsSection}>
        <h2 style={styles.sectionTitle}>
          {completedCount === totalCount && totalCount > 0
            ? "✅ All Done!"
            : "📋 Your Habits"}
        </h2>

        {habits.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</p>
            <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
              No habits yet!
            </p>
            <p style={{ color: "#888", marginBottom: "24px" }}>
              Add your first habit to start your journey
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowModal(true)}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              + Add First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={completedIds.includes(habit.id)}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showModal && (
        <AddHabitModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}

const styles = {
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  greeting: { fontSize: "26px", fontWeight: "700", marginBottom: "4px" },
  date: { color: "#888", fontSize: "14px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "20px", textAlign: "center" },
  statNum: { fontSize: "32px", fontWeight: "700", marginBottom: "4px" },
  statLabel: { color: "#888", fontSize: "13px" },
  progressSection: { background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "20px", marginBottom: "24px" },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: "12px" },
  progressLabel: { fontWeight: "600" },
  progressPct: { color: "#888", fontSize: "14px" },
  progressBg: { background: "#0f0f1a", borderRadius: "999px", height: "12px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "999px", transition: "width 0.5s ease" },
  perfectDay: { color: "#4ECDC4", fontSize: "14px", marginTop: "10px", textAlign: "center" },
  habitsSection: { marginTop: "8px" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "16px" },
  empty: { textAlign: "center", padding: "60px 20px", background: "#1a1a2e", borderRadius: "16px", border: "1px solid #2a2a4a" },
};