import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Mail, Lock, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import BackgroundScene from "../components/three/BackgroundScene";
import Navbar from "../components/layout/Navbar";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please complete all profile details.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Check spelling.");
      return;
    }

    setError(null);
    try {
      await register(name.trim(), email.trim(), password.trim());
      navigate("/chat");
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "Registration failed. Email might already be taken.";
      setError(detail);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden px-6 pb-10 pt-28 text-slate-200">
      
      {/* 3D background canvas layer */}
      <BackgroundScene />
      <Navbar />

      {/* Decorative center orb backdrop glow */}
      <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Glossy register card panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-md glass rounded-3xl border border-white/10 shadow-2xl p-8 backdrop-blur-2xl"
      >
        {/* Header/Branding */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px] shadow-lg shadow-blue-500/10 mb-4 flex items-center justify-center group">
            <div className="w-full h-full bg-[#080B14] rounded-[15px] flex items-center justify-center transition-colors group-hover:bg-[#0c101d]">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Create an Account</h1>
          <p className="text-slate-400 text-xs mt-1">Join the offline platform and build personal databases</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 px-4 py-3 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-xl flex items-start gap-2.5 leading-snug"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Profile details form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="John Doe"
                className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="you@domain.com"
                className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Privacy & Terms checkbox */}
          <div className="mt-4">
            <label className="flex items-start gap-2.5 px-1 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/10 bg-black/40 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-slate-350 leading-normal">
                I accept the{" "}
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors focus:outline-none"
                >
                  Privacy Policy and Terms of Service
                </button>{" "}
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !acceptedTerms}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                Create Free Account
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Sign In Here
          </Link>
        </div>
      </motion.div>
      {/* Dynamic Privacy & Terms Modal Overlay */}
      <AnimatePresence>
        {showPolicyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg bg-[#0c101d]/95 glass rounded-3xl border border-white/10 p-6 shadow-2xl relative flex flex-col max-h-[80vh] text-slate-200"
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-4 shrink-0 pb-2 border-b border-white/5">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-white tracking-wide">Privacy Policy & Terms</h3>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 text-slate-300 text-xs leading-relaxed space-y-4 scrollbar-thin my-2">
                <div>
                  <h4 className="font-bold text-white mb-1.5 text-[10px] uppercase tracking-widest text-cyan-400">1. Local Security Policy</h4>
                  <p>Your operational database (ChromaDB vectors, cache, and history indices) is processed and saved entirely on your local workspace filesystem, strictly offline to ensure corporate-grade cognitive privacy.</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-white mb-1.5 text-[10px] uppercase tracking-widest text-cyan-400">2. Core Protection Shields</h4>
                  <p>All intellectual designs, structures, backend scripts, and neural configurations inside Nova AI are proprietary. Extracting, decompiling, or leaking the source code of this AI platform is strictly locked by security shields.</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-white mb-1.5 text-[10px] uppercase tracking-widest text-cyan-400">3. Cognitive Terms of Service</h4>
                  <p>This platform is delivered "as is" to act as a secure, fast memory co-pilot. By creating a profile, you agree to these operational bounds and terms of service.</p>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1.5 text-[10px] uppercase tracking-widest text-cyan-400">4. Authentication Systems</h4>
                  <p>When selecting OTP or Google Account authentication options, credentials are parsed and stored locally in encrypted keychains. Session tokens are generated securely via local authentication servers.</p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowPolicyModal(false);
                    setAcceptedTerms(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Close & Accept
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
