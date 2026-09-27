import React, { useState } from 'react';
import { TargetLanguage, UILanguage, DiagnosticResult } from '../types';
import { translations } from '../data/translations';
import { kyrgyzDiagnosticQuestions, englishDiagnosticQuestions } from '../data/diagnosticTests';
import { evaluateDiagnostic } from '../services/geminiService';
import {
  X,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Target,
  Award,
} from 'lucide-react';

interface DiagnosticModalProps {
  language: TargetLanguage;
  uiLang: UILanguage;
  userGoal: string;
  onClose: () => void;
  onApplyResults: (level: string, earnedXp: number) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  language,
  uiLang,
  userGoal,
  onClose,
  onApplyResults,
}) => {
  const t = translations[uiLang] || translations.ky;
  const questions = language === 'kyrgyz' ? kyrgyzDiagnosticQuestions : englishDiagnosticQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  >([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [resultReport, setResultReport] = useState<DiagnosticResult | null>(null);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    setSelectedOpt(idx);
  };

  const handleNextQuestion = async () => {
    if (selectedOpt === null) return;

    const isCorrect = selectedOpt === currentQ.correctIndex;
    const updatedAnswers = [
      ...userAnswers,
      {
        questionId: currentQ.id,
        selectedIndex: selectedOpt,
        isCorrect,
      },
    ];
    setUserAnswers(updatedAnswers);
    setSelectedOpt(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all diagnostic questions! Call Gemini for deep evaluation
      setIsEvaluating(true);
      try {
        const report = await evaluateDiagnostic({
          language,
          answers: updatedAnswers,
          userGoal,
        });
        setResultReport(report);
      } catch (err) {
        console.error(err);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleFinish = () => {
    if (resultReport) {
      onApplyResults(resultReport.determinedLevel, 100);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                {language === 'kyrgyz' ? 'Кыргыз тили: Входной тест' : 'English Placement Test'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'kyrgyz'
                  ? 'Баштапкы деңгээлиңизди так аныктап, жеке окуу планын түзөбүз'
                  : 'Assess your level and generate a personalized curriculum'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic In Progress */}
        {!resultReport && !isEvaluating && currentQ && (
          <div className="space-y-5">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>
                  Суроо {currentIndex + 1} / {questions.length}
                </span>
                <span>{currentQ.levelIndicator}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Категория: {currentQ.category}
              </span>
              <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-xl border text-sm text-left transition flex items-center justify-between ${
                    selectedOpt === idx
                      ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>

            {/* Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={selectedOpt === null}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <span>{currentIndex < questions.length - 1 ? t.nextStep : 'Жыйынтыктоо'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading evaluation */}
        {isEvaluating && (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <h4 className="font-heading font-bold text-slate-800">
              ИИ деңгээлиңизди жана жеке планыңызды эсептеп жатат...
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Грамматика, лексика жана түшүнүү тактыгын талдап жатабыз.
            </p>
          </div>
        )}

        {/* Results Screen */}
        {resultReport && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Аныкталган деңгээл:
                </div>
                <div className="text-2xl font-heading font-extrabold text-emerald-950 mt-0.5">
                  {resultReport.determinedLevel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-700 font-semibold">Жалпы балл:</div>
                <div className="text-2xl font-heading font-extrabold text-emerald-700 tabular-nums">
                  {resultReport.overallScore}%
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {resultReport.analysis}
            </p>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Күчтүү жактарыңыз:
                </span>
                <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                  {resultReport.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  Көңүл буруу керек болгон темалар:
                </span>
                <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                  {resultReport.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Curriculum Roadmap */}
            {resultReport.recommendedPlan?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ИИ тарабынан сунушталган окуу траекториясы:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resultReport.recommendedPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs"
                    >
                      <div className="font-bold text-slate-900">{step.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Деңгээлди сактоо жана сабактарга өтүү (+100 XP)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
