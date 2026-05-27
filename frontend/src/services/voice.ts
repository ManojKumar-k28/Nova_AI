export function startRecording(): Promise<{ stop: () => Promise<Blob> }> {
  // creates MediaStream from getUserMedia audio
  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    // creates MediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    // collects audio chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.start();

    // returns object with stop() that resolves to Blob
    const stop = (): Promise<Blob> => {
      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          // release microphone resources
          stream.getTracks().forEach((track) => track.stop());
          resolve(blob);
        };
        mediaRecorder.stop();
      });
    };

    return { stop };
  });
}

export function playAudio(url: string): Promise<void> {
  // creates Audio element with url
  // returns promise that resolves when audio ends
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => {
      resolve();
    };
    audio.onerror = (err) => {
      reject(err);
    };
    audio.play().catch(reject);
  });
}

export function startSpeechRecognition(
  onResult: (text: string) => void,
  onEnd: () => void
): SpeechRecognition | null {
  // uses window.SpeechRecognition
  const SpeechRecognitionImpl =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognitionImpl) {
    return null;
  }

  const recognition = new SpeechRecognitionImpl();
  // sets language en-US
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  // calls onResult with final transcript
  recognition.onresult = (event) => {
    const resultIndex = event.resultIndex;
    const text = event.results[resultIndex][0].transcript;
    onResult(text);
  };

  // calls onEnd when recognition stops
  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = () => {
    onEnd();
  };

  recognition.start();
  // returns recognition object or null if unsupported
  return recognition;
}
