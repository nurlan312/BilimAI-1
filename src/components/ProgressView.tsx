import React from 'react';
import { TargetLanguage, UILanguage, UserProfile, VocabularyWord } from '../types';
import { translations } from '../data/translations';
import {
  Flame,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface ProgressViewProps {
  profile: UserProfile;
  vocabulary: VocabularyWord[];
  uiLang: UILanguage;
  language: TargetLanguage;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  vocabulary,
  uiLang,
  language,
}) => {
  const t = translations[uiLang] || translations.ky;

  const currentLangVocab = vocabulary.filter((v) => v.language === language);
  const masteredWords = currentLangVocab.filter((v) => v.status === 'mastered').length;

  const achievements = [
    {
      id: 'ach-1',
      title: 'Биринчи кадам (Первый шаг)',
      desc: 'Биринчи интерактивдүү сабакты аяктаңыз',
      icon: '🌱',
      unlocked: profile.completedLessons.length >= 1,
      progress: Math.min(profile.completedLessons.length, 1),
      max: 1,
    },
    {
      id: 'ach-2',
      title: 'Манасчынын шакирти (Мастер речи)',
      desc: 'Айтылыш боюнча 80+ балл алыңыз',
      icon: '🦅',
      unlocked: profile.xp >= 100,
      progress: Math.min(profile.xp, 100),
      max: 100,
    },
    {
      id: 'ach-3',
      title: 'Сөздүк чебери (Словарный запас)',
      desc: '5 сөздү толук өздөштүрүңүз',
      icon: '📚',
      unlocked: masteredWords >= 5,
      progress: Math.min(masteredWords, 5),
      max: 5,
    },
    {
      id: 'ach-4',
      title: 'Күн сайын прогресс (Стрик 3 күн)',
      desc: '3 күн катары менен машыгыңыз',
      icon: '🔥',
      unlocked: profile.streakDays >= 3,
      progress: Math.min(profile.streakDays, 3),
      max: 3,
    },
    {
      id: 'ach-5',
      title: 'Эркин баарлашуучу (Bilingual)',
      desc: 'ИИ Ментор менен 5 диалог өткөрүңүз',
      icon: '🌟',
      unlocked: profile.xp >= 200,
      progress: Math.min(profile.xp, 200),
      max: 200,
    }
  ];

  const weekDays = [
    { day: 'Дш (Mon)', active: true, min: 15 },
    { day: 'Шш (Tue)', active: true, min: 20 },
    { day: 'Шр (Wed)', active: true, min: 10 },
    { day: 'Бш (Thu)', active: true, min: 25 },
    { day: 'Жм (Fri)', active: true, min: 15 },
    { day: 'Иш (Sat)', active: false, min: 0 },
    { day: 'Жш (Sun)', active: false, min: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Level & XP Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Деңгээл: {profile.level}
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-slate-900 mt-1">
            {profile.name}
          </h2>
          <p className="text-xs text-slate-500">
            Максат: <span className="font-semibold text-slate-700">{profile.goalCategory}</span> · Күнүнө {profile.dailyGoalMinutes} мүнөт
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-center">
            <Flame className="w-5 h-5 text-amber-600 fill-amber-500 mx-auto" />
            <div className="text-base font-bold text-amber-900 tabular-nums mt-0.5">
              {profile.streakDays} күн
            </div>
            <div className="text-[10px] text-amber-700 font-medium">Стрик сериясы</div>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200/80 text-center">
            <Award className="w-5 h-5 text-indigo-600 mx-auto" />
            <div className="text-base font-bold text-indigo-900 tabular-nums mt-0.5">
              {profile.xp} XP
            </div>
            <div className="text-[10px] text-indigo-700 font-medium">Жалпы тажрыйба</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <BookOpen className="w-4 h-4 text-emerald-600 mb-1" />
          <div className="text-xl font-heading font-bold text-slate-900 tabular-nums">
            {profile.completedLessons.length}
          </div>
          <div className="text-xs text-slate-500">Өздөштүрүлгөн сабактар</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
          <div className="text-xl font-heading font-bold text-slate-900 tabular-nums">
            {currentLangVocab.length}
          </div>
          <div className="text-xs text-slate-500">Сөздүктөгү сөздөр</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <Trophy className="w-4 h-4 text-indigo-500 mb-1" />
          <div className="text-xl font-heading font-bold text-slate-900 tabular-nums">
            {masteredWords}
          </div>
          <div className="text-xs text-slate-500">Эсте калган сөздөр</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <Clock className="w-4 h-4 text-slate-600 mb-1" />
          <div className="text-xl font-heading font-bold text-slate-900 tabular-nums">
            {profile.completedLessons.length * 10} мин
          </div>
          <div className="text-xs text-slate-500">Окуу убактысы</div>
        </div>
      </div>

      {/* Weekly Activity Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Апталык активдүүлүк</span>
          </h3>
          <span className="text-xs text-slate-400">Бул апта</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {weekDays.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition ${
                item.active
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
                  : 'bg-slate-50 border-slate-200/70 text-slate-400'
              }`}
            >
              <div className="text-[11px]">{item.day}</div>
              <div className="text-xs mt-1 tabular-nums">
                {item.min > 0 ? `${item.min} м` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamification Achievements */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-heading font-bold text-slate-900">
          Сыйлыктар жана жетишкендиктер:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex items-start gap-3 transition ${
                ach.unlocked
                  ? 'bg-white border-amber-200/80 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-2xl shrink-0 p-1 bg-slate-100 rounded-lg">{ach.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-semibold text-xs text-slate-900 truncate">
                    {ach.title}
                  </h4>
                  {ach.unlocked && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Ачылды
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{ach.desc}</p>

                {/* Progress mini bar */}
                <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(ach.progress / ach.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
