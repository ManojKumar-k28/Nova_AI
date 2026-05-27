import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

const Landing = lazy(() => import("./pages/Landing"));
const Explore = lazy(() => import("./pages/Explore"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Chat = lazy(() => import("./pages/Chat"));

// Redirect authenticated users away from auth gates
function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/chat" replace /> : <>{children}</>;
}

function HomeRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/chat" replace /> : <Landing />;
}

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    // 1. Initialize theme
    initTheme();

    // 2. Elite Codebase DevTools & Inspect protection
    const blockInspect = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Chrome Inspect)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Chrome Console)
      if (e.ctrlKey && e.shiftKey && (e.key === "J" || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (Chrome Select element)
      if (e.ctrlKey && e.shiftKey && (e.key === "C" || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
      // Cmd+Opt+I (Mac Inspect)
      if (e.metaKey && e.altKey && (e.key === "i" || e.key === "I" || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      // Cmd+Opt+J (Mac Console)
      if (e.metaKey && e.altKey && (e.key === "j" || e.key === "J" || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      return;
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // DevTools anti-debugging debugger loop
    const antiDebug = () => {
      const debuggerLoop = () => {
        try {
          (function() {}).constructor("debugger")();
        } catch (err) {}
        setTimeout(debuggerLoop, 150);
      };
      debuggerLoop();
    };

    document.addEventListener("keydown", blockInspect);
    document.addEventListener("contextmenu", blockContextMenu);
    antiDebug();

    return () => {
      document.removeEventListener("keydown", blockInspect);
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, [initTheme]);

  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          {/* Public Landing Hero page */}
          <Route path="/" element={<HomeRoute />} />

          {/* Public interactive capability showcase page */}
          <Route path="/explore" element={<Explore />} />

          {/* Guest only Authentications */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Authenticated Workspace Sandbox only */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
