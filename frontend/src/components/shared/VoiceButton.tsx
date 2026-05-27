import { useState } from "react";
import { Mic, Volume2, Loader2 } from "lucide-react";
import { useVoice } from "../../hooks/useVoice";
import { useVoiceCommands } from "../../hooks/useVoiceCommands";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onTalkingChange?: (isTalking: boolean) => void;
}

export default function VoiceButton({ onTranscript, onTalkingChange }: VoiceButtonProps) {
  const {
    isRecording,
    isListening,
    isPlaying,
    startAudioRecording,
    stopAudioRecording,
    transcribeFile,
    triggerLiveSpeechRecognition,
    stopLiveSpeechRecognition
  } = useVoice();

  const { handleVoiceCommand } = useVoiceCommands();
  const [commandToast, setCommandToast] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState<"live" | "whisper">("live");

  const processTranscript = (text: string) => {
    const isCommand = handleVoiceCommand(text, setCommandToast);
    if (!isCommand) {
      onTranscript(text);
    }
  };

  // We will support Live Web Speech Recognition as the primary voice mode,
  // falling back to manual recording if necessary.
  const handleToggleListening = () => {
    if (isListening) {
      stopLiveSpeechRecognition();
      if (onTalkingChange) onTalkingChange(false);
    } else {
      if (onTalkingChange) onTalkingChange(true);
      triggerLiveSpeechRecognition((text) => {
        if (text.trim()) {
          processTranscript(text);
        }
      });
    }
  };

  // Alternative Whisper HD capture
  const handleToggleWhisper = async () => {
    if (isRecording) {
      setIsProcessing(true);
      const audioBlob = await stopAudioRecording();
      if (audioBlob) {
        const text = await transcribeFile(audioBlob);
        if (text.trim()) {
          processTranscript(text);
        }
      }
      setIsProcessing(false);
    } else {
      await startAudioRecording();
    }
  };

  const handleMicClick = () => {
    if (voiceMode === "live") {
      handleToggleListening();
    } else {
      handleToggleWhisper();
    }
  };

  const isAnyActive = isListening || isRecording;

  return (
    <div className="flex items-center bg-black/25 hover:bg-black/35 border border-white/10 rounded-xl p-1 transition-all gap-1">
      {/* Dynamic Consolidated Voice Button */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={isProcessing}
        title={
          voiceMode === "live"
            ? isListening
              ? "Stop listening"
              : "Start live voice-to-text streaming"
            : isRecording
            ? "Stop recording and transcribe with Whisper"
            : "Record audio for Whisper HD transcription"
        }
        className={`relative flex items-center justify-center h-8.5 rounded-lg transition-all duration-300 ${
          isListening
            ? "w-24 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/25 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]"
            : "w-8.5 bg-transparent text-slate-350 hover:text-white"
        } ${
          isRecording
            ? "w-8.5 bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]"
            : ""
        } ${
          isPlaying
            ? "w-8.5 bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]"
            : ""
        }`}
      >
        {isListening ? (
          <div className="flex items-center justify-center gap-1.25 px-1 py-1">
            <span className="w-0.75 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-0.75 h-4.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-0.75 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="w-0.75 h-4.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
            <span className="w-0.75 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }} />
          </div>
        ) : isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        ) : isPlaying ? (
          <Volume2 className="w-4.5 h-4.5 animate-bounce" />
        ) : isRecording ? (
          <div className="flex items-center gap-0.5">
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <Mic className={`w-4.5 h-4.5 ${voiceMode === "live" ? "text-cyan-400" : "text-amber-400"}`} />
        )}
      </button>

      {/* Selector Switch for mode */}
      <button
        type="button"
        disabled={isAnyActive}
        onClick={() => setVoiceMode(voiceMode === "live" ? "whisper" : "live")}
        className={`px-2 py-1 text-[9px] uppercase font-extrabold tracking-wider rounded-md transition-all shrink-0 ${
          isAnyActive
            ? "opacity-40 cursor-not-allowed text-slate-500"
            : voiceMode === "live"
            ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/15"
            : "text-amber-400 bg-amber-500/10 hover:bg-amber-500/15"
        }`}
        title={`Active: ${voiceMode === "live" ? "Live streaming" : "Whisper HD"}. Click to toggle.`}
      >
        {voiceMode === "live" ? "Live" : "HD"}
      </button>

      {/* Glassmorphic Visual Voice Command Toast Overlay */}
      {commandToast && (
        <div className="fixed inset-x-0 top-24 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-[#080B14]/85 backdrop-blur-md border border-cyan-500/30 text-cyan-400 font-extrabold tracking-widest text-xs uppercase px-5 py-3 rounded-2xl shadow-xl shadow-cyan-500/5 flex items-center gap-3 animate-bounce">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            Voice Command: <span className="text-white">{commandToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
