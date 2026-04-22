import { useState, useEffect, useRef } from "react";
import { sendCoachMessage, getCoachHistory } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const QUICK_PROMPTS = [
  "How am I doing this week?",
  "I need motivation to keep going",
  "Which habit should I focus on?",
  "Give me tips to build streaks",
  "I missed my habits today, help!",
];

export default function Coach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
 const [historyLoaded, setHistoryLoaded] = useState(false); // eslint-disable-line
  const bottomRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await getCoachHistory();
      const historyMessages = res.data
        .reverse()
        .map((m) => ({
          role: m.type === "user" ? "user" : "assistant",
          text: m.message,
          time: new Date(m.created_at).toLocaleTimeString(),
        }));

      if (historyMessages.length === 0) {
        setMessages([{
          role: "assistant",
          text: `Hey ${user?.name}! 👋 I'm your AI habit coach. I can see all your habits and progress. Ask me anything — how you're doing, tips to stay consistent, or just say hi!`,
          time: "now",
        }]);
      } else {
        setMessages(historyMessages);
      }
    } catch {
      setMessages([{
        role: "assistant",
        text: `Hey ${user?.name}! 👋 I'm your AI habit coach. Ask me anything about your habits!`,
        time: "now",
      }]);
    }
    setHistoryLoaded(true);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg, time: new Date().toLocaleTimeString() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendCoachMessage(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.message,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      if (err.response?.data?.error?.includes("API key")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "⚠️ Please add your Groq API key in backend/.env file to enable AI coaching!",
            time: "now",
          },
        ]);
      } else {
        toast.error("AI Coach failed to respond");
      }
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>🤖</div>
            <div>
              <p style={styles.coachName}>HabitAI Coach</p>
              <p style={styles.coachStatus}>
                <span style={styles.dot} />
                Always here for you
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "assistant" && (
                <div style={styles.botAvatar}>🤖</div>
              )}
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
                }}
              >
                <p style={styles.bubbleText}>{msg.text}</p>
                <p style={styles.bubbleTime}>{msg.time}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
              <div style={styles.botAvatar}>🤖</div>
              <div style={styles.botBubble}>
                <div style={styles.typing}>
                  <span style={styles.dot2} />
                  <span style={{ ...styles.dot2, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot2, animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts */}
        <div style={styles.quickPrompts}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              style={styles.quickBtn}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your coach anything..."
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={styles.sendBtn}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px",
    minHeight: "calc(100vh - 64px)",
  },
  chatBox: {
    width: "100%",
    maxWidth: "720px",
    background: "#1a1a2e",
    border: "1px solid #2a2a4a",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "calc(100vh - 112px)",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #2a2a4a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "44px", height: "44px",
    background: "#2a2a4a", borderRadius: "50%",
    display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "22px",
  },
  coachName: { fontWeight: "700", fontSize: "16px" },
  coachStatus: {
    display: "flex", alignItems: "center",
    gap: "6px", fontSize: "12px",
    color: "#4ECDC4", marginTop: "2px",
  },
  dot: {
    width: "8px", height: "8px",
    background: "#4ECDC4", borderRadius: "50%",
    display: "inline-block",
  },
  messages: {
    flex: 1, overflowY: "auto",
    padding: "20px", display: "flex",
    flexDirection: "column", gap: "16px",
  },
  messageRow: { display: "flex", alignItems: "flex-end", gap: "10px" },
  botAvatar: { fontSize: "20px", flexShrink: 0 },
  bubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: "16px" },
  userBubble: {
    background: "linear-gradient(135deg, #7F77DD, #5a52c5)",
    borderBottomRightRadius: "4px",
  },
  botBubble: {
    background: "#0f0f1a",
    border: "1px solid #2a2a4a",
    borderBottomLeftRadius: "4px",
  },
  bubbleText: { fontSize: "14px", lineHeight: "1.6", margin: 0 },
  bubbleTime: {
    fontSize: "10px", color: "rgba(255,255,255,0.4)",
    marginTop: "6px", textAlign: "right",
  },
  typing: { display: "flex", gap: "4px", padding: "4px 0" },
  dot2: {
    width: "8px", height: "8px",
    background: "#7F77DD", borderRadius: "50%",
    display: "inline-block",
    animation: "bounce 1s infinite",
  },
  quickPrompts: {
    padding: "12px 20px",
    borderTop: "1px solid #2a2a4a",
    display: "flex", gap: "8px",
    overflowX: "auto", scrollbarWidth: "none",
  },
  quickBtn: {
    background: "#0f0f1a",
    border: "1px solid #2a2a4a",
    color: "#aaa", padding: "6px 12px",
    borderRadius: "20px", fontSize: "12px",
    cursor: "pointer", whiteSpace: "nowrap",
    transition: "all 0.2s", flexShrink: 0,
  },
  inputRow: {
    padding: "16px 20px",
    borderTop: "1px solid #2a2a4a",
    display: "flex", gap: "10px",
  },
  input: {
    flex: 1, background: "#0f0f1a",
    border: "1px solid #2a2a4a",
    borderRadius: "12px", padding: "12px 16px",
    color: "white", fontSize: "14px", outline: "none",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #7F77DD, #5a52c5)",
    border: "none", color: "white",
    width: "44px", height: "44px",
    borderRadius: "12px", fontSize: "18px",
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
};