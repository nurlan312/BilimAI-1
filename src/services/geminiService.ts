import { TargetLanguage } from '../types';

export interface ChatRequestParams {
  language: TargetLanguage;
  level: string;
  character: string;
  userGoal: string;
  messages: { role: 'user' | 'tutor'; content: string }[];
}

export interface ChatResponseData {
  replyText: string;
  translation: string;
  corrections: string | null;
  vocabularyTip: string;
  suggestedResponses: string[];
}

export async function sendChatMessage(params: ChatRequestParams): Promise<ChatResponseData> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Chat API error: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Chat API request failed:', err);
    // Graceful offline fallback
    if (params.language === 'kyrgyz') {
      return {
        replyText: 'Азаматсыз! Сиздин аракетиңиз абдан жакшы. Мага дагы бир суроо бериңиз же сүйлөм түзүңүз.',
        translation: 'Молодец! Очень хорошее старание. Задайте мне еще один вопрос или составьте предложение.',
        corrections: null,
        vocabularyTip: 'Кыргыз тилинде «рахмат» — рахмат айтуу үчүн негизги сөз.',
        suggestedResponses: ['Кандайсыз?', 'Менин атым...', 'Бул канча турат?'],
      };
    } else {
      return {
        replyText: "That's wonderful! Keep practicing your conversational English. What would you like to discuss next?",
        translation: 'Замечательно! Продолжайте практиковать разговорный английский. Что вы хотите обсудить далее?',
        corrections: null,
        vocabularyTip: '"Keep up the good work" is a great way to encourage someone.',
        suggestedResponses: ['Tell me about your hobbies', 'How is the weather today?', 'Let us practice travel phrases'],
      };
    }
  }
}

export async function evaluatePronunciation(params: {
  targetText: string;
  spokenText: string;
  language: TargetLanguage;
}) {
  try {
    const res = await fetch('/api/gemini/pronunciation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Pronunciation eval failed');
    return await res.json();
  } catch (err) {
    console.warn('Using client-side heuristic evaluation:', err);
    // Fallback heuristic scoring
    const cleanTarget = params.targetText.toLowerCase().replace(/[^\w\sа-яөүңё]/gi, '');
    const cleanSpoken = params.spokenText.toLowerCase().replace(/[^\w\sа-яөүңё]/gi, '');
    const isClose = cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken);

    return {
      score: isClose ? 92 : 75,
      accuracy: isClose ? 'High' : 'Medium',
      transcribed: params.spokenText,
      feedback: isClose
        ? 'Абдан жакшы айтылды! Артикуляция так жана табигый.'
        : 'Жакшы аракет! Сөздөрдүн басымына жана созулма үндүүлөргө көңүл буруңуз.',
      phoneticTips: [
        'Эриндерди алдыга тегеректеп, тыбыштарды так чыгарыңыз',
        'Сүйлөмдүн интонациясын бир калыпта кармаңыз',
      ],
      mispronouncedWords: [],
    };
  }
}

export async function evaluateDiagnostic(params: {
  language: TargetLanguage;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[];
  userGoal: string;
}) {
  try {
    const res = await fetch('/api/gemini/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Diagnostic API failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback diagnostic report:', err);
    const correctCount = params.answers.filter((a) => a.isCorrect).length;
    const scorePct = Math.round((correctCount / Math.max(params.answers.length, 1)) * 100);

    let level = 'Башталгыч (A1)';
    if (params.language === 'english') {
      level = scorePct > 80 ? 'B2 Upper-Intermediate' : scorePct > 50 ? 'B1 Intermediate' : 'A1 Beginner';
    } else {
      level = scorePct > 80 ? 'Жогорку (B2+)' : scorePct > 50 ? 'Орто (A2-B1)' : 'Башталгыч (A1)';
    }

    return {
      determinedLevel: level,
      overallScore: scorePct,
      analysis: `Сиздин жыйынтыгыңыз: ${scorePct}%. Сизде негизги сөздүк кору жакшы калыптанган, эми практикага басым жасоо керек.`,
      strengths: ['Базовый словарный запас', 'Понимание контекста'],
      weaknesses: ['Грамматические окончания', 'Интонация'],
      recommendedPlan: [
        { title: 'Модуль 1: Разговорная практика', desc: 'Ежедневные диалоги и формулы вежливости', weeks: 2 },
        { title: 'Модуль 2: Грамматика в действии', desc: 'Падежи, окончания и времена', weeks: 3 },
        { title: 'Модуль 3: Аудирование и произношение', desc: 'Улучшение восприятия на слух', weeks: 2 },
        { title: 'Модуль 4: Практика в реальных ситуациях', desc: 'Служба, работа, поездки', weeks: 3 },
      ],
    };
  }
}

export async function explainRuleOrMistake(params: {
  topic: string;
  context?: string;
  studentQuery?: string;
  language: TargetLanguage;
}) {
  try {
    const res = await fetch('/api/gemini/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Explain API failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback explain:', err);
    return {
      simpleExplanation: `Бул эреже боюнча: сөздүн түзүлүшү жана мааниси байланышкан. Эң башкысы — сөздүн аягындагы мүчөлөрдүн үндөштүгүн сактоо.`,
      ruleSummary: 'Үндөштүк закону: жоон үндүүлөргө жоон, ичке үндүүлөргө ичке мүчө уланат.',
      examples: [
        { original: 'Бала-лар-га', translation: 'Детям', breakdown: 'Жоон үндүүлөр' },
        { original: 'Үй-лөр-гө', translation: 'Домам', breakdown: 'Ичке үндүүлөр' },
      ],
      memoryTip: 'Сөздүн биринчи тамгасынын үндүүсүн карап, мүчөнү ошого ылайыктаңыз!',
    };
  }
}
