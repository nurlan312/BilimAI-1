import React from 'react';
import { translations } from '../data/translations';
import { UILanguage } from '../types';
import {
  BookOpen,
  MessageSquareQuote,
  Mic,
  Layers,
  TrendingUp,
  GraduationCap,
  Compass,
} from 'lucide-react';

export type AppTab =
  | 'lessons'
  | 'chat'
  | 'pronounce'
  | 'vocab'
  | 'progress'
  | 'diagnostic'
  | 'curriculum';

interface TabsNavigationProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  uiLang: UILanguage;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  currentTab,
  onSelectTab,
  uiLang,
}) => {
  const t = translations[uiLang] || translations.ky;

  const navItems = [
    { id: 'lessons' as AppTab, label: t.navLessons, icon: BookOpen },
    { id: 'chat' as AppTab, label: t.navChat, icon: MessageSquareQuote },
    { id: 'pronounce' as AppTab, label: t.navPronounce, icon: Mic },
    { id: 'vocab' as AppTab, label: t.navVocab, icon: Layers },
    { id: 'progress' as AppTab, label: t.navProgress, icon: TrendingUp },
    { id: 'diagnostic' as AppTab, label: t.navDiagnostic, icon: GraduationCap },
    { id: 'curriculum' as AppTab, label: t.navAdmin, icon: Compass },
  ];

  return (
    <>
      {/* Top Tabs for all devices with horizontal scroll */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-slate-200" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Fixed Native-like Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-lg transition-all ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-amber-100/80 text-amber-700' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
