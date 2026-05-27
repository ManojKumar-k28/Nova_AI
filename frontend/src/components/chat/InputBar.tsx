import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Zap, Plus, Loader2, CheckCircle2, AlertCircle, Mic, Trash2, Pause, Play } from "lucide-react";
import { documentAPI } from "../../services/api";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceCommands } from "../../hooks/useVoiceCommands";
import { motion, AnimatePresence } from "framer-motion";

const MODEL_OPTIONS = [
  { value: "llama-3.3-70b", label: "Llama 3.3 70B (Groq)" },
  { value: "gemma2-9b", label: "Gemma 2 9B (Groq)" },
  { value: "mixtral-8x7b", label: "Mixtral 8x7B (Groq)" },
  { value: "llama-3.1-8b", label: "Llama 3.1 8B · Fast (Groq)" }
];

interface InputBarProps {
  onSendMessage: (message: string, model: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSendMessage, disabled = false }: InputBarProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | "uploading"; message: string } | null>(null);

  // Siri voice recorder states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [commandToast, setCommandToast] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  const voiceCancelledRef = useRef<boolean>(false);

  // Hook voice capture
  const {
    triggerLiveSpeechRecognition,
    stopLiveSpeechRecognition
  } = useVoice();

  const { handleVoiceCommand } = useVoiceCommands();

  // Auto-resize input text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim(), selectedModel);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validate file type
    const validExtensions = [".pdf", ".docx", ".txt"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadStatus({
        type: "error",
        message: "Unsupported file. Please upload PDF, DOCX, or TXT."
      });
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus({
      type: "uploading",
      message: `Ingesting "${file.name}"...`
    });

    try {
      await documentAPI.upload(file, (percent) => {
        setUploadProgress(percent);
      });
      
      setUploadStatus({
        type: "success",
        message: `Successfully ingested "${file.name}"!`
      });
      
      // Auto-refresh RAG catalogs across components
      window.dispatchEvent(new CustomEvent("rag-document-uploaded"));
      
      // Automatically record document ingestion in chat history and trigger AI acknowledgment
      onSendMessage(`📎 **Uploaded Document:** Ingested \`${file.name}\` into the chat context memory. Let's analyze it! Please briefly summarize or acknowledge this document's content.`, selectedModel);
      
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || "Failed to split & ingest document.";
      setUploadStatus({
        type: "error",
        message: `Ingestion failed: ${detail}`
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Siri Voice Dictation Functions
  const handleStartVoice = () => {
    if (disabled) return;
    setErrorStatus(null);
    setRecordingTime(0);
    setIsRecordingVoice(true);
    setIsVoicePaused(false);
    voiceCancelledRef.current = false;

    // Start timer ticker
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    triggerLiveSpeechRecognition((text) => {
      // Ignore if user cancelled
      if (voiceCancelledRef.current) return;

      if (text.trim()) {
        const isCommand = handleVoiceCommand(text, setCommandToast);
        if (!isCommand) {
          // Instantly execute prompt directly to find the response!
          onSendMessage(text.trim(), selectedModel);
        }
      }
      
      handleStopVoiceState();
    });
  };

  const handleStopVoiceState = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecordingVoice(false);
    setIsVoicePaused(false);
    setRecordingTime(0);
  };

  const handleFinishVoice = () => {
    stopLiveSpeechRecognition();
    handleStopVoiceState();
  };

  const handleCancelVoice = () => {
    voiceCancelledRef.current = true;
    stopLiveSpeechRecognition();
    handleStopVoiceState();
  };

  const handleTogglePauseVoice = () => {
    if (isVoicePaused) {
      // Resume ticking
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setIsVoicePaused(false);
    } else {
      // Pause ticking
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsVoicePaused(true);
    }
  };

  const setErrorStatus = (err: string | null) => {
    if (err) {
      setUploadStatus({
        type: "error",
        message: err
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maxChars = 2000;
  const charsLeft = maxChars - input.length;
  const isNearLimit = charsLeft < 200;

  return (
    <form onSubmit={handleSubmit} className="w-[90%] max-w-[90%] relative flex flex-col gap-2 p-3 bg-[#1e1e1e] rounded-3xl border border-white/5 shadow-xl shadow-black/25 mx-auto">
      
      {/* Top Utilities bar inside Input: Model Selection & Character Count */}
      {!isRecordingVoice && (
        <div className="flex items-center justify-between pb-1 text-xs">
          <div className="flex items-center gap-1.5 bg-black/30 border border-white/5 rounded-lg px-2.5 py-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border-none text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              {MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value} className="bg-[#0c101d]">
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* Character Gauges */}
          <span className={`font-semibold tracking-wide transition-colors duration-200 ${isNearLimit ? "text-amber-400" : "text-slate-500"}`}>
            {charsLeft} characters remaining
          </span>
        </div>
      )}

      {/* Upload Feedback Banner inside the box */}
      <AnimatePresence>
        {uploadStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border flex items-center justify-between gap-2 shrink-0 ${
              uploadStatus.type === "success"
                ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                : uploadStatus.type === "error"
                ? "bg-red-950/30 border-red-500/20 text-red-400"
                : "bg-blue-950/30 border-blue-500/20 text-blue-400 animate-pulse"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {uploadStatus.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              {uploadStatus.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
              {uploadStatus.type === "uploading" && <Loader2 className="w-4 h-4 shrink-0 animate-spin text-blue-400" />}
              <span className="truncate">{uploadStatus.message}</span>
            </div>
            {uploadStatus.type === "uploading" && (
              <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded font-bold">
                {uploadProgress}%
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Input Area */}
      <div className="flex items-end gap-3 min-h-[40px]">
        {isRecordingVoice ? (
          /* Siri Voice Recorder dictation console (mirrors shared picture layout) */
          <div className="flex-1 flex items-center justify-between gap-4 py-1.5 px-1 bg-black/20 rounded-xl border border-white/5">
            {/* Cancel / Trash Trigger on the Left */}
            <button
              type="button"
              onClick={handleCancelVoice}
              className="p-2 bg-white/5 hover:bg-red-500/15 text-slate-450 hover:text-red-400 rounded-xl border border-white/5 transition-all shrink-0 focus:outline-none cursor-pointer"
              title="Cancel Recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Red Blinking Dot and Timer Duration */}
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-white shrink-0">
              <span className={`w-2 h-2 rounded-full bg-rose-500 shrink-0 ${isVoicePaused ? "" : "animate-pulse"}`} />
              <span className="tracking-wider">{formatTime(recordingTime)}</span>
            </div>

            {/* Siri Voice Bouncing wave motion (organic animated waves) */}
            <div className="flex-1 flex items-center justify-center gap-1.25 h-8 max-w-sm px-4">
              <span className="w-0.75 bg-cyan-400 rounded-full animate-bounce shrink-0" style={{ height: "45%", animationDelay: "0ms" }} />
              <span className="w-0.75 bg-purple-400 rounded-full animate-bounce shrink-0" style={{ height: "65%", animationDelay: "150ms" }} />
              <span className="w-0.75 bg-blue-400 rounded-full animate-bounce shrink-0" style={{ height: "90%", animationDelay: "300ms" }} />
              <span className="w-0.75 bg-cyan-400 rounded-full animate-bounce shrink-0" style={{ height: "70%", animationDelay: "450ms" }} />
              <span className="w-0.75 bg-purple-400 rounded-full animate-bounce shrink-0" style={{ height: "50%", animationDelay: "600ms" }} />
              <span className="w-0.75 bg-blue-400 rounded-full animate-bounce shrink-0" style={{ height: "30%", animationDelay: "750ms" }} />
              <span className="w-0.75 bg-cyan-400 rounded-full animate-bounce shrink-0" style={{ height: "55%", animationDelay: "900ms" }} />
              <span className="w-0.75 bg-purple-400 rounded-full animate-bounce shrink-0" style={{ height: "75%", animationDelay: "150ms" }} />
            </div>

            {/* Pause / Resume dictation toggle */}
            <button
              type="button"
              onClick={handleTogglePauseVoice}
              className="p-2 bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300 rounded-xl border border-white/5 transition-all shrink-0 focus:outline-none cursor-pointer"
              title={isVoicePaused ? "Resume dictation" : "Pause dictation"}
            >
              {isVoicePaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Submit / Finish Arrow green button */}
            <button
              type="button"
              onClick={handleFinishVoice}
              className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 shrink-0 focus:outline-none cursor-pointer"
              title="Finish dictation and send"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Standard prompt typing layouts */
          <>
            {/* Left Utility: Plus button inside prompt box to trigger upload */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || disabled}
                className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none cursor-pointer"
                title="Upload knowledge document (.pdf, .docx, .txt)"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
            </div>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-0 resize-none min-h-[40px] max-h-[180px] py-2.5 px-1 leading-relaxed caret-cyan-400"
            />

            {/* Utilities on the Right side: Attachment, Mic and Send */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Paperclip attachment icon trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-9 h-9 rounded-full text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-all focus:outline-none cursor-pointer"
                title="Attach documents"
              >
                <Paperclip className="w-4.5 h-4.5 rotate-45" />
              </button>

              {/* Dynamic Mic Button */}
              <button
                type="button"
                onClick={handleStartVoice}
                disabled={disabled}
                className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all focus:outline-none cursor-pointer"
                title="Start voice dictation"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              {/* Solid White Circle Send Button with Black ArrowUp */}
              <button
                type="submit"
                disabled={disabled || !input.trim()}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none ${
                  disabled || !input.trim()
                    ? "bg-[#2f2f2f] text-slate-500 cursor-not-allowed"
                    : "bg-white hover:bg-slate-200 text-black shadow-md transform hover:scale-105 cursor-pointer"
                }`}
                title="Send query"
              >
                <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Glassmorphic Visual Voice Command Toast Overlay */}
      {commandToast && (
        <div className="fixed inset-x-0 top-24 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-[#080B14]/85 backdrop-blur-md border border-cyan-500/30 text-cyan-400 font-extrabold tracking-widest text-xs uppercase px-5 py-3 rounded-2xl shadow-xl shadow-cyan-500/5 flex items-center gap-3 animate-bounce">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            Voice Command: <span className="text-white">{commandToast}</span>
          </div>
        </div>
      )}
    </form>
  );
}
