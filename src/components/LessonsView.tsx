import React from 'react';
import { TargetLanguage, UILanguage, UserProfile, LessonContent } from '../types';
import { translations } from '../data/translations';
import { kyrgyzCurriculum } from '../data/kyrgyzCurriculum';
import { englishCurriculum } from '../data/englishCurriculum';
import {
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

interface LessonsViewProps {
  language: TargetLanguage;
  uiLang: UILanguage;
  profile: UserProfile;
  onSelectLesson: (lesson: LessonContent) => void;
  onOpenDiagnostic: () => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  language,
  uiLang,
  profile,
  onSelectLesson,
  onOpenDiagnostic,
}) => {
  const t = translations[uiLang] || translations.ky;
  const modules = language === 'kyrgyz' ? kyrgyzCurriculum : englishCurriculum;

  // Calculate completion stats
  const allLessons = modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) =>
    profile.completedLessons.includes(l.id)
  ).length;
  const progressPct = Math.round((completedCount / Math.max(allLessons.length, 1)) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Learning Progress Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              {language === 'kyrgyz' ? 'Кыргыз тилин өздөштүрүү' : 'English Fluency Program'}
            </span>
            <span className="text-xs text-slate-300">
              Деңгээл: <strong className="text-white">{profile.level}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            {language === 'kyrgyz'
              ? 'Кыргыз тилинде эркин жана ишенимдүү сүйлөңүз'
              : 'Speak English with Confidence & Clarity'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'kyrgyz'
              ? 'ИИ-репетитор менен күнүнө 10-15 мүнөт машыгып, сүйлөө тоскоолдугун жеңиңиз жана өзгөчө тыбыштарды туура айтууну үйрөнүңүз.'
              : 'Interactive micro-lessons with AI pronunciation scoring and personalized grammar drills tailored to your goals.'}
          </p>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
              <span>{t.completedToday}</span>
              <span className="tabular-nums font-mono text-amber-400">
                {completedCount} / {allLessons.length} сабак ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Diagnostic prompt if not taken yet */}
        {!profile.diagnosticTaken && (
          <div className="mt-6 pt-4 border-t border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>{t.diagnosticPrompt}</span>
            </div>
            <button
              onClick={onOpenDiagnostic}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              {t.takeDiagnostic}
            </button>
          </div>
        )}
      </div>

      {/* Curriculum Modules & Lessons */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-slate-900">
            {t.allLessons}
          </h3>
          <span className="text-xs text-slate-500">
            {modules.length} модуль · {allLessons.length} сабак
          </span>
        </div>

        <div className="space-y-6">
          {modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Module Header */}
              <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Модуль {modIdx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                      {mod.level}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-slate-900 mt-0.5">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.titleTranslation}</p>
                </div>
              </div>

              {/* Lesson Items */}
              <div className="divide-y divide-slate-100">
                {mod.lessons.map((lesson) => {
                  const isCompleted = profile.completedLessons.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-heading font-semibold text-sm sm:text-base text-slate-900 truncate">
                              {lesson.title}
                            </h5>
                            {isCompleted && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                {t.lessonCompleted}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {lesson.titleTranslation}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{lesson.durationMinutes} мин</span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span className="truncate max-w-[200px]">{lesson.grammarFocus}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectLesson(lesson)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        <span>{isCompleted ? t.lessonReview : t.lessonStart}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
