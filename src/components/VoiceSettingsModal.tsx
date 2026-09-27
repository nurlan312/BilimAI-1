import React, { useState } from 'react';
import {
  AVAILABLE_VOICES,
  getSelectedVoice,
  setSelectedVoice,
  speakText,
  stopSpeaking,
  TtsVoiceName,
} from '../services/speechService';
import { TargetLanguage, UILanguage } from '../types';
import { Volume2, Check, X, Sparkles, Mic2 } from 'lucide-react';

interface VoiceSettingsModalProps {
  language: TargetLanguage;
  uiLang: UILanguage;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  language,
  onClose,
}) => {
  const [currentVoice, setCurrentVoice] = useState<TtsVoiceName>(getSelectedVoice());
  const [isPlaying, setIsPlaying] = useState<TtsVoiceName | null>(null);

  const handleTestVoice = (voice: TtsVoiceName) => {
    setIsPlaying(voice);
    const testPhrase =
      language === 'kyrgyz'
        ? 'Саламатсызбы! Мен сиздин кыргыз тили боюнча жеке ИИ репетиторуңуз болом.'
        : 'Hello! I am your personal AI language tutor. Nice to meet you!';

    speakText(
      testPhrase,
      language,
      undefined,
      () => setIsPlaying(null),
      voice
    );
  };

  const handleSaveVoice = (voice: TtsVoiceName) => {
    setSelectedVoice(voice);
    setCurrentVoice(voice);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                ИИ-репетитордун үнүн тандоо
              </h2>
              <p className="text-xs text-slate-500">Табигый адам үнү (Gemini AI TTS)</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voices List */}
        <div className="space-y-2.5">
          {AVAILABLE_VOICES.map((v) => {
            const isSelected = currentVoice === v.id;
            return (
              <div
                key={v.id}
                onClick={() => handleSaveVoice(v.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-slate-900">
                      {v.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {v.gender}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        <span>Тандалды</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{v.description}</p>
                </div>

                {/* Listen sample button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(v.id);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
                    isPlaying === v.id
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Үн үлгүсүн угуу"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Help Tip */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Тандалган үн бардык сабактарда, сөздүктө жана «ИИ Ментор» чатындагы аудио
            сүйлөөдө колдонулат.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Сактоо жана жабуу
          </button>
        </div>
      </div>
    </div>
  );
};
