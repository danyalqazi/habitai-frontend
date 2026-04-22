import { useState } from "react";
import { completeHabit, uncompleteHabit, deleteHabit } from "../utils/api";
import toast from "react-hot-toast";

export default function HabitCard({ habit, isCompleted, onToggle, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isCompleted) {
        await uncompleteHabit(habit.id);
        onToggle(habit.id, false);
        toast("Habit unchecked", { icon: "↩️" });
      } else {
        await completeHabit(habit.id);
        onToggle(habit.id, true);
        toast.success("Great job! Keep it up! 🔥");
      }
    } catch (err) {
      toast.error("Already completed today!");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
    try {
      await deleteHabit(habit.id);
      onDelete(habit.id);
      toast.success("Habit deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div style={{
      ...styles.card,
      borderColor: isCompleted ? habit.color : "#2a2a4a",
      opacity: loading ? 0.7 : 1,
    }}>
      {/* Left side */}
      <div style={styles.left}>
        <div style={{ ...styles.iconBox, background: habit.color + "22" }}>
          <span style={{ fontSize: "24px" }}>{habit.icon}</span>
        </div>
        <div>
          <p style={{
            ...styles.habitName,
            textDecoration: isCompleted ? "line-through" : "none",
            color: isCompleted ? "#888" : "white",
          }}>
            {habit.name}
          </p>
          <p style={styles.frequency}>
            {habit.frequency === "daily" ? "📅 Daily" : "📅 Weekly"}
            {habit.reminder_time && ` • ⏰ ${habit.reminder_time}`}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div style={styles.right}>
        <button onClick={handleDelete} style={styles.deleteBtn}>🗑️</button>
        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            ...styles.checkBtn,
            background: isCompleted ? habit.color : "transparent",
            borderColor: habit.color,
          }}
        >
          {isCompleted ? "✓" : "○"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#1a1a2e",
    border: "2px solid #2a2a4a",
    borderRadius: "16px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s",
    marginBottom: "12px",
  },
  left: { display: "flex", alignItems: "center", gap: "14px" },
  iconBox: {
    width: "48px", height: "48px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  habitName: { fontSize: "16px", fontWeight: "600", marginBottom: "4px" },
  frequency: { fontSize: "12px", color: "#888" },
  right: { display: "flex", alignItems: "center", gap: "10px" },
  deleteBtn: {
    background: "transparent", border: "none",
    cursor: "pointer", fontSize: "16px", opacity: 0.5,
    transition: "opacity 0.2s",
  },
  checkBtn: {
    width: "36px", height: "36px", borderRadius: "50%",
    border: "2px solid", fontSize: "16px", fontWeight: "700",
    cursor: "pointer", color: "white", transition: "all 0.2s",
  },
};