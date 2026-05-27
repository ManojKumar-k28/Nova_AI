import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";

export function useVoiceCommands() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const createSession = useChatStore((s) => s.createSession);

  const speakConfirmation = (message: string) => {
    if ("speechSynthesis" in window) {
      // cancel any active speech synthesis
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (text: string, setCommandToast: (msg: string | null) => void): boolean => {
    const cleanText = text.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // 1. Navigation to Explore Page
    if (
      cleanText.includes("go to explore") ||
      cleanText.includes("navigate to explore") ||
      cleanText.includes("open explore")
    ) {
      setCommandToast("Navigating to Explore page");
      speakConfirmation("Navigating to the explore page.");
      setTimeout(() => {
        navigate("/explore");
        setCommandToast(null);
      }, 1500);
      return true;
    }

    // 2. Navigation to Chat Workspace
    if (
      cleanText.includes("go to chat") ||
      cleanText.includes("navigate to chat") ||
      cleanText.includes("open chat") ||
      cleanText.includes("go to workspace") ||
      cleanText.includes("open workspace") ||
      cleanText.includes("go to active conversation")
    ) {
      if (!isAuthenticated) {
        setCommandToast("Authentication Required");
        speakConfirmation("Please sign in first to access the workspace.");
        setTimeout(() => {
          navigate("/login");
          setCommandToast(null);
        }, 1500);
      } else {
        setCommandToast("Opening Workspace");
        speakConfirmation("Opening your workspace.");
        setTimeout(() => {
          navigate("/chat");
          setCommandToast(null);
        }, 1500);
      }
      return true;
    }

    // 3. Navigation to Home / Landing
    if (
      cleanText.includes("go to home") ||
      cleanText.includes("go to landing") ||
      cleanText.includes("navigate to home") ||
      cleanText.includes("open home") ||
      cleanText.includes("go to main page")
    ) {
      setCommandToast("Navigating Home");
      speakConfirmation("Navigating home.");
      setTimeout(() => {
        navigate("/");
        setCommandToast(null);
      }, 1500);
      return true;
    }

    // 4. Navigation to Sign In / Login
    if (
      cleanText.includes("go to login") ||
      cleanText.includes("navigate to login") ||
      cleanText.includes("open login") ||
      cleanText.includes("go to sign in") ||
      cleanText.includes("open sign in")
    ) {
      setCommandToast("Opening Sign In Page");
      speakConfirmation("Opening the sign in page.");
      setTimeout(() => {
        navigate("/login");
        setCommandToast(null);
      }, 1500);
      return true;
    }

    // 5. Navigation to Sign Up / Register
    if (
      cleanText.includes("go to register") ||
      cleanText.includes("navigate to register") ||
      cleanText.includes("open register") ||
      cleanText.includes("go to sign up") ||
      cleanText.includes("open sign up")
    ) {
      setCommandToast("Opening Sign Up Page");
      speakConfirmation("Opening the sign up page.");
      setTimeout(() => {
        navigate("/register");
        setCommandToast(null);
      }, 1500);
      return true;
    }

    // 6. Sign Out / Logout
    if (
      cleanText === "logout" ||
      cleanText === "log out" ||
      cleanText === "sign out" ||
      cleanText.includes("logout of my account") ||
      cleanText.includes("sign me out")
    ) {
      setCommandToast("Signing Out");
      speakConfirmation("Logging you out. Goodbye.");
      setTimeout(() => {
        logout();
        clearMessages();
        navigate("/");
        setCommandToast(null);
      }, 1500);
      return true;
    }

    // 7. Clear messages / reset current conversation
    if (
      cleanText === "clear chat" ||
      cleanText === "reset chat" ||
      cleanText === "clear messages" ||
      cleanText === "clear conversation" ||
      cleanText === "reset conversation"
    ) {
      if (isAuthenticated) {
        setCommandToast("Clearing Chat");
        speakConfirmation("Resetting your current workspace conversation.");
        clearMessages();
        setTimeout(() => setCommandToast(null), 1500);
        return true;
      }
    }

    // 8. New Chat Session
    if (
      cleanText.includes("new chat") ||
      cleanText.includes("create chat") ||
      cleanText.includes("new conversation") ||
      cleanText.includes("create new session")
    ) {
      if (isAuthenticated) {
        setCommandToast("Starting New Conversation");
        speakConfirmation("Starting a new conversation session.");
        createSession("New Conversation", "llama-3.3-70b");
        setTimeout(() => {
          navigate("/chat");
          setCommandToast(null);
        }, 1500);
        return true;
      } else {
        setCommandToast("Authentication Required");
        speakConfirmation("Please sign in to start a chat session.");
        setTimeout(() => {
          navigate("/login");
          setCommandToast(null);
        }, 1500);
        return true;
      }
    }

    return false;
  };

  return { handleVoiceCommand };
}
