import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import InputBar from "../components/chat/InputBar";
import BackgroundScene from "../components/three/BackgroundScene";
import { useChat } from "../hooks/useChat";
import { Menu, Bot } from "lucide-react";

export default function Chat() {
  const { sessions, activeSession, createSession, sendMessage, fetchSessions, loadSession } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hasLoadedInitialSession = useRef(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (hasLoadedInitialSession.current || activeSession || sessions.length === 0) {
      return;
    }

    hasLoadedInitialSession.current = true;
    loadSession(sessions[0].id);
  }, [activeSession, loadSession, sessions]);

  const handleSendMessage = async (text: string, model: string) => {
    if (!activeSession) {
      try {
        // Automatically spin up a session on first query
        await createSession(text.slice(0, 30) || "New Conversation", model);
        // Wait briefly for state synchronization, then send
        setTimeout(() => {
          sendMessage(text, model);
        }, 100);
      } catch (err) {
        console.error("Failed to spin up optimistic session:", err);
      }
    } else {
      sendMessage(text, model);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-slate-200 flex">
      {/* 3D background canvas layer */}
      <BackgroundScene />

      {/* Main Workspace Frame */}
      <div className="flex-1 h-full flex overflow-hidden">
        
        {/* Left Side: Session logs history */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Mobile Sidebar Dim Backdrop overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Center: Conversation area & Input layout */}
        <div className="flex-1 h-full flex flex-col justify-between overflow-hidden relative">
          
          {/* Top Bar for Mobile Toggle & Title */}
          <div className="w-full h-14 shrink-0 px-6 border-b border-white/5 flex items-center justify-between bg-black/10 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white rounded-xl border border-white/5 transition-all md:hidden focus:outline-none shrink-0"
                title="Open chat list"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="w-4.5 h-4.5 text-cyan-400 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[140px] sm:max-w-xs font-mono">
                  Nova AI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md tracking-wider font-mono">
                {activeSession?.model || "Groq Cloud"}
              </span>
            </div>
          </div>

          {/* Chat Area — always visible (shows centerpiece when no messages, conversation when messages exist) */}
          <ChatArea />

          {/* Input bar — ALWAYS at the bottom of the screen, width 90% */}
          <div className="pb-4 px-2 shrink-0">
            <InputBar onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
