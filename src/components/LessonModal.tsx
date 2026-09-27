import React, { useState } from 'react';
import { LessonContent, TargetLanguage, UILanguage } from '../types';
import { translations } from '../data/translations';
import { speakText, startVoiceRecognition, isSpeechRecognitionSupported } from '../services/speechService';
import { explainRuleOrMistake, evaluatePronunciation } from '../services/geminiService';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mic,
  MicOff,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';

interface LessonModalProps {
  lesson: LessonContent;
  language: TargetLanguage;
  uiLang: UILanguage;
  onClose: () => void;
  onCompleteLesson: (lessonId: string, earnedXp: number) => void;
}

type StepType = 'intro' | 'vocab' | 'exercises' | 'speaking' | 'complete';

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  language,
  uiLang,
  onClose,
  onCompleteLesson,
}) => {
  const t = translations[uiLang] || translations.ky;
  const [currentStep, setCurrentStep] = useState<StepType>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);

  // Exercise interaction states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [selectedPairs, setSelectedPairs] = useState<{ left?: string; right?: string }>({});
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState<{
    score: number;
    feedback: string;
    tips: string[];
  } | null>(null);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);
  const activeVoiceCtrlRef = React.useRef<{ stop: () => void } | null>(null);

  // AI Deep Explanation
  const [aiExplanation, setAiExplanation] = useState<{
    simpleExplanation: string;
    ruleSummary: string;
    examples: { original: string; translation: string; breakdown: string }[];
    memoryTip: string;
  } | null>(null);
  const [isLoadingAiExplain, setIsLoadingAiExplain] = useState(false);

  // Audio playing
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const currentExercise = lesson.exercises[exerciseIndex];

  const handlePlayAudio = (text: string) => {
    setPlayingPhrase(text);
    speakText(text, language, undefined, () => setPlayingPhrase(null));
  };

  // Reorder word selection
  const handleToggleReorderWord = (word: string) => {
    if (reorderedWords.includes(word)) {
      setReorderedWords(reorderedWords.filter((w) => w !== word));
    } else {
      setReorderedWords([...reorderedWords, word]);
    }
  };

  // Matching pairs
  const handleSelectMatching = (side: 'left' | 'right', val: string) => {
    if (side === 'left') {
      setSelectedPairs((prev) => ({ ...prev, left: val }));
    } else {
      if (selectedPairs.left) {
        // match pair
        const pairKey = `${selectedPairs.left}-${val}`;
        const newMatched = [...matchedPairs, pairKey];
        setMatchedPairs(newMatched);
        setSelectedPairs({});

        if (newMatched.length === (currentExercise.pairs?.length || 0)) {
          setIsAnswerChecked(true);
          setIsAnswerCorrect(true);
        }
      }
    }
  };

  // Check current exercise
  const handleCheckExercise = () => {
    if (!currentExercise) return;

    let correct = false;
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') {
      correct = selectedOption === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'reorder') {
      const built = reorderedWords.join(' ').trim();
      correct = built.toLowerCase() === (currentExercise.correctAnswer as string).toLowerCase();
    } else if (currentExercise.type === 'matching') {
      correct = matchedPairs.length === (currentExercise.pairs?.length || 0);
    }

    setIsAnswerCorrect(correct);
    setIsAnswerChecked(true);
  };

  // Next exercise or step
  const handleNextExercise = () => {
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setReorderedWords([]);
    setMatchedPairs([]);
    setSelectedPairs({});
    setAiExplanation(null);

    if (exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
    } else {
      setCurrentStep('speaking');
    }
  };

  // Ask AI to explain differently
  const handleAskAiExplanation = async () => {
    setIsLoadingAiExplain(true);
    try {
      const result = await explainRuleOrMistake({
        topic: lesson.grammarFocus,
        context: currentExercise?.prompt,
        language,
      });
      setAiExplanation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAiExplain(false);
    }
  };

  // Speaking with STT and Gemini analysis
  const handleStartRecording = async () => {
    if (isRecording) {
      if (activeVoiceCtrlRef.current) {
        activeVoiceCtrlRef.current.stop();
        activeVoiceCtrlRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    setSpokenTranscript('');
    setSpeakingFeedback(null);
    setIsRecording(true);

    try {
      const controller = await startVoiceRecognition(
        language,
        (text) => setSpokenTranscript(text),
        (err) => {
          console.warn('Speech rec error in lesson:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
          activeVoiceCtrlRef.current = null;
        }
      );

      if (controller) {
        activeVoiceCtrlRef.current = controller;
      } else {
        setIsRecording(false);
      }
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleEvaluateSpeaking = async () => {
    if (!spokenTranscript) return;
    setIsEvaluatingSpeech(true);
    const targetPhrase = lesson.examples[0]?.phrase || lesson.title;

    try {
      const evalResult = await evaluatePronunciation({
        targetText: targetPhrase,
        spokenText: spokenTranscript,
        language,
      });

      setSpeakingFeedback({
        score: evalResult.score,
        feedback: evalResult.feedback,
        tips: evalResult.phoneticTips,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluatingSpeech(false);
    }
  };

  const handleFinishLesson = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onCompleteLesson(lesson.id, 50);
    setCurrentStep('complete');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                {lesson.title}
              </h2>
              <p className="text-xs text-slate-500">{lesson.titleTranslation}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Pill Indicators */}
        <div className="px-6 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-1 overflow-x-auto text-xs font-semibold text-slate-500">
          <button
            onClick={() => setCurrentStep('intro')}
            className={`px-3 py-1 rounded-md transition ${
              currentStep === 'intro' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >
            1. {t.stepExplanation}
          </button>
          <button
            onClick={() => setCurrentStep('vocab')}
            className={`px-3 py-1 rounded-md transition ${
              currentStep === 'vocab' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >
            2. {t.stepVocabulary}
          </button>
          <button
            onClick={() => setCurrentStep('exercises')}
            className={`px-3 py-1 rounded-md transition ${
              currentStep === 'exercises' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >
            3. {t.stepExercises} ({exerciseIndex + 1}/{lesson.exercises.length})
          </button>
          <button
            onClick={() => setCurrentStep('speaking')}
            className={`px-3 py-1 rounded-md transition ${
              currentStep === 'speaking' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
            }`}
          >
            4. {t.stepSpeaking}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: INTRO & GRAMMAR */}
          {currentStep === 'intro' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Грамматикалык басым: {lesson.grammarFocus}</span>
                </div>
                <p className="text-xs text-amber-700/90">{lesson.summary}</p>
              </div>

              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {lesson.introduction}
              </div>

              {/* Examples with audio */}
              <div className="space-y-2 mt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Үлгү сүйлөмдөр (Контексттеги мисалдар):
                </h4>
                <div className="space-y-2">
                  {lesson.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{ex.phrase}</div>
                        <div className="text-xs text-slate-500">{ex.translation}</div>
                        {ex.note && <div className="text-[11px] text-amber-700 mt-0.5">{ex.note}</div>}
                      </div>
                      <button
                        onClick={() => handlePlayAudio(ex.phrase)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
                          playingPhrase === ex.phrase
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Угуу"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: KEY VOCABULARY */}
          {currentStep === 'vocab' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Бул сабактагы жаңы сөздөр жана айтылышы:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.keyVocabulary.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="text-base font-bold text-slate-900">{v.word}</div>
                      <div className="text-xs font-mono text-slate-400">{v.transcription}</div>
                      <div className="text-xs text-slate-600 mt-1">{v.translation}</div>
                    </div>
                    <button
                      onClick={() => handlePlayAudio(v.word)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 flex items-center justify-center transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: INTERACTIVE EXERCISES */}
          {currentStep === 'exercises' && currentExercise && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {currentExercise.instruction}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 mt-1">
                  {currentExercise.prompt}
                </h3>
              </div>

              {/* Multiple Choice & Fill Blank */}
              {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') && (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentExercise.options?.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    let btnStyle = 'border-slate-200 bg-white text-slate-800 hover:border-slate-300';
                    if (isSelected) {
                      btnStyle = 'border-slate-900 bg-slate-900 text-white';
                    }
                    if (isAnswerChecked) {
                      if (opt === currentExercise.correctAnswer) {
                        btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold';
                      } else if (isSelected && !isAnswerCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-50 text-rose-800';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedOption(opt)}
                        className={`w-full p-3.5 rounded-xl border text-sm font-medium text-left transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerChecked && opt === currentExercise.correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Reorder words */}
              {currentExercise.type === 'reorder' && (
                <div className="space-y-4">
                  {/* Selected Words Canvas */}
                  <div className="min-h-16 p-3 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 flex flex-wrap gap-2 items-center">
                    {reorderedWords.length === 0 ? (
                      <span className="text-xs text-slate-400">Сөздөрдү тандап, сүйлөм түзүңүз...</span>
                    ) : (
                      reorderedWords.map((word, i) => (
                        <button
                          key={i}
                          onClick={() => handleToggleReorderWord(word)}
                          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs"
                        >
                          {word} ×
                        </button>
                      ))
                    )}
                  </div>

                  {/* Available Word Pool */}
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.options?.map((word, i) => {
                      const isUsed = reorderedWords.includes(word);
                      return (
                        <button
                          key={i}
                          disabled={isUsed || isAnswerChecked}
                          onClick={() => handleToggleReorderWord(word)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            isUsed
                              ? 'bg-slate-100 text-slate-300 border-slate-200'
                              : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 shadow-xs'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching pairs */}
              {currentExercise.type === 'matching' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Кыргызча:</h5>
                    {currentExercise.pairs?.map((p, i) => {
                      const isMatched = matchedPairs.some((m) => m.startsWith(p.left));
                      const isSelected = selectedPairs.left === p.left;
                      return (
                        <button
                          key={i}
                          disabled={isMatched}
                          onClick={() => handleSelectMatching('left', p.left)}
                          className={`w-full p-2.5 rounded-lg border text-xs font-semibold text-left transition ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 line-through opacity-70'
                              : isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {p.left}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Котормосу:</h5>
                    {currentExercise.pairs?.map((p, i) => {
                      const isMatched = matchedPairs.some((m) => m.endsWith(p.right));
                      return (
                        <button
                          key={i}
                          disabled={isMatched}
                          onClick={() => handleSelectMatching('right', p.right)}
                          className={`w-full p-2.5 rounded-lg border text-xs font-semibold text-left transition ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 opacity-70'
                              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {p.right}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Result explanation & Gemini Deep Explain button */}
              {isAnswerChecked && (
                <div
                  className={`p-4 rounded-xl border ${
                    isAnswerCorrect
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isAnswerCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs leading-relaxed flex-1">
                      <div className="font-bold mb-1">
                        {isAnswerCorrect ? 'Азаматсыз! Туура жооп!' : 'Ката! Оңдоп көрүңүз.'}
                      </div>
                      <p>{currentExercise.explanation}</p>
                    </div>
                  </div>

                  {/* Ask AI Tutor to explain in simple words */}
                  <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                    <button
                      onClick={handleAskAiExplanation}
                      disabled={isLoadingAiExplain}
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isLoadingAiExplain ? 'ИИ түшүндүрүүдө...' : 'ИИ-репетитордон башкача түшүндүрүүнү суроо'}</span>
                    </button>
                  </div>

                  {/* Render AI explanation */}
                  {aiExplanation && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-800 space-y-1.5 animate-in fade-in">
                      <div className="font-bold text-indigo-900">ИИ Мугалимдин түшүндүрмөсү:</div>
                      <p>{aiExplanation.simpleExplanation}</p>
                      <div className="p-2 bg-indigo-50/60 rounded text-[11px] text-indigo-800 font-mono">
                        💡 {aiExplanation.memoryTip}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SPEAKING CHALLENGE */}
          {currentStep === 'speaking' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Үн чыгарып кайталаңыз:
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 mt-2">
                  {lesson.examples[0]?.phrase || lesson.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lesson.examples[0]?.translation || lesson.titleTranslation}
                </p>

                <button
                  onClick={() => handlePlayAudio(lesson.examples[0]?.phrase || lesson.title)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Үлгү үндү угуу</span>
                </button>
              </div>

              {/* Record Button & Transcript */}
              <div className="text-center space-y-3">
                <button
                  onClick={handleStartRecording}
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                <div className="text-xs text-slate-500">
                  {isRecording ? 'Сүйлөңүз... Угуп жатам' : 'Микрофонду басып сүйлөңүз'}
                </div>

                {spokenTranscript && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 max-w-md mx-auto">
                    <span className="text-slate-400 font-medium">Сиз айттыңыз: </span>
                    <span className="font-semibold">"{spokenTranscript}"</span>

                    <button
                      onClick={handleEvaluateSpeaking}
                      disabled={isEvaluatingSpeech}
                      className="mt-2 block w-full py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                    >
                      {isEvaluatingSpeech ? 'Текшерилүүдө...' : 'ИИ аркылуу баалоо'}
                    </button>
                  </div>
                )}

                {/* Feedback from AI */}
                {speakingFeedback && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs text-emerald-950 space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span>Айтылыш упайы:</span>
                      <span className="text-sm px-2 py-0.5 bg-emerald-600 text-white rounded">
                        {speakingFeedback.score} / 100
                      </span>
                    </div>
                    <p>{speakingFeedback.feedback}</p>
                    {speakingFeedback.tips?.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {speakingFeedback.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: LESSON COMPLETE */}
          {currentStep === 'complete' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-bold text-slate-900">
                {t.congratulations}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Сиз «{lesson.title}» сабагын ийгиликтүү өздөштүрдүңүз. Күн сайын машыгуу тилди тез өздөштүрүүнүн сыры!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>+50 XP алынды!</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            {t.cancel}
          </button>

          {currentStep === 'intro' && (
            <button
              onClick={() => setCurrentStep('vocab')}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <span>{t.nextStep}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 'vocab' && (
            <button
              onClick={() => setCurrentStep('exercises')}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Көнүгүүлөргө өтүү</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 'exercises' && (
            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckExercise}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                >
                  Текшерүү
                </button>
              ) : (
                <button
                  onClick={handleNextExercise}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>{exerciseIndex < lesson.exercises.length - 1 ? t.nextStep : 'Сүйлөө практикасы'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {currentStep === 'speaking' && (
            <button
              onClick={handleFinishLesson}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span>{t.finishLesson}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {currentStep === 'complete' && (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Жабуу
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
