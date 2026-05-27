import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-4">
      {/* Bot Icon Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-[1px] shadow-md shadow-blue-500/5 shrink-0 flex items-center justify-center">
        <div className="w-full h-full bg-[#080B14] rounded-[11px] flex items-center justify-center">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* Typing Bubble */}
      <div className="glass text-slate-200 rounded-2xl rounded-tl-none border border-white/5 px-5 py-4 flex items-center gap-1.5 min-w-[70px]">
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          className="w-2.5 h-2.5 bg-blue-400 rounded-full inline-block"
        />
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
          className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block"
        />
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          className="w-2.5 h-2.5 bg-purple-400 rounded-full inline-block"
        />
      </div>
    </div>
  );
}
