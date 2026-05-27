import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { motion } from "framer-motion";
import { Sparkles, Compass, MessageSquare, LogOut, ShieldAlert, LogIn, UserPlus, Home } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { clearMessages } = useChatStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    clearMessages();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      key={location.pathname}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3"
    >
      {/* Brand Identity */}
      <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/10">
          <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center transition-colors group-hover:bg-[#0c101d]">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-bold text-white text-base sm:text-lg tracking-wider group-hover:text-cyan-400 transition-colors">
            NOVA
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold -mt-1">
            AI Platform
          </span>
        </div>
      </Link>

      {/* Navigation Connections */}
      <div className="flex items-center gap-2 sm:gap-6">
        <Link
          to="/"
          aria-current={isActive("/") ? "page" : undefined}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium tracking-wide transition-colors sm:px-0 ${
            isActive("/")
              ? "text-cyan-400"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <Link
          to="/explore"
          aria-current={isActive("/explore") ? "page" : undefined}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium tracking-wide transition-colors sm:px-0 ${
            isActive("/explore")
              ? "text-cyan-400"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Compass className="w-4 h-4" />
          Explore
        </Link>

        {isAuthenticated && (
          <Link
            to="/chat"
            aria-current={isActive("/chat") ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium tracking-wide transition-colors sm:px-0 ${
              isActive("/chat")
                ? "text-cyan-400"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Workspace
          </Link>
        )}
      </div>

      {/* Credentials Dashboard */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white tracking-wide">
                {user?.name}
              </span>
              <span className="text-xs text-slate-400">
                {user?.email}
              </span>
            </div>
            
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : <ShieldAlert className="w-4 h-4" />}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-xl border border-white/5 hover:border-red-500/20 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-2 py-2 text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors sm:px-4"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
            <Link
              to="/register"
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 flex items-center gap-1.5 transition-all duration-300 transform hover:scale-[1.02] sm:px-4"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
