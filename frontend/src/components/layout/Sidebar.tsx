import { useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { Session } from "../../types";
import { Plus, MessageSquare, Trash2, Calendar, Sun, Moon, LogOut, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { sessions, activeSession, fetchSessions, createSession, loadSession, deleteSession, clearMessages } = useChatStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearMessages();
    navigate("/");
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleNewChat = async () => {
    try {
      await createSession("New Conversation", "llama-3.3-70b");
    } catch (err) {
      console.error("Failed to create chat session:", err);
    }
  };

  const groupSessions = (sessionList: Session[]) => {
    const groups: { [key: string]: Session[] } = { Today: [], Yesterday: [], Older: [] };
    const todayStr = new Date().toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    sessionList.forEach((s) => {
      const createdDate = new Date(s.created_at).toDateString();
      if (createdDate === todayStr) {
        groups.Today.push(s);
      } else if (createdDate === yesterdayStr) {
        groups.Yesterday.push(s);
      } else {
        groups.Older.push(s);
      }
    });

    return groups;
  };

  const grouped = groupSessions(sessions);

  return (
    <div className={`w-80 h-full glass-panel border-r border-white/5 flex flex-col pt-6 pb-6 px-4 shrink-0 transition-transform duration-300 z-30
      fixed inset-y-0 left-0 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}>
      {/* Mobile-only close button header */}
      <div className="flex items-center justify-between mb-4 md:hidden border-b border-white/5 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">Nova Navigation</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Button: New Chat */}
      <button
        onClick={handleNewChat}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 text-white rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 font-semibold text-sm tracking-wide shadow-md shadow-black/20 transform hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4 text-cyan-400" />
        New Conversation
      </button>

      {/* History Area */}
      <div className="flex-1 overflow-y-auto mt-6 pr-1 space-y-6">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-xs font-medium">No conversation history</span>
            <span className="text-[10px] opacity-75 mt-0.5">Click New Chat to begin</span>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={label} className="space-y-2">
                {/* Section Header */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
                  <Calendar className="w-3 h-3 text-cyan-500/80" />
                  {label}
                </div>

                {/* Section list */}
                <ul className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {items.map((session) => {
                      const isActive = activeSession?.id === session.id;
                      return (
                        <motion.li
                          key={session.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          className="group relative"
                        >
                          <button
                            onClick={() => loadSession(session.id)}
                            className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-xl text-left text-sm transition-all duration-300 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 border border-blue-500/20 text-white font-medium shadow-md shadow-blue-500/5"
                                : "text-slate-350 hover:bg-white/5 hover:text-white border border-transparent"
                            }`}
                          >
                            <MessageSquare className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-350"}`} />
                            <span className="flex-1 truncate pr-6">
                              {session.title || "Untitled Chat"}
                            </span>
                          </button>

                          {/* Delete Session Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            title="Delete Chat"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/15 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Profile and Settings Section */}
      <div className="mt-auto pt-4 border-t border-white/5 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-3 p-2.5 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : <ShieldAlert className="w-4 h-4" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {user?.name || "Guest User"}
              </span>
              <span className="text-[10px] text-slate-450 truncate">
                {user?.email || "offline"}
              </span>
            </div>
          </div>

          {/* Theme switcher button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-355 hover:text-white rounded-lg border border-white/5 transition-all shrink-0"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl border border-red-500/20 transition-all duration-200 font-semibold text-xs tracking-wider uppercase"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
