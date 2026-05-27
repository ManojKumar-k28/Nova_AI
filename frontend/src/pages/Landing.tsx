import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Database, Disc, History } from "lucide-react";
import BackgroundScene from "../components/three/BackgroundScene";
import TrialChat from "../components/shared/TrialChat";
import FeatureCard from "../components/shared/FeatureCard";
import Navbar from "../components/layout/Navbar";
import CursorAura from "../components/shared/CursorAura";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 1.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden text-slate-200">
      
      {/* 3D R3F Canvas background layers */}
      <BackgroundScene />
      <CursorAura />

      <AnimatePresence>
        <motion.div
          key="welcome-intro"
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-[#080B14]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.55, duration: 0.7, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center gap-5 px-6 text-center"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-white/5 shadow-[0_0_45px_rgba(34,211,238,0.24)]"
              animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </motion.div>
            <div>
              <motion.p
                className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
              >
                Welcome to
              </motion.p>
              <motion.h1
                className="mt-3 text-4xl font-extrabold tracking-normal text-white sm:text-6xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.55 }}
              >
                Nova AI
              </motion.h1>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Global Navbar */}
      <Navbar />

      {/* Hero section */}
      <section className="relative z-10 min-h-screen px-5 pb-14 pt-28 sm:px-6 lg:pt-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] items-center gap-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl space-y-6 text-center lg:mx-0 lg:text-left"
        >
          {/* Badge indicator */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs text-cyan-400 font-semibold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.1)] uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
             AI Assistant Engine
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white"
          >
            Welcome to Nova AI, your{" "}
            <span className="gradient-text">local intelligence workspace</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          >
            A high-fidelity AI assistant platform operating entirely on your local machine.
            Harness low-latency document retrieval, local Whisper transcribers, Ollama model pipelines, and persistent neural memory.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <Link
              to="/chat"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.03] group"
            >
              Access Workspace Sandbox
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore Capabilities
            </Link>
          </motion.div>
        </motion.div>

        {/* Live Interactive Sandbox widget */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.85, duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full px-0 sm:px-2"
        >
          {/* Decorative glowing background rings */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-purple-500/10 to-cyan-500/5 blur-3xl opacity-60 rounded-3xl" />
          <TrialChat />
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Designed for Absolute Privacy & High-Fidelity Performance
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nova AI binds state of the art open source deep-learning frameworks directly to local CPU/GPU processing layers.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Database}
            title="Local Vector Stores (RAG)"
            description="Upload research books, code logs, or manuals. Content is parsed, divided into overlap chunks, and embedded locally inside persistent multi-user ChromaDB vector indexes."
            accentColor="text-cyan-400"
          />
          <FeatureCard
            icon={Disc}
            title="Whisper & gTTS Audio Synthesizers"
            description="Speak naturally using live audio Speech Recognition or manual Whisper HD WAV recording transcribers. Receive beautiful spoken audio synthesized responses on standard speakers."
            accentColor="text-purple-400"
          />
          <FeatureCard
            icon={History}
            title="Persistent Summary Memory"
            description="Nova recalls details from previous sessions using Supabase server logs aggregated with context summaries. Your assistant knows who you are cross-session."
            accentColor="text-blue-400"
          />
        </div>
      </section>

      {/* Pipeline workflow layout section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5 mb-16">
        <div className="glass rounded-3xl border border-white/5 p-8 sm:p-12 relative overflow-hidden">
          {/* Glow backdrop decorative */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase">System Integration</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">How the Ingestion Engine operates</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                When you drag and drop documentation into your workspace dashboard, a parallel background process triggers inside your Python FastAPI backend application:
              </p>

              {/* Steps list */}
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400 font-bold text-xs shrink-0">1</span>
                  <p className="text-slate-300"><span className="text-white font-semibold">Document Splitting:</span> Text is isolated into overlapping chunks using custom boundary markers to retain semantic parameters.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400 font-bold text-xs shrink-0">2</span>
                  <p className="text-slate-300"><span className="text-white font-semibold">Embedding Extraction:</span> Local nomic-embed models calculate float vectors for each text chunk locally.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400 font-bold text-xs shrink-0">3</span>
                  <p className="text-slate-300"><span className="text-white font-semibold">Vector Ingestion:</span> Indexes are persistent inside ChromaDB, waiting to calculate high cosine similarity retrieval matches for subsequent prompt feeds.</p>
                </li>
              </ul>
            </div>

            {/* Interactive workflow showcase graphics / cards */}
            <div className="flex flex-col gap-4">
              <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-cyan-400 tracking-wider">FastAPI Pipeline</span>
                  <span className="text-[10px] text-green-400 bg-green-500/15 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Online</span>
                </div>
                
                <div className="space-y-3 font-mono text-[11px] text-slate-400">
                  <div>
                    <span className="text-purple-400">POST</span> /api/documents/upload
                    <span className="text-slate-500"> - multipart/form-data</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {"{\n  \"status\": \"ingested\",\n  \"filename\": \"research_quantum.pdf\",\n  \"chunks\": 24,\n  \"vectorstore\": \"ChromaDB\"\n}"}
                  </div>
                </div>
              </div>

              <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-purple-400 tracking-wider">Ollama Model Pipeline</span>
                  <span className="text-[10px] text-green-400 bg-green-500/15 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Port 11434</span>
                </div>
                
                <div className="space-y-3 font-mono text-[11px] text-slate-400">
                  <div>
                    <span className="text-blue-400">qwen2.5</span> Model Active
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full w-[85%]" />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>VRAM In Use: 4.8 GB / 6.0 GB</span>
                    <span>Tokens: ~45 tok/s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 py-10 border-t border-white/5 text-center text-xs text-slate-500">
        <p>© 2026 Nova AI Corp. Built for pairs, research teams, and privacy enthusiasts.</p>
        <p className="mt-1 opacity-75">Designed with Vanilla CSS, HSL gradients, and local LLM vectors.</p>
      </footer>
    </div>
  );
}
