import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService';
import { TargetLanguage, UserAccount } from '../types';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (account: UserAccount) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('kyrgyz');
  const [level, setLevel] = useState('Башталгыч (A1)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Туура email дарегин жазыңыз (мисалы: user@gmail.com).');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Аты-жөнүңүздү жазыңыз.');
        return;
      }
      if (password.length < 4) {
        setError('Сыр сөз 4 символдон кем болбошу керек.');
        return;
      }

      const res = registerUser({
        email,
        name,
        password,
        targetLanguage: targetLang,
        level,
      });

      if (res.success && res.account) {
        onAuthSuccess(res.account);
        onClose();
      } else {
        setError(res.error || 'Катталууда ката кетти');
      }
    } else {
      const res = loginUser(email, password);
      if (res.success && res.account) {
        onAuthSuccess(res.account);
        onClose();
      } else {
        setError(res.error || 'Кирүүдө ката кетти');
      }
    }
  };

  const handleDemoLogin = () => {
    const res = loginUser('nurlan@bilim.kg', 'password123');
    if (res.success && res.account) {
      onAuthSuccess(res.account);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              {mode === 'register' ? (
                <UserPlus className="w-5 h-5 text-amber-400" />
              ) : (
                <LogIn className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                {mode === 'register' ? 'Жаңы аккаунт ачуу' : 'Аккаунтка кирүү'}
              </h2>
              <p className="text-xs text-slate-500">
                Сабактардын жана деңгээлиңиздин сакталышы үчүн
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Катталуу (Регистрация)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Кирүү (Вход)
          </button>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Аты-жөнүңүз (Имя)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Мисалы: Азамат же Айсулуу"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Электрондук почта (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="сиздин.почта@gmail.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Сыр сөз (Пароль)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Тил багыты:
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                >
                  <option value="kyrgyz">🇰🇬 Кыргыз тили</option>
                  <option value="english">🇬🇧 English</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Учурдагы деңгээл:
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                >
                  <option value="Башталгыч (A1)">Башталгыч (A1)</option>
                  <option value="Орто (A2-B1)">Орто (A2-B1)</option>
                  <option value="Жогорку (B2+)">Жогорку (B2+)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{mode === 'register' ? 'Катталуу жана баштоо' : 'Кирүү'}</span>
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Дароо сынап көрүү үчүн:
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <span>«Нурлан» даяр аккаунту менен кирүү</span>
          </button>
        </div>
      </div>
    </div>
  );
};
