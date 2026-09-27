import React, { useState, useRef, useEffect } from 'react';
import { TargetLanguage, UILanguage, ChatMessage } from '../types';
import { translations } from '../data/translations';
import { sendChatMessage } from '../services/geminiService';
import {
  speakText,
  startVoiceRecognition,
  isSpeechRecognitionSupported,
  VoiceRecognitionController,
} from '../services/speechService';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface ChatTutorProps {
  language: TargetLanguage;
  uiLang: UILanguage;
  userLevel: string;
  userGoal: string;
  onAddWordToVocab?: (word: string, translation: string) => void;
}

export const ChatTutor: React.FC<ChatTutorProps> = ({
  language,
  uiLang,
  userLevel,
  userGoal,
}) => {
  const t = translations[uiLang] || translations.ky;

  const defaultGreeting: ChatMessage = {
    id: 'initial-greeting',
    role: 'tutor',
    content:
      language === 'kyrgyz'
        ? 'Саламатсызбы! Мен сиздин кыргыз тили боюнча жеке репетиторуңуз Айгүл эже болом. Бүгүн эмне жөнүндө баарлашабыз?'
        : "Hello! I am Teacher John, your personal AI English coach. I'm excited to practice with you today! What would you like to talk about?",
    translation:
      language === 'kyrgyz'
        ? 'Здравствуйте! Я ваш личный репетитор по кыргызскому языку Айгүл эже. О чем побеседуем сегодня?'
        : 'Привет! Я Teacher John, твой личный репетитор по английскому языку. О чем поговорим сегодня?',
    suggestedResponses:
      language === 'kyrgyz'
        ? ['Саламатсызбы, Айгүл эже!', 'Базарда соодалашууну үйрөнгүм келет', 'Өзүмдү тааныштыргым келет']
        : ["Hello Teacher John, nice to meet you!", "Let's practice job interview questions", "I want to improve my daily speaking"],
    timestamp: 'Бүгүн',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState('free');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const activeVoiceCtrlRef = useRef<VoiceRecognitionController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Reset greeting if target language changes
  useEffect(() => {
    setMessages([
      {
        id: 'initial-' + language,
        role: 'tutor',
        content:
          language === 'kyrgyz'
            ? 'Саламатсызбы! Мен сиздин кыргыз тили боюнча жеке репетиторуңуз Айгүл эже болом. Сүйлөшүүгө даярсызбы?'
            : "Hello! I am Teacher John, your English mentor. Ready to elevate your speaking fluency?",
        translation:
          language === 'kyrgyz'
            ? 'Здравствуйте! Я ваш личный репетитор Айгүл эже. Готовы попрактиковаться?'
            : 'Привет! Я твой наставник по английскому. Готов улучшить разговорную речь?',
        suggestedResponses:
          language === 'kyrgyz'
            ? ['Саламатсызбы!', 'Кандайсыз?', 'Кыргызча сүйлөшөлү']
            : ['Hello!', 'How are you today?', "Let's practice!"],
        timestamp: 'Азыр',
      },
    ]);
  }, [language]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // If recording, stop it
    if (activeVoiceCtrlRef.current) {
      activeVoiceCtrlRef.current.stop();
      activeVoiceCtrlRef.current = null;
      setIsRecording(false);
    }

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setMicErrorMessage(null);

    try {
      const response = await sendChatMessage({
        language,
        level: userLevel,
        character: language === 'kyrgyz' ? 'Айгүл эже' : 'Teacher John',
        userGoal: `${userGoal} (Scenario: ${activeScenario})`,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      const tutorMessage: ChatMessage = {
        id: 'tut-' + Date.now(),
        role: 'tutor',
        content: response.replyText,
        translation: response.translation,
        corrections: response.corrections,
        vocabularyTip: response.vocabularyTip,
        suggestedResponses: response.suggestedResponses,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = (id: string, text: string) => {
    setPlayingId(id);
    speakText(text, language, undefined, () => setPlayingId(null));
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      if (activeVoiceCtrlRef.current) {
        activeVoiceCtrlRef.current.stop();
        activeVoiceCtrlRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    setMicErrorMessage(null);

    try {
      setIsRecording(true);
      const controller = await startVoiceRecognition(
        language,
        (text) => {
          setInputText(text);
        },
        (err) => {
          console.warn('Voice error:', err);
          setMicErrorMessage(err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
          activeVoiceCtrlRef.current = null;
        },
        (level) => {
          setAudioLevel(level);
        }
      );

      if (controller) {
        activeVoiceCtrlRef.current = controller;
      } else {
        setIsRecording(false);
      }
    } catch (e) {
      console.error('Mic start error:', e);
      setMicErrorMessage('Микрофонду иштетүүдө ката кетти. Браузерде микрофонго уруксат бар экенин текшериңиз.');
      setIsRecording(false);
    }
  };

  const scenarios = [
    { id: 'free', label: t.scenarioFree, icon: '💬' },
    { id: 'market', label: t.scenarioMarket, icon: '🛒' },
    { id: 'cafe', label: t.scenarioCafe, icon: '☕' },
    { id: 'interview', label: t.scenarioInterview, icon: '💼' },
    { id: 'directions', label: t.scenarioDirections, icon: '🗺️' },
  ];

  const handleSelectScenario = (scId: string) => {
    setActiveScenario(scId);
    let promptText = '';
    if (language === 'kyrgyz') {
      if (scId === 'market') promptText = 'Саламатсызбы! Ош базарынан соода кылып көрөлүчү. Бул алма канча турат?';
      else if (scId === 'cafe') promptText = 'Кечиресиз, бизге чай жана ысык тамак берип коёсузбу?';
      else if (scId === 'interview') promptText = 'Саламатсызбы, мен компанияңыздагы бош кызмат ордуна резюме тапшырган элем.';
      else if (scId === 'directions') promptText = 'Кечиресиз, Ала-Тоо аянтына кантип барсам болот?';
      else promptText = 'Саламатсызбы! Бүгүн кыргызча эркин сүйлөшөлү.';
    } else {
      if (scId === 'market') promptText = 'Hello! How much is this souvenir? Can you give me a discount?';
      else if (scId === 'cafe') promptText = 'Hi! Could I see the menu, please? What do you recommend today?';
      else if (scId === 'interview') promptText = 'Hello! Thank you for inviting me to this job interview today.';
      else if (scId === 'directions') promptText = 'Excuse me, could you tell me how to get to the nearest metro station?';
      else promptText = "Hello! Let's have a casual conversation about daily hobbies.";
    }
    handleSendMessage(promptText);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Tutor Profile Header */}
      <div className="px-4 py-3 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-heading font-bold text-lg flex items-center justify-center shadow-xs">
              {language === 'kyrgyz' ? 'АЭ' : 'TJ'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
              {language === 'kyrgyz' ? t.tutorNameKyrgyz : t.tutorNameEnglish}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>{t.tutorStatus}</span>
              <span>·</span>
              <span className="font-medium text-amber-700">{userLevel}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([defaultGreeting])}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition"
          title={t.clearChat}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scenarios bar */}
      <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0 mr-1">
          {t.scenarioPrompt}
        </span>
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc.id)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeScenario === sc.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <span>{sc.icon}</span>
            <span>{sc.label}</span>
          </button>
        ))}
      </div>

      {/* Mic error notice if any */}
      {micErrorMessage && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{micErrorMessage}</span>
          </div>
          <button
            onClick={() => setMicErrorMessage(null)}
            className="text-amber-700 hover:text-amber-950 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Recording Banner */}
      {isRecording && (
        <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="font-semibold">Микрофон угуп жатат... Сүйлөңүз!</span>
            {/* Visualizer bars */}
            <div className="flex items-center gap-0.5 ml-2 h-4">
              <span
                className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, audioLevel * 16)}px` }}
              />
              <span
                className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, audioLevel * 20)}px` }}
              />
              <span
                className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, audioLevel * 14)}px` }}
              />
            </div>
          </div>
          <button
            onClick={handleToggleVoiceRecord}
            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition"
          >
            Токтотуу
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-sm shadow-xs ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              {/* Main Text */}
              <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

              {/* Translation */}
              {msg.translation && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                  <span className="font-semibold not-italic text-slate-400">{t.translationLabel} </span>
                  {msg.translation}
                </div>
              )}

              {/* Error correction box if tutor caught an error */}
              {msg.corrections && (
                <div className="mt-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.correctionNote}</span>
                  </div>
                  <p className="leading-normal">{msg.corrections}</p>
                </div>
              )}

              {/* Vocabulary tip */}
              {msg.vocabularyTip && (
                <div className="mt-2 p-2 bg-indigo-50/70 rounded-lg border border-indigo-100 text-xs text-indigo-900 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t.tutorTip} </span>
                    <span>{msg.vocabularyTip}</span>
                  </div>
                </div>
              )}

              {/* Audio Listen & Meta */}
              {msg.role === 'tutor' && (
                <div className="mt-2 pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={() => handlePlayVoice(msg.id, msg.content)}
                    className="flex items-center gap-1 hover:text-slate-700 transition"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingId === msg.id ? 'text-amber-600 animate-pulse' : ''}`} />
                    <span>Үн менен угуу</span>
                  </button>
                  <span>{msg.timestamp}</span>
                </div>
              )}
            </div>

            {/* Quick response chips */}
            {msg.suggestedResponses && msg.suggestedResponses.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-xl">
                {msg.suggestedResponses.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(res)}
                    className="px-3 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-full text-xs font-medium transition shadow-2xs"
                  >
                    {res}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>
              {language === 'kyrgyz' ? 'Айгүл эже жооп жазып жатат...' : 'Teacher John is typing...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Microphone */}
          <button
            type="button"
            onClick={handleToggleVoiceRecord}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-md ring-4 ring-rose-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={isRecording ? t.stopListening : 'Микрофон менен үн чыгарып сүйлөө'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? 'Сүйлөп жаткан сөзүңүз жазылууда...' : t.chatPlaceholder}
            className="flex-1 px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <span>{t.send}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
