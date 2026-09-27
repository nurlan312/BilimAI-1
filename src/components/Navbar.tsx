import React from 'react';
import { TargetLanguage, UILanguage, UserProfile } from '../types';
import { translations } from '../data/translations';
import { Flame, Award, Globe, User, BookOpen, Smartphone, Volume2 } from 'lucide-react';

interface NavbarProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenProfile: () => void;
  onOpenDiagnostic: () => void;
  onOpenInstallPwa?: () => void;
  onOpenVoiceSettings?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onUpdateProfile,
  onOpenProfile,
  onOpenDiagnostic,
  onOpenInstallPwa,
  onOpenVoiceSettings,
  onOpenAuth,
}) => {
  const t = translations[profile.uiLang] || translations.ky;

  const handleLanguageToggle = (lang: TargetLanguage) => {
    onUpdateProfile({ targetLanguage: lang });
  };

  const handleUILangChange = (lang: UILanguage) => {
    onUpdateProfile({ uiLang: lang });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 font-heading font-extrabold text-xl tracking-tight">
            Б
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                {t.appTitle}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded">
                AI Tutor 2.0
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 truncate max-w-xs">
              {profile.targetLanguage === 'kyrgyz' ? 'Кыргыз тилин үйрөнүү' : 'Learning English'}
            </p>
          </div>
        </div>

        {/* Center Target Language Selector */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shrink-0">
          <button
            onClick={() => handleLanguageToggle('kyrgyz')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 ${
              profile.targetLanguage === 'kyrgyz'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-base">🇰🇬</span>
            <span className="hidden sm:inline">Кыргыз тили</span>
            <span className="sm:hidden text-xs">КЫР</span>
          </button>
          <button
            onClick={() => handleLanguageToggle('english')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 ${
              profile.targetLanguage === 'english'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-base">🇬🇧</span>
            <span className="hidden sm:inline">English</span>
            <span className="sm:hidden text-xs">ENG</span>
          </button>
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Daily Streak */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-amber-50/90 border border-amber-200/60 rounded-xl text-amber-700 text-xs sm:text-sm font-semibold tabular-nums"
            title={`${profile.streakDays} ${t.streak}`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-amber-500 animate-pulse" />
            <span>{profile.streakDays}</span>
          </div>

          {/* XP Score */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-indigo-50/90 border border-indigo-200/60 rounded-xl text-indigo-700 text-xs sm:text-sm font-semibold tabular-nums"
            title={`${profile.xp} ${t.xp}`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            <span>{profile.xp}<span className="hidden sm:inline"> XP</span></span>
          </div>

          {/* Diagnostic test quick prompt */}
          {!profile.diagnosticTaken && (
            <button
              onClick={onOpenDiagnostic}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.takeDiagnostic}</span>
            </button>
          )}

          {/* UI Language Switcher */}
          <div className="relative flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
            <select
              value={profile.uiLang}
              onChange={(e) => handleUILangChange(e.target.value as UILanguage)}
              className="bg-transparent text-xs font-medium text-slate-700 py-1 pl-1 pr-2 rounded focus:outline-none cursor-pointer"
              aria-label="Select UI language"
            >
              <option value="ky">КЫР</option>
              <option value="ru">РУС</option>
              <option value="en">ENG</option>
            </select>
          </div>

          {/* Voice Settings Button */}
          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition"
              title="ИИ-репетитордун үнүн тандоо (Kore, Puck, Zephyr)"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Үн тандоо</span>
            </button>
          )}

          {/* Install on phone button */}
          {onOpenInstallPwa && (
            <button
              onClick={onOpenInstallPwa}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold transition"
              title="Телефонго тиркеме катары орнотуу же QR-код"
            >
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Телефонго орнотуу</span>
            </button>
          )}

          {/* User Profile & Account */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition text-xs font-semibold"
            title={t.profileTitle}
          >
            <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
              {profile.name?.slice(0, 1).toUpperCase() || 'Б'}
            </div>
            <span className="hidden sm:inline truncate max-w-[85px]">
              {profile.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
