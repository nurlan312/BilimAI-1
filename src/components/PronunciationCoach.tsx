import React, { useState, useRef } from 'react';
import { TargetLanguage, UILanguage, PronunciationEvaluation } from '../types';
import { translations } from '../data/translations';
import {
  speakText,
  startVoiceRecognition,
  VoiceRecognitionController,
} from '../services/speechService';
import { evaluatePronunciation } from '../services/geminiService';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Info,
  Radio,
  AlertTriangle,
} from 'lucide-react';

interface PronunciationCoachProps {
  language: TargetLanguage;
  uiLang: UILanguage;
}

export const PronunciationCoach: React.FC<PronunciationCoachProps> = ({
  language,
  uiLang,
}) => {
  const t = translations[uiLang] || translations.ky;

  const kyrgyzPhrases = [
    {
      id: 'ky-p-1',
      title: 'Ө тамгасынын артикуляциясы',
      phrase: 'Көлдөгү өрдөктөр сүзүп жүрөт.',
      translation: 'Утки плавают в озере.',
      focus: 'Ө [ö] — оозду тегеректеп, бирок «Э» тыбышына жакын жумшак үндү чыгарыңыз.',
      difficulty: 'Башталгыч',
    },
    {
      id: 'ky-p-2',
      title: 'Ү тамгасынын артикуляциясы',
      phrase: 'Бүгүн биздин үйгө жаңы гүл келди.',
      translation: 'Сегодня в наш дом принесли новый цветок.',
      focus: 'Ү [ü] — эриндерди алдыга чоюп, «И» тыбышын айтууга аракет кылыңыз.',
      difficulty: 'Башталгыч',
    },
    {
      id: 'ky-p-3',
      title: 'Ң мурунчул тыбышы',
      phrase: 'Жаңы конушта миңдеген үйлөр бар.',
      translation: 'В новом жилмассиве тысячи домов.',
      focus: 'Ң [ŋ] — арткы таңдай аркылуу чыгуучу мурунчул үн.',
      difficulty: 'Орто',
    },
    {
      id: 'ky-p-4',
      title: 'Созулма үндүүлөр (оо, аа, уу)',
      phrase: 'Бийик Ала-Тоонун тунук суусу шар агат.',
      translation: 'Чистая вода высоких гор Ала-Тоо бурно течет.',
      focus: '«Тоо» [too] жана «суу» [suu] сөздөрүндө үндүүлөрдү эки эсе созуңуз.',
      difficulty: 'Орто',
    },
    {
      id: 'ky-p-5',
      title: 'Турмуштук сылык учурашуу',
      phrase: 'Саламатсызбы, иштериңиз кандай болуп жатат?',
      translation: 'Здравствуйте, как продвигаются ваши дела?',
      focus: 'Сылык жана жагымдуу кыргызча интонация.',
      difficulty: 'Башталгыч',
    },
  ];

  const englishPhrases = [
    {
      id: 'en-p-1',
      title: 'Voiceless "TH" (/θ/) sound',
      phrase: 'I think three healthy things will help.',
      translation: 'Я думаю, три полезные вещи помогут.',
      focus: 'Place your tongue gently between your upper and lower front teeth.',
      difficulty: 'Elementary',
    },
    {
      id: 'en-p-2',
      title: 'Voiced "TH" (/ð/) sound',
      phrase: 'This weather is better than that weather.',
      translation: 'Эта погода лучше, чем та погода.',
      focus: 'Vibrate your vocal cords with your tongue between your teeth.',
      difficulty: 'Intermediate',
    },
    {
      id: 'en-p-3',
      title: 'W vs V distinction (/w/ vs /v/)',
      phrase: 'We very rarely view wet winter valleys.',
      translation: 'Мы очень редко видим мокрые зимние долины.',
      focus: 'Round your lips for "W", touch your top teeth to bottom lip for "V".',
      difficulty: 'Intermediate',
    },
    {
      id: 'en-p-4',
      title: 'Short /ɪ/ vs Long /iː/ (Ship vs Sheep)',
      phrase: 'He wants to see the green ship in the deep sea.',
      translation: 'Он хочет увидеть зеленый корабль в глубоком море.',
      focus: 'Stretch lips smiling for "see" [iː], relax for "ship" [ɪ].',
      difficulty: 'Advanced',
    },
  ];

  const phraseList = language === 'kyrgyz' ? kyrgyzPhrases : englishPhrases;
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(0);
  const currentPhrase = phraseList[selectedPhraseIndex];

  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);

  const activeCtrlRef = useRef<VoiceRecognitionController | null>(null);

  const handlePlaySample = () => {
    speakText(currentPhrase.phrase, language);
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      if (activeCtrlRef.current) {
        activeCtrlRef.current.stop();
        activeCtrlRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    setMicError(null);
    setSpokenText('');
    setEvaluation(null);

    try {
      setIsRecording(true);
      const controller = await startVoiceRecognition(
        language,
        (text) => setSpokenText(text),
        (err) => {
          console.warn('Speech rec error:', err);
          setMicError(err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
          activeCtrlRef.current = null;
        },
        (level) => setAudioLevel(level)
      );

      if (controller) {
        activeCtrlRef.current = controller;
      } else {
        setIsRecording(false);
      }
    } catch (e) {
      console.error(e);
      setMicError('Микрофон иштебей калды. Браузерде микрофонго уруксат бар экенин текшериңиз.');
      setIsRecording(false);
    }
  };

  const handleEvaluate = async () => {
    if (!spokenText.trim()) return;

    setIsEvaluating(true);
    try {
      const result = await evaluatePronunciation({
        targetText: currentPhrase.phrase,
        spokenText,
        language,
      });
      setEvaluation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-heading font-bold text-slate-900">
          {t.pronounceTitle}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t.pronounceSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Phrase selector */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Көнүгүү фразалары:
          </h3>
          <div className="space-y-2">
            {phraseList.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedPhraseIndex(idx);
                  setSpokenText('');
                  setEvaluation(null);
                  if (activeCtrlRef.current) {
                    activeCtrlRef.current.stop();
                    activeCtrlRef.current = null;
                    setIsRecording(false);
                  }
                }}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${
                  selectedPhraseIndex === idx
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div
                    className={`text-[11px] truncate max-w-[180px] mt-0.5 ${
                      selectedPhraseIndex === idx ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.phrase}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    selectedPhraseIndex === idx ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Phrase Trainer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {/* Target Display */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  {currentPhrase.difficulty}
                </span>
                <button
                  onClick={handlePlaySample}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Үлгүнү угуу</span>
                </button>
              </div>

              <div className="mt-4">
                <span className="text-xs text-slate-400 font-medium">Үн чыгарып кайталаңыз:</span>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 mt-1">
                  {currentPhrase.phrase}
                </h3>
                <p className="text-sm text-slate-500 mt-1 italic">
                  {currentPhrase.translation}
                </p>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>{currentPhrase.focus}</p>
              </div>
            </div>

            {/* Error banner if microphone permission issue */}
            {micError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Recording Controls */}
            <div className="p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
              <div className="relative inline-block">
                <button
                  onClick={handleToggleRecord}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-800">
                  {isRecording ? 'Микрофон жазып жатат... Сүйлөмдү үн чыгарып окуңуз' : t.tapToRecord}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Үн толкуну кабыл алынууда...</span>
                    {/* Audio wave bars */}
                    <span
                      className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, audioLevel * 18)}px` }}
                    />
                    <span
                      className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, audioLevel * 24)}px` }}
                    />
                    <span
                      className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, audioLevel * 14)}px` }}
                    />
                  </div>
                )}
              </div>

              {spokenText && (
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 max-w-md mx-auto text-left space-y-2">
                  <div className="text-slate-400 font-medium">Сиздин айтканыңыз:</div>
                  <div className="font-semibold text-sm text-slate-900">"{spokenText}"</div>

                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="w-full py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEvaluating ? t.evaluating : 'ИИ аркылуу баалоо'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Evaluation Score & Breakdown */}
            {evaluation && (
              <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-emerald-950">
                      {t.scoreLabel}
                    </span>
                  </div>
                  <div className="text-xl font-heading font-extrabold text-emerald-700 tabular-nums">
                    {evaluation.score} / 100
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {evaluation.feedback}
                </p>

                {evaluation.phoneticTips?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-emerald-200/60">
                    <div className="text-xs font-bold text-emerald-900">
                      {t.phoneticFeedback}
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                      {evaluation.phoneticTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
