import React, { useState } from 'react';
import { UserProfile, GoalCategory } from '../types';
import { translations } from '../data/translations';
import { kyrgyzCurriculum } from '../data/kyrgyzCurriculum';
import { englishCurriculum } from '../data/englishCurriculum';
import {
  X,
  User,
  RotateCcw,
  CheckCircle2,
  Mail,
  Award,
  BookOpen,
  Calendar,
  LogOut,
  UserPlus,
  Flame,
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
  onResetProgress: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onSave,
  onResetProgress,
  onOpenAuth,
  onLogout,
}) => {
  const t = translations[profile.uiLang] || translations.ky;

  const [activeTab, setActiveTab] = useState<'profile' | 'completedLessons' | 'settings'>('profile');
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState(profile.level);
  const [goal, setGoal] = useState<GoalCategory>(profile.goalCategory);
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyGoalMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'Ученик',
      level,
      goalCategory: goal,
      dailyGoalMinutes: dailyMinutes,
    });
    onClose();
  };

  const kyrgyzLevels = ['С нуля', 'Башталгыч (A1)', 'Орто (A2-B1)', 'Жогорку (B2+)'];
  const englishLevels = [
    'A1 Beginner',
    'A2 Elementary',
    'B1 Intermediate',
    'B2 Upper-Intermediate',
    'C1 Advanced',
  ];

  const currentLevels = profile.targetLanguage === 'kyrgyz' ? kyrgyzLevels : englishLevels;

  // Find all lessons metadata
  const allCurriculum =
    profile.targetLanguage === 'kyrgyz' ? kyrgyzCurriculum : englishCurriculum;

  const allLessonsMap = new Map<string, { title: string; moduleTitle: string; difficulty: string }>();
  allCurriculum.forEach((m) => {
    m.lessons.forEach((l) => {
      allLessonsMap.set(l.id, {
        title: l.title,
        moduleTitle: m.title,
        difficulty: l.difficulty,
      });
    });
  });

  const totalLessonsCount = allCurriculum.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = profile.completedLessons?.length || 0;
  const progressPercent = Math.min(100, Math.round((completedCount / (totalLessonsCount || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center font-heading font-extrabold text-base shadow-xs">
              {profile.name?.slice(0, 1).toUpperCase() || 'Б'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                {profile.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{profile.email || 'nurlan@bilim.kg'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Профиль & Деңгээл
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completedLessons')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'completedLessons'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Өткөн сабактар</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
              {completedCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Жөндөөлөр
          </button>
        </div>

        {/* Tab 1: Profile & Level */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Level Card */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-indigo-50/40 rounded-2xl border border-amber-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Учурдагы деңгээлиңиз:
                </span>
                <h3 className="text-lg font-heading font-extrabold text-slate-900 mt-0.5">
                  {profile.level}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Тил багыты: {profile.targetLanguage === 'kyrgyz' ? '🇰🇬 Кыргыз тили' : '🇬🇧 English'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-heading font-bold text-sm border border-amber-300">
                {profile.level.split(' ')[0] || 'A1'}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <BookOpen className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="text-base font-heading font-bold text-slate-900">
                  {completedCount}/{totalLessonsCount}
                </div>
                <div className="text-[10px] text-slate-500">Сабак өттү</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <Flame className="w-4 h-4 text-amber-600 mx-auto mb-1 fill-amber-500" />
                <div className="text-base font-heading font-bold text-slate-900">
                  {profile.streakDays} күн
                </div>
                <div className="text-[10px] text-slate-500">Үзгүлтүксүз</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <Award className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <div className="text-base font-heading font-bold text-slate-900">
                  {profile.xp} XP
                </div>
                <div className="text-[10px] text-slate-500">Упайлар</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Окуу программасынын бүтүшү:</span>
                <span className="font-bold text-slate-900">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Account Switcher Bar */}
            <div className="p-3 bg-slate-100/70 rounded-2xl flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Башка email же аккаунт менен кирүү:
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition flex items-center gap-1 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>Катталуу / Кирүү</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Completed Lessons List */}
        {activeTab === 'completedLessons' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {profile.completedLessons && profile.completedLessons.length > 0 ? (
              profile.completedLessons.map((lesId) => {
                const info = allLessonsMap.get(lesId);
                const record = profile.completedLessonRecords?.find((r) => r.lessonId === lesId);

                return (
                  <div
                    key={lesId}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-heading font-bold text-slate-900 truncate">
                          {info ? info.title : lesId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-6 truncate">
                        {info ? info.moduleTitle : 'Модуль'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        {record ? `${record.score}%` : 'Өтүлдү'}
                      </span>
                      {record && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {record.completedAt}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Сиз али сабак бүтүрө элексиз.</p>
                <p className="text-[11px] text-slate-400">
                  Сабактар бөлүмүн ачып, биринчи сабакты окуп баштаңыз!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Settings Form */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Аты-жөнүңүз:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="Сиздин атыңыз"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Окуу максатыңыз:
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="general">Күнүмдүк эркин сүйлөшүү (Everyday Fluency)</option>
                <option value="civil_service">Мамлекеттик кызмат жана иш кагаздары (Civil Service)</option>
                <option value="work">Жумуш жана эл аралык долбоорлор (Career / Business)</option>
                <option value="travel">Саякат жана туризм (Travel / Tourism)</option>
                <option value="exam">Сынакка даярдануу (Exams / Certification)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Деңгээлди өзгөртүү:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {currentLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Күндөлүк максат:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((min) => (
                  <button
                    type="button"
                    key={min}
                    onClick={() => setDailyMinutes(min)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition ${
                      dailyMinutes === min
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {min} мин
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onResetProgress}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Прогрессти башынан баштоо</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 shadow-xs"
              >
                Сактоо
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Чыгуу (Выйти)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 shadow-xs"
          >
            Жабуу
          </button>
        </div>
      </div>
    </div>
  );
};
