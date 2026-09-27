import React, { useState, useEffect } from 'react';
import { UserProfile, TargetLanguage, LessonContent, VocabularyWord, UserAccount } from './types';
import { initialVocabulary } from './data/defaultVocabulary';
import { Navbar } from './components/Navbar';
import { TabsNavigation, AppTab } from './components/TabsNavigation';
import { LessonsView } from './components/LessonsView';
import { ChatTutor } from './components/ChatTutor';
import { PronunciationCoach } from './components/PronunciationCoach';
import { FlashcardsView } from './components/FlashcardsView';
import { ProgressView } from './components/ProgressView';
import { LessonModal } from './components/LessonModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { ProfileModal } from './components/ProfileModal';
import { CurriculumAdminView } from './components/CurriculumAdminView';
import { InstallPwaModal } from './components/InstallPwaModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { AuthModal } from './components/AuthModal';
import {
  getCurrentUser,
  syncUserProfile,
  markLessonCompleted,
  logoutUser,
} from './services/authService';

const STORAGE_KEY_VOCAB = 'bilim_ai_vocabulary_v2';

export default function App() {
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(() =>
    getCurrentUser()
  );

  const [profile, setProfile] = useState<UserProfile>(() => {
    const current = getCurrentUser();
    if (current && current.profile) return current.profile;
    return {
      name: 'Билим издеген окуучу',
      email: 'user@bilim.kg',
      targetLanguage: 'kyrgyz',
      uiLang: 'ky',
      level: 'Башталгыч (A1)',
      goalCategory: 'general',
      dailyGoalMinutes: 15,
      streakDays: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      xp: 120,
      completedLessons: ['ky-les-1-1'],
      diagnosticTaken: false,
      avatarSeed: 'avatar_1',
    };
  });

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOCAB);
      return saved ? JSON.parse(saved) : initialVocabulary;
    } catch {
      return initialVocabulary;
    }
  });

  const [currentTab, setCurrentTab] = useState<AppTab>('lessons');
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync vocabulary to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOCAB, JSON.stringify(vocabulary));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [vocabulary]);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      syncUserProfile(next);
      return next;
    });
  };

  const handleCompleteLesson = (lessonId: string, earnedXp: number) => {
    const updated = markLessonCompleted(lessonId, 100, earnedXp);
    if (updated) {
      setProfile(updated);
    } else {
      setProfile((prev) => {
        const alreadyCompleted = prev.completedLessons.includes(lessonId);
        const updatedLessons = alreadyCompleted
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId];

        const next = {
          ...prev,
          completedLessons: updatedLessons,
          xp: prev.xp + earnedXp,
        };
        syncUserProfile(next);
        return next;
      });
    }
  };

  const handleApplyDiagnostic = (determinedLevel: string, earnedXp: number) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        level: determinedLevel,
        diagnosticTaken: true,
        xp: prev.xp + earnedXp,
      };
      syncUserProfile(next);
      return next;
    });
  };

  const handleAuthSuccess = (account: UserAccount) => {
    setCurrentUserAccount(account);
    setProfile(account.profile);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserAccount(null);
    setIsAuthModalOpen(true);
  };

  const handleUpdateWordStatus = (wordId: string, status: 'learning' | 'mastered') => {
    setVocabulary((prev) =>
      prev.map((w) =>
        w.id === wordId
          ? {
              ...w,
              status,
              reviewCount: w.reviewCount + 1,
              lastReviewed: new Date().toISOString(),
            }
          : w
      )
    );
  };

  const handleAddCustomWord = (newWordData: Omit<VocabularyWord, 'id' | 'reviewCount'>) => {
    const newWord: VocabularyWord = {
      ...newWordData,
      id: 'custom-' + Date.now(),
      reviewCount: 0,
      lastReviewed: new Date().toISOString(),
    };
    setVocabulary((prev) => [newWord, ...prev]);
  };

  const handleResetProgress = () => {
    if (window.confirm('Бардык окуу прогрессин башынан баштоону каалайсызбы?')) {
      const resetProf: UserProfile = {
        ...profile,
        completedLessons: [],
        completedLessonRecords: [],
        xp: 0,
        streakDays: 1,
      };
      setProfile(resetProf);
      syncUserProfile(resetProf);
      setVocabulary(initialVocabulary);
      setIsProfileOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Global Navigation Bar */}
      <Navbar
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Primary Tabs Navigation */}
      <TabsNavigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        uiLang={profile.uiLang}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {currentTab === 'lessons' && (
          <LessonsView
            language={profile.targetLanguage}
            uiLang={profile.uiLang}
            profile={profile}
            onSelectLesson={(lesson) => setActiveLesson(lesson)}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
          />
        )}

        {currentTab === 'chat' && (
          <ChatTutor
            language={profile.targetLanguage}
            uiLang={profile.uiLang}
            userLevel={profile.level}
            userGoal={profile.goalCategory}
            onAddWordToVocab={(word, trans) => {
              handleAddCustomWord({
                word,
                translation: trans,
                language: profile.targetLanguage,
                category: 'custom',
                status: 'learning',
              });
            }}
          />
        )}

        {currentTab === 'pronounce' && (
          <PronunciationCoach
            language={profile.targetLanguage}
            uiLang={profile.uiLang}
          />
        )}

        {currentTab === 'vocab' && (
          <FlashcardsView
            vocabulary={vocabulary}
            language={profile.targetLanguage}
            uiLang={profile.uiLang}
            onUpdateWordStatus={handleUpdateWordStatus}
            onAddWord={handleAddCustomWord}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            profile={profile}
            vocabulary={vocabulary}
            uiLang={profile.uiLang}
            language={profile.targetLanguage}
          />
        )}

        {currentTab === 'diagnostic' && (
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-heading font-bold text-slate-900">
              Диагностикалык деңгээлди аныктоо тести
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ИИ репетитор сиздин билимиңизди текшерип, ылайыктуу окуу планын түзүп берет.
            </p>
            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              Тестти дароо баштоо
            </button>
          </div>
        )}

        {currentTab === 'curriculum' && (
          <CurriculumAdminView
            language={profile.targetLanguage}
            uiLang={profile.uiLang}
            onPreviewLesson={(lesson) => setActiveLesson(lesson)}
          />
        )}
      </main>

      {/* 4. Lesson Interactive Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          language={profile.targetLanguage}
          uiLang={profile.uiLang}
          onClose={() => setActiveLesson(null)}
          onCompleteLesson={handleCompleteLesson}
        />
      )}

      {/* 5. Diagnostic Placement Test Modal */}
      {isDiagnosticOpen && (
        <DiagnosticModal
          language={profile.targetLanguage}
          uiLang={profile.uiLang}
          userGoal={profile.goalCategory}
          onClose={() => setIsDiagnosticOpen(false)}
          onApplyResults={handleApplyDiagnostic}
        />
      )}

      {/* 6. Profile & Settings Modal */}
      {isProfileOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleUpdateProfile}
          onResetProgress={handleResetProgress}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 7. Install PWA on Phone Modal */}
      {isInstallPwaOpen && (
        <InstallPwaModal
          uiLang={profile.uiLang}
          onClose={() => setIsInstallPwaOpen(false)}
        />
      )}

      {/* 8. Voice Settings Modal */}
      {isVoiceModalOpen && (
        <VoiceSettingsModal
          language={profile.targetLanguage}
          uiLang={profile.uiLang}
          onClose={() => setIsVoiceModalOpen(false)}
        />
      )}

      {/* 9. User Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Clean quiet footer */}
      <footer className="py-4 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400">
        <p>БилимAI — ИИ-репетитор по кыргызскому и английскому языкам · 2026</p>
      </footer>
    </div>
  );
}
