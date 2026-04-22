export function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  const dates = logs
    .map((l) => l.completed_date)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const logDate = new Date(dates[i]);
    logDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((current - logDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      current = logDate;
    } else {
      break;
    }
  }

  return streak;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}