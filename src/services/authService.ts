import { UserAccount, UserProfile } from '../types';

const STORAGE_ACCOUNTS_KEY = 'bilim_ai_auth_accounts_v1';
const STORAGE_CURRENT_USER_KEY = 'bilim_ai_auth_current_user_v1';

const defaultDemoProfile: UserProfile = {
  name: 'Нурлан Аманов',
  email: 'nurlan@bilim.kg',
  targetLanguage: 'kyrgyz',
  uiLang: 'ky',
  level: 'Башталгыч (A1)',
  goalCategory: 'general',
  dailyGoalMinutes: 15,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  xp: 180,
  completedLessons: ['ky-les-1-1', 'ky-les-1-2'],
  completedLessonRecords: [
    {
      lessonId: 'ky-les-1-1',
      completedAt: '2026-09-24',
      score: 100,
      xpEarned: 50,
    },
    {
      lessonId: 'ky-les-1-2',
      completedAt: '2026-09-25',
      score: 90,
      xpEarned: 45,
    },
  ],
  diagnosticTaken: true,
  avatarSeed: 'avatar_1',
  registeredAt: '2026-09-20',
};

const defaultDemoAccount: UserAccount = {
  id: 'usr_demo_1',
  email: 'nurlan@bilim.kg',
  name: 'Нурлан Аманов',
  password: 'password123',
  createdAt: '2026-09-20',
  profile: defaultDemoProfile,
};

// Initialize DB with demo account if empty
function getStoredAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return [defaultDemoAccount];
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify([defaultDemoAccount]));
      return [defaultDemoAccount];
    }
    return JSON.parse(raw);
  } catch {
    return [defaultDemoAccount];
  }
}

function saveAccounts(accounts: UserAccount[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

// Get currently authenticated user
export function getCurrentUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) {
      // Default to demo account if nothing selected yet
      const accounts = getStoredAccounts();
      const first = accounts[0] || defaultDemoAccount;
      setCurrentUser(first);
      return first;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(account: UserAccount | null) {
  if (typeof window !== 'undefined') {
    if (account) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  }
}

// Register a new user
export function registerUser(params: {
  email: string;
  name: string;
  password?: string;
  targetLanguage?: 'kyrgyz' | 'english';
  level?: string;
}): { success: boolean; error?: string; account?: UserAccount } {
  const accounts = getStoredAccounts();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'Бул email менен колдонуучу катталган. Кирүүнү колдонуңуз же башка email жазыңыз.' };
  }

  const newProfile: UserProfile = {
    name: params.name.trim() || 'Жаңы окуучу',
    email: normalizedEmail,
    targetLanguage: params.targetLanguage || 'kyrgyz',
    uiLang: 'ky',
    level: params.level || 'Башталгыч (A1)',
    goalCategory: 'general',
    dailyGoalMinutes: 15,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    xp: 20,
    completedLessons: [],
    completedLessonRecords: [],
    diagnosticTaken: false,
    avatarSeed: `avatar_${(accounts.length % 5) + 1}`,
    registeredAt: new Date().toISOString().split('T')[0],
  };

  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    name: params.name.trim() || 'Жаңы окуучу',
    password: params.password || 'password123',
    createdAt: new Date().toISOString().split('T')[0],
    profile: newProfile,
  };

  accounts.push(newAccount);
  saveAccounts(accounts);
  setCurrentUser(newAccount);

  return { success: true, account: newAccount };
}

// Login with email
export function loginUser(
  email: string,
  password?: string
): { success: boolean; error?: string; account?: UserAccount } {
  const accounts = getStoredAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  const found = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);
  if (!found) {
    return { success: false, error: 'Бул email менен колдонуучу табылган жок. Катталууну тандаңыз.' };
  }

  if (password && found.password && found.password !== password) {
    return { success: false, error: 'Сыр сөз туура эмес.' };
  }

  setCurrentUser(found);
  return { success: true, account: found };
}

// Save active user profile updates
export function syncUserProfile(updatedProfile: UserProfile): UserAccount | null {
  const current = getCurrentUser();
  if (!current) return null;

  const accounts = getStoredAccounts();
  const index = accounts.findIndex((acc) => acc.id === current.id);

  const updatedAccount: UserAccount = {
    ...current,
    name: updatedProfile.name,
    profile: updatedProfile,
  };

  if (index >= 0) {
    accounts[index] = updatedAccount;
    saveAccounts(accounts);
  }

  setCurrentUser(updatedAccount);
  return updatedAccount;
}

// Record completed lesson for the current user
export function markLessonCompleted(
  lessonId: string,
  score: number = 100,
  xpEarned: number = 30
): UserProfile | null {
  const current = getCurrentUser();
  if (!current) return null;

  const existingCompleted = current.profile.completedLessons || [];
  const existingRecords = current.profile.completedLessonRecords || [];

  const isNewLesson = !existingCompleted.includes(lessonId);
  const updatedCompleted = isNewLesson ? [...existingCompleted, lessonId] : existingCompleted;

  const newRecord = {
    lessonId,
    completedAt: new Date().toISOString().split('T')[0],
    score,
    xpEarned,
  };

  const updatedProfile: UserProfile = {
    ...current.profile,
    completedLessons: updatedCompleted,
    completedLessonRecords: [newRecord, ...existingRecords.filter((r) => r.lessonId !== lessonId)],
    xp: current.profile.xp + (isNewLesson ? xpEarned : Math.round(xpEarned / 3)),
    streakDays: Math.max(1, current.profile.streakDays),
    lastActiveDate: new Date().toISOString().split('T')[0],
  };

  syncUserProfile(updatedProfile);
  return updatedProfile;
}

// Logout
export function logoutUser() {
  setCurrentUser(null);
}
