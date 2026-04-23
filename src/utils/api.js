import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getHabits = () => API.get("/habits");
export const createHabit = (data) => API.post("/habits", data);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const completeHabit = (id) => API.post(`/habits/${id}/complete`);
export const uncompleteHabit = (id) => API.delete(`/habits/${id}/complete`);
export const getTodayCompleted = () => API.get("/habits/today/completed");
export const getHabitLogs = (id) => API.get(`/habits/${id}/logs`);
export const getProgressSummary = () => API.get("/progress/summary");
export const sendCoachMessage = (message) => API.post("/coach/message", { message });
export const getCoachHistory = () => API.get("/coach/history");
export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminHabits = () => API.get("/admin/habits");
export const getAdminMessages = () => API.get("/admin/messages");
export const getAdminSignups = () => API.get("/admin/signups");

export default API;