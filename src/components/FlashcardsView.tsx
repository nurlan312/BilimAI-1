import React, { useState } from 'react';
import { TargetLanguage, UILanguage, VocabularyWord } from '../types';
import { translations } from '../data/translations';
import { speakText } from '../services/speechService';
import {
  Volume2,
  RotateCw,
  Plus,
  Check,
  Search,
  Sparkles,
  BookMarked,
  X,
} from 'lucide-react';

interface FlashcardsViewProps {
  vocabulary: VocabularyWord[];
  language: TargetLanguage;
  uiLang: UILanguage;
  onUpdateWordStatus: (wordId: string, status: 'learning' | 'mastered') => void;
  onAddWord: (word: Omit<VocabularyWord, 'id' | 'reviewCount'>) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  vocabulary,
  language,
  uiLang,
  onUpdateWordStatus,
  onAddWord,
}) => {
  const t = translations[uiLang] || translations.ky;

  const currentWords = vocabulary.filter((v) => v.language === language);
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New word form
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newContextTranslation, setNewContextTranslation] = useState('');

  const filteredWords = currentWords.filter((w) => {
    const matchesFilter = filter === 'all' || w.status === filter;
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCard = filteredWords[currentCardIndex % (filteredWords.length || 1)];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % Math.max(filteredWords.length, 1));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === 0 ? Math.max(filteredWords.length - 1, 0) : prev - 1
    );
  };

  const handlePlayVoice = (text: string) => {
    speakText(text, language);
  };

  const handleCardAction = (status: 'learning' | 'mastered') => {
    if (activeCard) {
      onUpdateWordStatus(activeCard.id, status);
      handleNextCard();
    }
  };

  const handleSaveNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newTranslation.trim()) return;

    onAddWord({
      language,
      word: newWord.trim(),
      translation: newTranslation.trim(),
      contextSentence: newContext.trim() || `${newWord.trim()} — пайдалуу сөз.`,
      contextTranslation: newContextTranslation.trim() || `${newTranslation.trim()}`,
      status: 'learning',
      category: 'Колдонуучунун сөздүгү',
    });

    setNewWord('');
    setNewTranslation('');
    setNewContext('');
    setNewContextTranslation('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Title and Add Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-slate-900">
            {t.vocabTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t.vocabSubtitle}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addWord}</span>
        </button>
      </div>

      {/* Interactive Flashcard Stage */}
      {filteredWords.length > 0 && activeCard ? (
        <div className="space-y-4">
          <div className="perspective-1000 w-full max-w-lg mx-auto h-72 sm:h-80 cursor-pointer select-none">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d shadow-md border border-slate-200 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-b from-white to-slate-50/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                    {activeCard.category}
                  </span>
                  <span>
                    {currentCardIndex + 1} / {filteredWords.length}
                  </span>
                </div>

                <div className="space-y-2 my-auto">
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
                    {activeCard.word}
                  </h3>
                  {activeCard.transcription && (
                    <div className="text-xs font-mono text-slate-400">
                      {activeCard.transcription}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoice(activeCard.word);
                    }}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center mx-auto transition"
                  >
                    <Volume2 className="w-5 h-5 text-amber-600" />
                  </button>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{t.flipCard}</span>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px] bg-slate-800 px-2 py-0.5 rounded text-amber-400">
                    Котормосу
                  </span>
                  <span className="text-slate-400">
                    {currentCardIndex + 1} / {filteredWords.length}
                  </span>
                </div>

                <div className="space-y-3 my-auto max-w-sm">
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-amber-300">
                    {activeCard.translation}
                  </h3>
                  <div className="p-3 bg-slate-800/80 rounded-xl text-xs text-slate-200 text-left space-y-1 border border-slate-700">
                    <div className="font-semibold text-white">{activeCard.contextSentence}</div>
                    <div className="text-slate-400 italic">{activeCard.contextTranslation}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{t.flipCard}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Spaced Repetition */}
          <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
            <button
              onClick={() => handleCardAction('learning')}
              className="flex-1 py-2.5 px-4 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl transition shadow-2xs"
            >
              {t.learningWord}
            </button>
            <button
              onClick={() => handleCardAction('mastered')}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t.knowWord}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-slate-700">Сөздөр табылган жок</h3>
          <p className="text-xs text-slate-400">
            Фильтрди өзгөртүңүз же жогорудагы баскыч менен жаңы сөз кошуңуз.
          </p>
        </div>
      )}

      {/* Vocabulary List & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter segment */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Бардыгы ({currentWords.length})
            </button>
            <button
              onClick={() => setFilter('learning')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === 'learning' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Кайталоо ({currentWords.filter((w) => w.status === 'learning').length})
            </button>
            <button
              onClick={() => setFilter('mastered')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === 'mastered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Өздөштүрүлдү ({currentWords.filter((w) => w.status === 'mastered').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Сөздү издөө..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Word Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {filteredWords.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{item.word}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'mastered' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-500">{item.translation}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                  {item.contextSentence}
                </div>
              </div>
              <button
                onClick={() => handlePlayVoice(item.word)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-200 flex items-center justify-center shrink-0 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-slate-900">
                {t.addWord}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewWord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Сөз же фраза ({language === 'kyrgyz' ? 'кыргызча' : 'english'}):
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder={language === 'kyrgyz' ? 'Мисалы: Ыраазычылык' : 'Example: Resilience'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Котормосу:
                </label>
                <input
                  type="text"
                  required
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="Благодарность / Устойчивость"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Мисал сүйлөм:
                </label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="Сүйлөмдөгү колдонулушу"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
