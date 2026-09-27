import { LessonModule } from '../types';

export const englishCurriculum: LessonModule[] = [
  // MODULE 1: Essential Introductions & Daily Small Talk
  {
    id: 'en-mod-1',
    language: 'english',
    title: 'Essential Introductions & Daily Small Talk',
    titleTranslation: 'Базовые знакомства и непринужденный разговор',
    description: 'Learn how to introduce yourself naturally, ask polite questions, and maintain friendly small talk.',
    iconName: 'MessageSquare',
    level: 'A1 Beginner',
    lessons: [
      {
        id: 'en-les-1-1',
        moduleId: 'en-mod-1',
        title: 'Meeting People & Introducing Yourself',
        titleTranslation: 'Знакомство и рассказ о себе',
        durationMinutes: 8,
        difficulty: 'A1 Beginner',
        grammarFocus: 'Verb "to be" (am, is, are) & Possessive Pronouns (my, your, his/her)',
        summary: 'Master key phrases: "Nice to meet you", "Where are you from?", and "I work as a..."',
        introduction: `When meeting someone new in English:
- **Hello! My name is Alex.** (Привет! Меня зовут Алекс. / Менин атым Алекс.)
- **Nice to meet you!** (Приятно познакомиться! / Таанышканыма кубанычтамын!)
- **Where are you from?** — *I am from Bishkek, Kyrgyzstan.*
- **What do you do?** — *I am a software developer.*`,
        examples: [
          {
            phrase: "Hello! I'm Sarah. It's a pleasure to meet you.",
            translation: 'Здравствуйте! Я Сара. Очень приятно познакомиться.',
            transcription: '[həˈloʊ aɪm ˈsɛərə ɪts ə ˈplɛʒər tu miːt juː]',
            note: "Use 'It is a pleasure to meet you' in formal or business contexts.",
          },
          {
            phrase: 'Where do you work?',
            translation: 'Где вы работаете? / Сиз кайда иштейсиз?',
            transcription: '[wɛər duː juː wɜːrk]',
          },
        ],
        keyVocabulary: [
          { word: 'Pleasure', translation: 'Удовольствие / Ырахат', transcription: '[ˈplɛʒər]' },
          { word: 'Introduce', translation: 'Представить / Тааныштыруу', transcription: '[ˌɪntrəˈdjuːs]' },
          { word: 'Colleague', translation: 'Коллега / Кесиптеш', transcription: '[ˈkɑːliːɡ]' },
          { word: 'Hometown', translation: 'Родной город / Туулган шаар', transcription: '[ˈhoʊmtaʊn]' },
        ],
        exercises: [
          {
            id: 'en-ex-1-1',
            type: 'multiple_choice',
            prompt: 'How do you respond politely when someone says: "Nice to meet you!"?',
            instruction: 'Select the most natural response',
            options: ['Nice to meet you too!', 'Yes, I am fine.', 'No problem at all.', 'Goodbye!'],
            correctAnswer: 'Nice to meet you too!',
            explanation: '"Nice to meet you too!" is the standard, warm response.',
          },
          {
            id: 'en-ex-1-2',
            type: 'fill_blank',
            prompt: 'Complete the sentence: "Where _____ you from?"',
            instruction: 'Choose the correct form of the verb "to be"',
            sentenceTemplate: 'Where _____ you from?',
            options: ['are', 'is', 'am', 'be'],
            correctAnswer: 'are',
            explanation: 'With pronoun "you", we always use "are" in the present tense.',
          },
          {
            id: 'en-ex-1-3',
            type: 'speaking',
            prompt: 'Pronounce clearly: "Nice to meet you! Where are you from?"',
            instruction: 'Click microphone and speak into it',
            targetAudioText: 'Nice to meet you Where are you from',
            correctAnswer: 'Nice to meet you Where are you from',
            explanation: 'Great job! Your intonation sounds very friendly and confident.',
          },
        ],
      },
      {
        id: 'en-les-1-2',
        moduleId: 'en-mod-1',
        title: 'Daily Routines & Telling Time',
        titleTranslation: 'Распорядок дня и указание времени',
        durationMinutes: 8,
        difficulty: 'A1 Beginner',
        grammarFocus: 'Present Simple tense & Time prepositions (at, in, on)',
        summary: 'Describe your day: "I wake up at 7 AM", "I have lunch at noon", "What time is it?".',
        introduction: `Talking about daily activities using Present Simple:
- **I wake up at 7:00 AM every day.** (Я просыпаюсь в 7 утра каждый день.)
- **What time is it?** — *It is quarter past eight.* (Который час? — Пятнадцать минут девятого.)
- **In the morning / In the afternoon / In the evening.**
- **At night / At noon / At 9 o'clock.**`,
        examples: [
          {
            phrase: 'I usually have breakfast at eight o’clock.',
            translation: 'Обычно я завтракаю в восемь часов.',
            transcription: '[aɪ ˈjuːʒuəli hæv ˈbrɛkfəst æt eɪt əˈklɒk]',
          },
        ],
        keyVocabulary: [
          { word: 'Routine', translation: 'Распорядок / Күн тартиби', transcription: '[ruːˈtiːn]' },
          { word: 'Breakfast', translation: 'Завтрак / Эртең мененки тамак', transcription: '[ˈbrɛkfəst]' },
          { word: 'Noon', translation: 'Полдень / Түш мезгили', transcription: '[nuːn]' },
          { word: 'Usually', translation: 'Обычно / Адатта', transcription: '[ˈjuːʒuəli]' },
        ],
        exercises: [
          {
            id: 'en-ex-1-2-1',
            type: 'multiple_choice',
            prompt: 'Which preposition is used for specific times: "The meeting starts _____ 3 PM"?',
            instruction: 'Select correct preposition',
            options: ['at', 'in', 'on', 'by'],
            correctAnswer: 'at',
            explanation: 'We always use "at" with clock times (at 3 PM, at 7 o\'clock).',
          },
        ],
      },
    ],
  },

  // MODULE 2: Travel, Dining & City Life
  {
    id: 'en-mod-2',
    language: 'english',
    title: 'Travel, Dining & Navigating the City',
    titleTranslation: 'Путешествия, кафе и ориентирование в городе',
    description: 'Order food with confidence, check into hotels, and ask for directions abroad.',
    iconName: 'Compass',
    level: 'A2 Elementary',
    lessons: [
      {
        id: 'en-les-2-1',
        moduleId: 'en-mod-2',
        title: 'Ordering at a Restaurant & Coffee Shop',
        titleTranslation: 'Заказ в ресторане и кофейне',
        durationMinutes: 9,
        difficulty: 'A2 Elementary',
        grammarFocus: 'Polite requests: "Could I have...", "I would like..."',
        summary: 'How to order drinks, ask for recommendations, and request the bill politely.',
        introduction: `Essential phrases for dining out:
- **Could I have a cappuccino with oat milk, please?** (Можно мне капучино на овсяном молоке?)
- **What do you recommend today?** (Что вы посоветуете сегодня?)
- **Could we get the bill / check, please?** (Можно нам счет, пожалуйста?)
- **Is service included?** (Обслуживание включено?)`,
        examples: [
          {
            phrase: "Excuse me, I'd like to order a chicken salad and sparkling water.",
            translation: 'Извините, я бы хотел заказать салат с курицей и газированную воду.',
            transcription: '[ɪkˈskjuːz miː aɪd laɪk tu ˈɔːrdər ə ˈtʃɪkɪn ˈsæləd]',
          },
        ],
        keyVocabulary: [
          { word: 'Recommend', translation: 'Рекомендовать / Сунуштоо', transcription: '[ˌrɛkəˈmɛnd]' },
          { word: 'Bill / Check', translation: 'Счет / Эсеп', transcription: '[bɪl]' },
          { word: 'Beverage', translation: 'Напиток / Суусундук', transcription: '[ˈbɛvərɪdʒ]' },
          { word: 'Receipt', translation: 'Чек / Квитанция', transcription: '[rɪˈsiːt]' },
        ],
        exercises: [
          {
            id: 'en-ex-2-1-1',
            type: 'multiple_choice',
            prompt: 'What is the most polite way to ask for the bill at a restaurant?',
            instruction: 'Select the best phrase',
            options: ['Could we have the bill, please?', 'Give me the check right now', 'Money time!', 'I want bill'],
            correctAnswer: 'Could we have the bill, please?',
            explanation: '"Could we have the bill, please?" is the polite standard in English.',
          },
        ],
      },
      {
        id: 'en-les-2-2',
        moduleId: 'en-mod-2',
        title: 'Airport, Hotel & Asking for Directions',
        titleTranslation: 'Аэропорт, отель и поиск дороги',
        durationMinutes: 9,
        difficulty: 'A2 Elementary',
        grammarFocus: 'Prepositions of place and polite direction inquiries',
        summary: 'Navigating check-in desks, asking "How do I get to...", and understanding directions.',
        introduction: `Key phrases when traveling:
- **I have a reservation under the name Alex.** (У меня бронь на имя Алекс.)
- **Could you tell me how to get to the boarding gate?** (Подскажите, как пройти к выходу на посадку?)
- **Go straight ahead, then turn left at the corner.** (Идите прямо, затем поверните налево за углом.)
- **What time is check-out tomorrow?** (В какое время выселение завтра?)`,
        examples: [
          {
            phrase: 'Excuse me, is this the check-in counter for flight 204?',
            translation: 'Извините, это стойка регистрации на рейс 204?',
            transcription: '[ɪkˈskjuːz miː ɪz ðɪs ðə ˈtʃɛkɪn ˈkaʊntər]',
          },
        ],
        keyVocabulary: [
          { word: 'Reservation', translation: 'Бронь / Алдын ала ээлөө', transcription: '[ˌrɛzərˈveɪʃən]' },
          { word: 'Boarding gate', translation: 'Выход на посадку', transcription: '[ˈbɔːrdɪŋ ɡeɪt]' },
          { word: 'Direction', translation: 'Направление / Багыт', transcription: '[dɪˈrɛkʃən]' },
          { word: 'Straight', translation: 'Прямо / Түз', transcription: '[streɪt]' },
        ],
        exercises: [
          {
            id: 'en-ex-2-2-1',
            type: 'multiple_choice',
            prompt: 'How do you ask someone for directions to the metro station?',
            instruction: 'Select the natural inquiry',
            options: ['Excuse me, how do I get to the metro station?', 'Where metro right now?', 'Show metro to me', 'Take me metro'],
            correctAnswer: 'Excuse me, how do I get to the metro station?',
            explanation: '"Excuse me, how do I get to..." is standard and polite.',
          },
        ],
      },
    ],
  },

  // MODULE 3: Career, Work & Professional Life
  {
    id: 'en-mod-3',
    language: 'english',
    title: 'Career, Job Interviews & Workplace English',
    titleTranslation: 'Карьера, собеседования и деловой английский',
    description: 'Ace your English job interviews and communicate professionally in the workplace.',
    iconName: 'Briefcase',
    level: 'B1 Intermediate',
    lessons: [
      {
        id: 'en-les-3-1',
        moduleId: 'en-mod-3',
        title: 'Professional Job Interview Essentials',
        titleTranslation: 'Успешное собеседование на английском',
        durationMinutes: 10,
        difficulty: 'B1 Intermediate',
        grammarFocus: 'Present Perfect tense for experience ("I have worked as...")',
        summary: 'Answer tough interview questions: strengths, accomplishments, and career motivation.',
        introduction: `Interview mastery formula:
- **Tell me about yourself:** Focus on your recent experience and skills.
- **I have five years of experience in product management.** (У меня 5 лет опыта в управлении продуктом.)
- **My greatest strength is problem-solving under tight deadlines.**
- **Why do you want to join our company?** — *Because I admire your innovative culture.*`,
        examples: [
          {
            phrase: "In my previous role, I led a cross-functional team of six engineers.",
            translation: 'На предыдущей должности я руководил кросс-функциональной командой из 6 инженеров.',
            transcription: '[ɪn maɪ ˈpriːviəs roʊl aɪ lɛd ə krɔːs ˈfʌŋkʃənl tiːm]',
          },
        ],
        keyVocabulary: [
          { word: 'Accomplishment', translation: 'Достижение / Ийгилик', transcription: '[əˈkɑːmplɪʃmənt]' },
          { word: 'Strength', translation: 'Сильная сторона / Күчтүү жак', transcription: '[strɛŋkθ]' },
          { word: 'Previous', translation: 'Предыдущий / Мурунку', transcription: '[ˈpriːviəs]' },
          { word: 'Collaborate', translation: 'Сотрудничать / Бирге иштешүү', transcription: '[kəˈlæbəreɪt]' },
        ],
        exercises: [
          {
            id: 'en-ex-3-1-1',
            type: 'multiple_choice',
            prompt: 'Complete the sentence: "I _____ in this industry for over four years."',
            instruction: 'Select Present Perfect form',
            options: ['have worked', 'worked', 'am working', 'was work'],
            correctAnswer: 'have worked',
            explanation: 'Use Present Perfect ("have worked") when describing ongoing career experience.',
          },
        ],
      },
      {
        id: 'en-les-3-2',
        moduleId: 'en-mod-3',
        title: 'Business Email & Office Communication',
        titleTranslation: 'Деловая переписка и рабочая коммуникация',
        durationMinutes: 9,
        difficulty: 'B1 Intermediate',
        grammarFocus: 'Formal email openings, follow-ups, and polite closures',
        summary: '"I hope this email finds you well", "Looking forward to hearing from you".',
        introduction: `Writing professional emails:
- **Opening:** *Dear Mr. Davis,* or *Hi team, I hope this email finds you well.*
- **Stating purpose:** *I am writing to follow up on our previous discussion...*
- **Call to action:** *Please let me know if Thursday at 2 PM works for you.*
- **Closing:** *Best regards,* or *Sincerely,*`,
        examples: [
          {
            phrase: 'Please find attached the updated project report for your review.',
            translation: 'В приложении направляю обновленный отчет по проекту для ознакомления.',
            transcription: '[pliːz faɪnd əˈtætʃt ðɪ ʌpˈdeɪtɪd ˈprɒdʒɛkt rɪˈpɔːrt]',
          },
        ],
        keyVocabulary: [
          { word: 'Attached', translation: 'Прикрепленный / Тиркелген', transcription: '[əˈtætʃt]' },
          { word: 'Follow up', translation: 'Напомнить / Уточнить', transcription: '[ˈfɑːloʊ ʌp]' },
          { word: 'Regards', translation: 'С уважением / Урматым менен', transcription: '[rɪˈɡɑːrdz]' },
        ],
        exercises: [
          {
            id: 'en-ex-3-2-1',
            type: 'multiple_choice',
            prompt: 'What is a standard professional sign-off at the end of a business email?',
            instruction: 'Select the best phrase',
            options: ['Best regards,', 'Later dude!', 'Bye bye,', 'See ya,'],
            correctAnswer: 'Best regards,',
            explanation: '"Best regards," is universally accepted in business correspondence.',
          },
        ],
      },
    ],
  },

  // MODULE 4: Expressing Opinions & Fluency Booster
  {
    id: 'en-mod-4',
    language: 'english',
    title: 'Expressing Opinions & Daily Idioms',
    titleTranslation: 'Выражение мнений и разговорные идиомы',
    description: 'Speak like a native speaker with natural transitions, debate techniques, and idioms.',
    iconName: 'Sparkles',
    level: 'B2 Upper-Intermediate',
    lessons: [
      {
        id: 'en-les-4-1',
        moduleId: 'en-mod-4',
        title: 'Agreeing, Disagreeing & Debating Ideas',
        titleTranslation: 'Согласие, несогласие и дискуссия',
        durationMinutes: 9,
        difficulty: 'B2 Upper-Intermediate',
        grammarFocus: 'Modal verbs for softening opinions (might, would, could)',
        summary: '"I see your point, but...", "I couldn\'t agree more", "To be honest...".',
        introduction: `Diplomatic discussion techniques:
- **Strong agreement:** *I couldn't agree more! / Absolutely!*
- **Polite disagreement:** *I see where you're coming from, but have you considered...?*
- **Expressing doubts:** *I'm not entirely convinced that this is the best approach.*`,
        examples: [
          {
            phrase: 'That is a compelling argument; however, there are a few risks to consider.',
            translation: 'Это убедительный аргумент, однако есть несколько рисков, которые стоит учесть.',
            transcription: '[ðæt ɪz ə kəmˈpɛlɪŋ ˈɑːrɡjəmənt haʊˈɛvər]',
          },
        ],
        keyVocabulary: [
          { word: 'Compelling', translation: 'Убедительный / Ынандырарлык', transcription: '[kəmˈpɛlɪŋ]' },
          { word: 'Perspective', translation: 'Точка зрения / Көз караш', transcription: '[pərˈspɛktɪv]' },
          { word: 'Consider', translation: 'Рассмотреть / Эске алуу', transcription: '[kənˈsɪdər]' },
        ],
        exercises: [
          {
            id: 'en-ex-4-1-1',
            type: 'multiple_choice',
            prompt: 'What does "I couldn\'t agree more" mean?',
            instruction: 'Select correct meaning',
            options: ['I completely agree with you 100%', 'I disagree completely', 'I don\'t understand', 'I need more time'],
            correctAnswer: 'I completely agree with you 100%',
            explanation: '"I couldn\'t agree more" means you agree so much that it is impossible to agree any more!',
          },
        ],
      },
      {
        id: 'en-les-4-2',
        moduleId: 'en-mod-4',
        title: 'Common Idioms & Phrasal Verbs in Daily Speech',
        titleTranslation: 'Популярные идиомы и фразовые глаголы',
        durationMinutes: 9,
        difficulty: 'B2 Upper-Intermediate',
        grammarFocus: 'Figurative vs literal meaning in idioms',
        summary: '"Piece of cake", "Hit the nail on the head", "Break the ice".',
        introduction: `Sound natural using popular English idioms:
- **Piece of cake:** Something that is very easy. (*That exam was a piece of cake!*)
- **Break the ice:** Start a friendly conversation to make people feel comfortable.
- **Hit the nail on the head:** Describe exactly what is causing a situation.
- **Call it a day:** Stop working for the day.`,
        examples: [
          {
            phrase: 'We have made tremendous progress today. Let’s call it a day!',
            translation: 'Мы сегодня отлично поработали. Давайте закругляться!',
            transcription: '[wiː hæv meɪd trɪˈmɛndəs ˈprɒɡrɛs təˈdeɪ lɛts kɔːl ɪt ə deɪ]',
          },
        ],
        keyVocabulary: [
          { word: 'Piece of cake', translation: 'Легкотня / Оңой иш', transcription: '[piːs əv keɪk]' },
          { word: 'Break the ice', translation: 'Разрядить обстановку', transcription: '[breɪk ðɪ aɪs]' },
          { word: 'Call it a day', translation: 'Закончить работу на сегодня', transcription: '[kɔːl ɪt ə deɪ]' },
        ],
        exercises: [
          {
            id: 'en-ex-4-2-1',
            type: 'multiple_choice',
            prompt: 'If someone says: "Learning Kyrgyz grammar with this app is a piece of cake!", what do they mean?',
            instruction: 'Select the idiom meaning',
            options: ['It is very easy and fun', 'It is made of sweet dough', 'It is difficult to digest', 'It takes too long'],
            correctAnswer: 'It is very easy and fun',
            explanation: '"A piece of cake" means something is delightfully simple and straightforward.',
          },
        ],
      },
    ],
  },
];
