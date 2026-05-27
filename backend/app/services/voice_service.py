import importlib

from gtts import gTTS
from app.config.settings import settings

# Global whisper model cache
_whisper_model = None

def _load_whisper_module():
    try:
        whisper = importlib.import_module("whisper")
    except TypeError as exc:
        if "LoadLibrary() argument 1 must be str, not None" in str(exc):
            raise RuntimeError(
                "The installed 'whisper' package is not the local Whisper speech-to-text package. "
                "Uninstall it with 'pip uninstall whisper' and install the backend "
                "requirements so 'openai-whisper' is available. This package runs locally "
                "and does not call the OpenAI API."
            ) from exc
        raise

    if not hasattr(whisper, "load_model"):
        raise RuntimeError(
            "The installed 'whisper' package does not expose load_model. "
            "Install 'openai-whisper' from backend/requirements.txt. This package runs "
            "locally and does not call the OpenAI API."
        )

    return whisper

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        # loads whisper model from settings
        whisper = _load_whisper_module()
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL)
    return _whisper_model

async def transcribe_audio(
    audio_path: str
) -> str:
    # calls model.transcribe(audio_path)
    model = get_whisper_model()
    result = model.transcribe(audio_path)
    # returns result["text"] stripped
    return result["text"].strip()

async def text_to_speech(
    text: str, output_path: str
) -> str:
    # creates gTTS object with text
    tts = gTTS(text=text, lang="en", slow=False)
    # saves to output_path
    tts.save(output_path)
    # returns output_path
    return output_path
