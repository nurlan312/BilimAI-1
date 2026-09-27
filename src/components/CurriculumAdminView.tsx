import React, { useState } from 'react';
import { TargetLanguage, UILanguage, LessonContent } from '../types';
import { kyrgyzCurriculum } from '../data/kyrgyzCurriculum';
import { englishCurriculum } from '../data/englishCurriculum';
import {
  Compass,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface CurriculumAdminViewProps {
  language: TargetLanguage;
  uiLang: UILanguage;
  onPreviewLesson: (lesson: LessonContent) => void;
}

export const CurriculumAdminView: React.FC<CurriculumAdminViewProps> = ({
  language,
  onPreviewLesson,
}) => {
  const [selectedLang, setSelectedLang] = useState<TargetLanguage>(language);
  const modules = selectedLang === 'kyrgyz' ? kyrgyzCurriculum : englishCurriculum;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-heading font-bold text-slate-900">
              Окуу программасынын түзүмү жана Методикалык план
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Кыргыз жана англис тилдеринин компетенциялары, модулдары, көнүгүүлөр топтому жана деңгээлдери.
          </p>
        </div>

        {/* Language switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setSelectedLang('kyrgyz')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedLang === 'kyrgyz'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇰🇬 Кыргыз тили
          </button>
          <button
            onClick={() => setSelectedLang('english')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedLang === 'english'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Curriculum Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Жалпы модулдар</span>
          <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
            {modules.length} Модуль
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Тематикалык блоктор</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Жалпы сабактар</span>
          <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
            {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Сабак
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Интерактивдүү материалдар</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase">Көнүгүүлөр банкы</span>
          <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
            {modules.reduce(
              (acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + l.exercises.length, 0),
              0
            )}{' '}
            Көнүгүү
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Тесттер, сөздүк, сүйлөө</p>
        </div>
      </div>

      {/* Modules Detailed Breakdown */}
      <div className="space-y-4">
        {modules.map((mod, modIdx) => (
          <div
            key={mod.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Бөлүм {modIdx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    {mod.level}
                  </span>
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900 mt-1">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500">{mod.description}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {mod.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-semibold text-sm text-slate-900 truncate">
                        {lesson.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500">{lesson.difficulty}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{lesson.summary}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{lesson.durationMinutes} мүнөт</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{lesson.exercises.length} көнүгүү</span>
                      </span>
                      <span>·</span>
                      <span className="text-amber-700 font-medium">
                        Фокус: {lesson.grammarFocus}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onPreviewLesson(lesson)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <span>Ачуу</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
