import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, Smartphone, KeyRound } from "lucide-react";
import BackgroundScene from "../components/three/BackgroundScene";
import Navbar from "../components/layout/Navbar";

export default function Login() {
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP States
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Social Login States
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  // Handle standard password authentication
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    try {
      await login(email.trim(), password.trim());
      navigate("/chat");
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (detail === "Invalid credentials") {
        setError("Invalid account or password! If you don't have an account, please click 'Create a Free Account' below to sign up.");
      } else {
        setError(detail || "Authentication failed. Double check your credentials.");
      }
    }
  };

  // Handle sending OTP code
  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Please enter your email address to request an OTP code.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }
    
    setError(null);
    setOtpLoading(true);
    setOtpSuccessMsg(null);

    try {
      const data = await authAPI.sendOTP(email.trim());
      setOtpSent(true);
      // Auto-notify demo pin code so they don't have to look at terminal log!
      setOtpSuccessMsg(`OTP Sent! Verification Code: ${data.demo_otp || "123456"}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to transmit OTP passcode. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP verification and sign in
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address (e.g., name@domain.com).");
      return;
    }
    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    try {
      const data = await authAPI.loginWithOTP(email.trim(), otp.trim());
      
      // Store credentials in localStorage manually since we bypass basic auth store log in
      localStorage.setItem("nova_token", data.token);
      localStorage.setItem("nova_user", JSON.stringify(data.user));
      
      // Sync zustand store state (force reload / sync)
      useAuthStore.setState({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });

      navigate("/chat");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid or expired verification passcode.");
    }
  };

  // Handle Google Social Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      // Simulate Google Sign-In redirect or payload ingestion
      // We will log in with a mock Google identifier using email or standard credentials
      const mockEmail = email.trim() || "google-user@domain.com";
      const data = await authAPI.loginWithGoogle(mockEmail);
      
      localStorage.setItem("nova_token", data.token);
      localStorage.setItem("nova_user", JSON.stringify(data.user));
      
      useAuthStore.setState({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });

      navigate("/chat");
    } catch (err: any) {
      console.error(err);
      setError("Google account sign-in interrupted.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const isExecuting = isLoading || otpLoading || googleLoading;

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden px-6 pb-10 pt-28 text-slate-200">
      
      {/* 3D background canvas layer */}
      <BackgroundScene />
      <Navbar />

      {/* Decorative center orb backdrop glow */}
      <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Glossy login card panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-md glass rounded-3xl border border-white/10 shadow-2xl p-8 backdrop-blur-2xl"
      >
        {/* Header/Branding */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px] shadow-lg shadow-blue-500/10 mb-4 flex items-center justify-center group">
            <div className="w-full h-full bg-[#080B14] rounded-[15px] flex items-center justify-center transition-colors group-hover:bg-[#0c101d]">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Sign In to Nova</h1>
          <p className="text-slate-400 text-xs mt-1">Unlock RAG document search engines and personal memory profiles</p>
        </div>

        {/* Tab Selector Switch: Password vs OTP */}
        <div className="flex bg-black/45 border border-white/5 p-1 rounded-xl mb-6 relative">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("password");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all z-10 ${
              authMethod === "password" ? "text-cyan-400 bg-white/5 border border-white/5 shadow" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("otp");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all z-10 ${
              authMethod === "otp" ? "text-cyan-400 bg-white/5 border border-white/5 shadow" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            OTP Login
          </button>
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

        {/* OTP Success notification banner */}
        {authMethod === "otp" && otpSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 px-4 py-3 bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300 rounded-xl flex items-start gap-2.5 leading-snug"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5 animate-pulse" />
            <span className="font-semibold">{otpSuccessMsg}</span>
          </motion.div>
        )}

        {/* Credentials Form */}
        <AnimatePresence mode="wait">
          {authMethod === "password" ? (
            /* PASSWORD FORM */
            <motion.form
              key="password-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePasswordSubmit}
              className="space-y-4.5"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isExecuting}
                    placeholder="you@domain.com"
                    className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isExecuting}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isExecuting}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4.5 h-4.5" />
                    Sign In to Platform
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            /* OTP FORM */
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleOTPSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Email Address</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isExecuting}
                      placeholder="you@domain.com"
                      className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isExecuting}
                    className="px-4 bg-white/5 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 font-bold text-xs rounded-xl border border-white/10 hover:border-cyan-500/20 transition-all shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {otpLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : otpSent ? (
                      "Resend OTP"
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </div>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Verification Pin Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isExecuting}
                      placeholder="Enter 6-digit OTP code"
                      className="w-full bg-black/40 border border-white/10 hover:border-white/15 focus:border-blue-500 text-white placeholder-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm tracking-[0.1em] font-mono focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isExecuting || !otpSent}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4.5 h-4.5" />
                    Verify and Sign In
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Separator Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-white/5" />
          <span className="absolute bg-[#080B14]/85 px-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Or continue with
          </span>
        </div>

        {/* Google Authentication Method Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isExecuting}
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-xs tracking-wider uppercase shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.213-5.263 4.213-3.555 0-6.445-2.89-6.445-6.445s2.89-6.445 6.445-6.445c1.616 0 3.09.596 4.225 1.577l3.013-3.012C18.9 2.187 15.75.98 12.24.98 6.096.98 1.11 5.966 1.11 12.11s4.986 11.13 11.13 11.13c6.12 0 11.144-4.887 11.144-11.13 0-.766-.08-1.503-.225-2.215H12.24v.39z"
              />
              <path
                fill="#4285F4"
                d="M23.16 12.215c0-.766-.08-1.503-.225-2.215H12.24V14.4h6.887c-.3 1.12-.99 2.07-1.92 2.685l3.012 3.012c1.782-1.642 2.94-4.058 2.94-7.882z"
              />
              <path
                fill="#FBBC05"
                d="M12.24 23.24c3.51 0 6.66-1.207 8.94-3.238l-3.012-3.012c-.93.615-2.13.99-3.61.99-3.555 0-6.445-2.89-6.445-6.445 0-.585.08-1.155.23-1.696L1.145 6.837c-.67 1.34-1.035 2.85-1.035 4.437 0 6.144 4.986 11.13 11.13 11.13z"
              />
              <path
                fill="#34A853"
                d="M12.24 5.295c1.616 0 3.09.596 4.225 1.577l3.013-3.012C18.9 2.187 15.75.98 12.24.98c-6.144 0-11.13 4.986-11.13 11.13 0 .585.08 1.155.23 1.696l7.195-5.592c.31-1.082 1.002-2.023 1.93-2.616v-.314z"
              />
            </svg>
          )}
          Google Account
        </button>

        {/* Toggle link */}
        <div className="text-center mt-6 text-xs text-slate-400">
          New to Nova?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Create a Free Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
