import { useState } from "react";
import { createHabit } from "../utils/api";
import toast from "react-hot-toast";

const ICONS = ["⭐", "💪", "📚", "🏃", "🧘", "💧", "🙏", "🎯", "🍎", "😴", "✍️", "🎵"];
const COLORS = ["#7F77DD", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

export default function AddHabitModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    icon: "⭐",
    color: "#7F77DD",
    frequency: "daily",
    reminder_time: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }
    setLoading(true);
    try {
      const res = await createHabit(form);
      onAdded(res.data);
      toast.success("Habit created! 🎯");
      onClose();
    } catch (err) {
      toast.error("Failed to create habit");
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Habit</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Habit Name */}
        <div style={styles.field}>
          <label style={styles.label}>Habit Name</label>
          <input
            placeholder="e.g. Morning Workout"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Icon Picker */}
        <div style={styles.field}>
          <label style={styles.label}>Choose Icon</label>
          <div style={styles.iconGrid}>
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setForm({ ...form, icon })}
                style={{
                  ...styles.iconBtn,
                  ...(form.icon === icon ? styles.iconBtnActive : {}),
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div style={styles.field}>
          <label style={styles.label}>Choose Color</label>
          <div style={styles.colorGrid}>
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setForm({ ...form, color })}
                style={{
                  ...styles.colorBtn,
                  background: color,
                  ...(form.color === color ? styles.colorBtnActive : {}),
                }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div style={styles.field}>
          <label style={styles.label}>Frequency</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Reminder */}
        <div style={styles.field}>
          <label style={styles.label}>Reminder Time (optional)</label>
          <input
            type="time"
            value={form.reminder_time}
            onChange={(e) => setForm({ ...form, reminder_time: e.target.value })}
          />
        </div>

        {/* Preview */}
        <div style={styles.preview}>
          <span style={{ fontSize: "24px" }}>{form.icon}</span>
          <span style={{ color: form.color, fontWeight: "700", fontSize: "16px" }}>
            {form.name || "Your Habit Name"}
          </span>
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Habit 🎯"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "16px",
  },
  modal: {
    background: "#1a1a2e", border: "1px solid #2a2a4a",
    borderRadius: "24px", padding: "32px",
    width: "100%", maxWidth: "480px",
    maxHeight: "90vh", overflowY: "auto",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  title: { fontSize: "22px", fontWeight: "700" },
  closeBtn: { background: "transparent", border: "none", color: "#888", fontSize: "20px", cursor: "pointer" },
  field: { marginBottom: "20px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#aaa", marginBottom: "8px" },
  iconGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" },
  iconBtn: {
    background: "#0f0f1a", border: "2px solid transparent",
    borderRadius: "10px", fontSize: "22px", padding: "8px",
    cursor: "pointer", transition: "all 0.2s",
  },
  iconBtnActive: { border: "2px solid #7F77DD", background: "#2a2a4a" },
  colorGrid: { display: "flex", gap: "10px", flexWrap: "wrap" },
  colorBtn: {
    width: "32px", height: "32px", borderRadius: "50%",
    border: "3px solid transparent", cursor: "pointer",
  },
  colorBtnActive: { border: "3px solid white", transform: "scale(1.2)" },
  preview: {
    background: "#0f0f1a", borderRadius: "12px", padding: "16px",
    display: "flex", alignItems: "center", gap: "12px",
    marginBottom: "20px",
  },
};