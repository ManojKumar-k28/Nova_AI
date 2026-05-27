import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, Code, Database, Volume2, ArrowRight, CornerDownRight, CheckCircle } from "lucide-react";
import BackgroundScene from "../components/three/BackgroundScene";
import Navbar from "../components/layout/Navbar";

interface ExploreCase {
  id: string;
  tabLabel: string;
  icon: React.ReactNode;
  prompt: string;
  systemSummary: string;
  responseMarkdown: React.ReactNode;
  attribution: string[];
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState("rag");

  const cases: ExploreCase[] = [
    {
      id: "rag",
      tabLabel: "RAG Knowledge Indexing",
      icon: <Database className="w-4.5 h-4.5" />,
      prompt: "Extract the exact energy transition parameters described in Section 4 of the uploaded Energy Outlook PDF.",
      systemSummary: "Calculated 87% Cosine Similarity match against vector chunks index in research_energy_outlook.pdf.",
      attribution: ["research_energy_outlook.pdf (Chunk 18)", "research_energy_outlook.pdf (Chunk 21)"],
      responseMarkdown: (
        <div className="space-y-3">
          <p>Based on Section 4 of the **Energy Outlook 2026** document, the primary energy transition metrics are specified as:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-350">
            <li>**Renewable Expansion:** Targeting a minimum compound annual growth rate (CAGR) of **14.2%** through 2032.</li>
            <li>**Carbon Abatement:** A mandated **42% reduction** in direct Scope 1 operational greenhouse gas vectors by 2030, using 2020 as the base year.</li>
            <li>**Grid Resiliency Budget:** Allocation of **$18.5 Billion** for decentralizing local storage clusters.</li>
          </ul>
        </div>
      )
    },
    {
      id: "coding",
      tabLabel: "Advanced Code Generation",
      icon: <Code className="w-4.5 h-4.5" />,
      prompt: "Write a high-performance Rust function that reads an array of coordinate floats, calculates distances, and outputs a sorted list.",
      systemSummary: "Compiled locally using Qwen 2.5 model. Zero syntax errors detected. High throughput performance profile.",
      attribution: ["Standard Library Reference", "Ollama code-llama cache"],
      responseMarkdown: (
        <div className="space-y-3">
          <p>Here is a complete, high-fidelity Rust implementation utilizing `f64` floats and vector sorting:</p>
          <pre className="bg-black/40 border border-white/5 p-4 rounded-xl font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
{`#[derive(Debug, Clone, Copy)]
pub struct Coordinate {
    pub x: f64,
    pub y: f64,
}

pub fn calculate_and_sort_distances(origin: Coordinate, points: &[Coordinate]) -> Vec<(Coordinate, f64)> {
    let mut distances: Vec<(Coordinate, f64)> = points
        .iter()
        .map(|&p| {
            let dx = p.x - origin.x;
            let dy = p.y - origin.y;
            let distance = (dx * dx + dy * dy).sqrt();
            (p, distance)
        })
        .collect();

    // Sort floats safely avoiding NaN panic triggers
    distances.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    distances
}`}
          </pre>
        </div>
      )
    },
    {
      id: "voice",
      tabLabel: "Whisper & TTS Synthesizer",
      icon: <Volume2 className="w-4.5 h-4.5" />,
      prompt: "[AUDIO STREAM TRANSCRIBED] - 'Summarize the primary objectives of the engineering team for this quarter.'",
      systemSummary: "Whisper model successfully parsed local WAV audio file. Transcribed Speech-to-Text in 820ms. gTTS voice packet active.",
      attribution: ["Whisper base model (local STT)", "gTTS MP3 Synthesizer"],
      responseMarkdown: (
        <div className="space-y-3">
          <p className="italic text-slate-400">"Voice synth synthesizer speaks back:"</p>
          <div className="flex items-center gap-3 p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl">
            <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
            <p className="text-slate-200">"The primary objectives for Q3 focus on: 1) Mitigating websocket connection drop rates by 15%, 2) Migrating local collections indexes into persistent Chroma DB volumes, and 3) Automating Whisper container pipelines."</p>
          </div>
        </div>
      )
    }
  ];

  const activeCase = cases.find((c) => c.id === activeTab) || cases[0];

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden text-slate-200">
      
      {/* 3D background canvas layer */}
      <BackgroundScene />

      {/* Global Navbar */}
      <Navbar />

      {/* Page Header */}
      <section className="relative z-10 pt-36 pb-12 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 font-semibold uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Showcase
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-wide">
          Explore Advanced Capabilities
        </h1>
        <p className="text-slate-450 text-sm max-w-xl mt-3 leading-relaxed">
          Nova AI platform integrates deep models to run state-of-the-art text generation, voice transcribing, and neural context retrievals completely offline.
        </p>
      </section>

      {/* Main interactive tabs panel */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="glass rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row">
          
          {/* Tabs Column on Left */}
          <div className="w-full md:w-72 bg-white/2 border-r border-white/5 p-4 flex flex-col gap-2">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest px-2 mb-2">
              Capabilities Selector
            </span>

            {cases.map((c) => {
              const isActive = activeTab === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveTab(c.id)}
                  className={`w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 border border-blue-500/25 text-white shadow-md shadow-blue-500/5"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-cyan-400" : "text-slate-500"}>
                    {c.icon}
                  </span>
                  {c.tabLabel}
                </button>
              );
            })}

            <div className="mt-auto pt-6 border-t border-white/5 text-center hidden md:block">
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/10 transition-transform hover:scale-[1.02]"
              >
                Sign Up Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive display Panel on Right */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCase.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Query Header bubble mockup */}
                <div className="space-y-2">
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3" /> User Prompt Feed
                  </span>
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tr-none border border-white/5 text-slate-100 text-sm font-semibold max-w-[90%] self-end">
                    {activeCase.prompt}
                  </div>
                </div>

                {/* Pipeline processing details status */}
                <div className="flex items-start gap-2.5 p-3.5 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl text-[11px] text-cyan-300 leading-snug">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-cyan-200">Local pipeline status: </span>
                    {activeCase.systemSummary}
                  </div>
                </div>

                {/* Response bubble mockup */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#080B14] border border-cyan-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest">Nova response</span>
                  </div>

                  <div className="glass rounded-2xl rounded-tl-none p-5 text-sm border-white/5 text-slate-200 shadow-md">
                    {activeCase.responseMarkdown}
                  </div>
                </div>

                {/* Attributions drawer */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                    Indexed Attributions (ChromaDB vectors)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCase.attribution.map((attr, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-semibold bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-slate-400"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/5 text-center text-xs text-slate-500">
        <p>© 2026 Nova AI Corp. Explore deep local intelligence safely.</p>
      </footer>
    </div>
  );
}
