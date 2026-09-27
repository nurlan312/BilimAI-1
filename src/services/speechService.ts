import { TargetLanguage } from '../types';

export type TtsVoiceName = 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';

export interface VoiceOption {
  id: TtsVoiceName;
  name: string;
  gender: string;
  description: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Айгүл эже (Kore)',
    gender: 'Аял / Female',
    description: 'Жагымдуу, жумшак жана так сүйлөгөн эне тил үнү',
  },
  {
    id: 'Puck',
    name: 'Азамат (Puck)',
    gender: 'Эркек / Male',
    description: 'Шайыр, энергетикалык жана так эркек үнү',
  },
  {
    id: 'Zephyr',
    name: 'Teacher John (Zephyr)',
    gender: 'Эркек / Neutral',
    description: 'Англис жана кыргыз тилинде салмактуу мугалим үнү',
  },
  {
    id: 'Fenrir',
    name: 'Бакыт агай (Fenrir)',
    gender: 'Эркек / Male',
    description: 'Терең, расмий жана ишенимдүү үн',
  },
];

const STORAGE_VOICE_KEY = 'bilim_ai_selected_voice_v1';

export function getSelectedVoice(): TtsVoiceName {
  if (typeof window === 'undefined') return 'Kore';
  return (localStorage.getItem(STORAGE_VOICE_KEY) as TtsVoiceName) || 'Kore';
}

export function setSelectedVoice(voice: TtsVoiceName) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_VOICE_KEY, voice);
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// Current active HTML audio element for Gemini TTS
let activeAudioElement: HTMLAudioElement | null = null;

// Stop any speaking audio
export function stopSpeaking() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    } catch {
      // ignore
    }
  }
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// High-fidelity natural voice player using Gemini TTS with client fallback
export async function speakText(
  text: string,
  language: TargetLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  customVoice?: TtsVoiceName
) {
  stopSpeaking();
  onStart?.();

  const chosenVoice = customVoice || getSelectedVoice();

  // Try Server-side Gemini AI Text-to-Speech (High fidelity natural human voice)
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: chosenVoice,
        language,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        activeAudioElement = audio;

        audio.onended = () => {
          activeAudioElement = null;
          onEnd?.();
        };

        audio.onerror = () => {
          activeAudioElement = null;
          fallbackClientSpeech(text, language, onStart, onEnd);
        };

        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS failed or offline, falling back to browser synthesis:', err);
  }

  // Fallback to client browser SpeechSynthesis
  fallbackClientSpeech(text, language, onStart, onEnd);
}

function fallbackClientSpeech(
  text: string,
  language: TargetLanguage,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Browser Speech synthesis not supported');
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.05;

  if (language === 'english') {
    utterance.lang = 'en-US';
  } else {
    const voices = window.speechSynthesis.getVoices();
    const kyVoice = voices.find((v) => v.lang.includes('ky') || v.lang.includes('KY'));
    const trVoice = voices.find((v) => v.lang.includes('tr'));
    const ruVoice = voices.find((v) => v.lang.includes('ru'));

    if (kyVoice) {
      utterance.voice = kyVoice;
      utterance.lang = kyVoice.lang;
    } else if (ruVoice) {
      utterance.voice = ruVoice;
      utterance.lang = 'ru-RU';
    } else if (trVoice) {
      utterance.voice = trVoice;
      utterance.lang = 'tr-TR';
    } else {
      utterance.lang = 'ru-RU';
    }
  }

  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export interface VoiceRecognitionController {
  stop: () => void;
  stream?: MediaStream;
}

// Microphone voice recognition with audio level monitoring and permission fallback
export async function startVoiceRecognition(
  language: TargetLanguage,
  onTranscript: (text: string) => void,
  onError: (err: string) => void,
  onEnd: () => void,
  onAudioLevel?: (level: number) => void
): Promise<VoiceRecognitionController | null> {
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let animFrameId: number | null = null;

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (
        onAudioLevel &&
        (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      ) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new AudioCtx();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
          onAudioLevel(average / 128);
          animFrameId = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      }
    }
  } catch (err) {
    console.warn('getUserMedia permission error:', err);
    onError('Микрофонду колдонууга уруксат бериңиз (Microphone permission required in browser).');
    onEnd();
    return null;
  }

  if (!isSpeechRecognitionSupported()) {
    onError('Браузериңиз үн таанууну (SpeechRecognition) түздөн-түз колдобойт.');
    cleanupStream();
    onEnd();
    return null;
  }

  function cleanupStream() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recognition: any = new SpeechRec();

  let isCleanedUp = false;

  const tryStartRecognition = (targetLangCode: string) => {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = targetLangCode;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      const combined = (final || interim).trim();
      if (combined) {
        onTranscript(combined);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn('SpeechRec error event:', event.error);
      if (event.error === 'language-not-supported' && targetLangCode === 'ky-KG') {
        try {
          recognition.stop();
          recognition = new SpeechRec();
          tryStartRecognition('ru-RU');
          return;
        } catch {
          // ignore
        }
      }

      if (event.error === 'not-allowed') {
        onError('Микрофонго уруксат берилген жок.');
      } else if (event.error === 'no-speech') {
        // user was quiet
      } else {
        onError(`Үн таанууда эскертүү: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (!isCleanedUp) {
        cleanupStream();
        onEnd();
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition start caught error:', e);
    }
  };

  const initialLangCode = language === 'english' ? 'en-US' : 'ky-KG';
  tryStartRecognition(initialLangCode);

  return {
    stop: () => {
      isCleanedUp = true;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      cleanupStream();
      onEnd();
    },
    stream: mediaStream || undefined,
  };
}
