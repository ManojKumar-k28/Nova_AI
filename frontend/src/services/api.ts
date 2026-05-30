import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "") || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor: reads nova_token from localStorage and adds Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nova_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: clears storage and redirects to /login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("nova_token");
      localStorage.removeItem("nova_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }).then((res) => res.data),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }).then((res) => res.data),
  sendOTP: (email: string) =>
    api.post("/api/auth/otp/send", { email }).then((res) => res.data),
  loginWithOTP: (email: string, otp: string) =>
    api.post("/api/auth/otp/login", { email, otp }).then((res) => res.data),
  loginWithGoogle: (credential: string) =>
    api.post("/api/auth/google", { credential }).then((res) => res.data),
  getMe: () =>
    api.get("/api/auth/me").then((res) => res.data)
};

export const chatAPI = {
  getSessions: () =>
    api.get("/api/sessions").then((res) => res.data),
  createSession: (title?: string, model?: string) =>
    api.post("/api/sessions", { title, model }).then((res) => res.data),
  getMessages: (sessionId: string) =>
    api.get(`/api/sessions/${sessionId}/messages`).then((res) => res.data),
  deleteSession: (sessionId: string) =>
    api.delete(`/api/sessions/${sessionId}`).then((res) => res.data)
};

export const documentAPI = {
  upload: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    }).then((res) => res.data);
  },
  getDocuments: () =>
    api.get("/api/documents/").then((res) => res.data),
  getVectorstoreStatus: () =>
    api.get("/api/documents/vectorstore/status").then((res) => res.data),
  deleteDocument: (docId: string) =>
    api.delete(`/api/documents/${docId}`).then((res) => res.data)
};

export const voiceAPI = {
  transcribe: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    return api.post("/api/voice/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then((res) => res.data);
  },
  getSpeakUrl: (text: string) => {
    const token = localStorage.getItem("nova_token") || "";
    // Note: speak route checks token to authenticate
    return `${baseURL}/api/voice/speak?text=${encodeURIComponent(text)}&token=${token}`;
  }
};

export async function streamChat(
  sessionId: string,
  message: string,
  model: string = "llama-3.3-70b",
  onChunk: (chunk: string) => void,
  onDone: (sources?: any[]) => void
) {
  const token = localStorage.getItem("nova_token");
  const response = await fetch(`${baseURL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      model,
      use_rag: true,
      use_memory: true
    })
  });

  if (!response.ok) {
    throw new Error("Chat streaming failed");
  }

  if (!response.body) {
    throw new Error("Response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: !done });
      onChunk(chunk);
    }
  }

  // To fetch RAG sources, since we can query messages again at completion, we let the store refresh
  onDone();
}

export async function streamTrialChat(
  message: string,
  sessionKey: string,
  model: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const response = await fetch(`${baseURL}/api/trial/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      session_key: sessionKey,
      model
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    let parsedMessage = "Trial chat failed";
    try {
      const errObj = JSON.parse(detail);
      parsedMessage = errObj.detail || parsedMessage;
    } catch {
      parsedMessage = detail || parsedMessage;
    }
    throw new Error(parsedMessage);
  }

  if (!response.body) {
    throw new Error("Response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: !done });
      onChunk(chunk);
    }
  }

  onDone();
}
