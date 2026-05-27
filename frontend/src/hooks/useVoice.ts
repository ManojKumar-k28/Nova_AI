import { useState, useCallback, useRef } from "react";
import { startRecording, playAudio, startSpeechRecognition } from "../services/voice";
import { voiceAPI } from "../services/api";

export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startAudioRecording = useCallback(async () => {
    setError(null);
    setIsRecording(true);
    try {
      const recorder = await startRecording();
      recorderRef.current = recorder;
    } catch (err) {
      console.error("Failed to start voice capture:", err);
      setError("Failed to access microphone. Please check permissions.");
      setIsRecording(false);
    }
  }, []);

  const stopAudioRecording = useCallback(async (): Promise<Blob | null> => {
    if (!recorderRef.current) {
      setIsRecording(false);
      return null;
    }
    try {
      const blob = await recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);
      return blob;
    } catch (err) {
      console.error("Failed to stop voice capture:", err);
      setIsRecording(false);
      return null;
    }
  }, []);

  const transcribeFile = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      const response = await voiceAPI.transcribe(audioBlob);
      setTranscript(response.text);
      return response.text;
    } catch (err) {
      console.error("Failed to transcribe audio blob:", err);
      setError("Transcription failed.");
      return "";
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    setIsPlaying(true);
    try {
      const url = voiceAPI.getSpeakUrl(text);
      await playAudio(url);
    } catch (err) {
      console.error("Failed to play synthesized audio:", err);
    } finally {
      setIsPlaying(false);
    }
  }, []);

  const triggerLiveSpeechRecognition = useCallback((onResult: (text: string) => void) => {
    setIsListening(true);
    const rec = startSpeechRecognition(
      (text) => {
        setTranscript(text);
        onResult(text);
      },
      () => {
        setIsListening(false);
        recognitionRef.current = null;
      }
    );
    recognitionRef.current = rec;
  }, []);

  const stopLiveSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    isRecording,
    isListening,
    isPlaying,
    transcript,
    error,
    startAudioRecording,
    stopAudioRecording,
    transcribeFile,
    speak,
    triggerLiveSpeechRecognition,
    stopLiveSpeechRecognition
  };
}
