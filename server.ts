import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client (User-Agent header required)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust model caller with automatic fallback and retry
const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

async function generateContentWithFallback(options: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}) {
  let lastError: unknown;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature ?? 0.7,
        },
      });
      return response;
    } catch (err) {
      console.warn(`Model ${model} failed, trying next candidate...`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }
  throw lastError;
}

function cleanAndParseJson(rawText: string) {
  let cleaned = (rawText || '').trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Interactive Tutor Dialogue
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { language, level, character, messages, userGoal } = req.body;

    const tutorPersonas: Record<string, string> = {
      kyrgyz: `Сен — "Айгүл эже", кыргыз тилин үйрөтүүчү абдан мээримдүү, билимдүү, заманбап жана колдоочу ИИ-репетиторсуң.
Сен колдонуучунун ар бир сөзүн кунт коюп окуп, ага ЖАНДУУ, ТАБИГЫЙ жана ДАРОО ТИЕШЕЛҮҮ жооп беришиң керек. Эч качан бир эле шаблондук жоопту кайталаба!
Колдонуучунун деңгээли: ${level || 'Башталгыч'}.
Максаты: ${userGoal || 'Эркин сүйлөшүү'}.

Эрежелер:
1. Колдонуучу эмне деп жазса, ошол сөздүн маанисине түздөн-түз байланыштуу жооп бер. Суроо берсе — толук жооп бер, учурашса — жылуу учураш, сүйлөм түзсө — баала.
2. Эгер ката кетирсе, жумшак түрдө оңдо ("Туурасы мындай болот..."). Эгер ката жок болсо, макта ("Эң туура!", "Азаматсың!").
3. Жообуңдун аягында диалог уланышы үчүн 1 кызыктуу суроо бер.
4. Төмөнкү JSON форматында ЖОЛДО:
{
  "replyText": "Колдонуучуга кыргызча берилген негизги табигый жообуң",
  "translation": "Жообуңдун орусча же англисче так котормосу (жаңы үйрөнүүчүгө түшүнүктүү болушу үчүн)",
  "corrections": "Колдонуучунун катасы болсо оңдоо жана түшүндүрмө (ката жок болсо null же мактоо)",
  "vocabularyTip": "Бул контекстке тиешелүү 1 жаңы пайдалуу сөз же кыска эреже",
  "suggestedResponses": ["Колдонуучу дароо баса ала турган 2-3 табигый жооп варианты"]
}`,
      english: `You are "Teacher John", an empathetic, energetic, and professional native-level AI English coach.
You must carefully read what the user wrote and respond DIRECTLY, NATURALLY, and SPECIFICALLY to their exact message. Never return generic boilerplate.
User level: ${level || 'A1 Beginner'}.
Goal: ${userGoal || 'Conversational Fluency'}.

Rules:
1. Address the user's exact topic or question directly.
2. If there are grammar/vocabulary errors, gently explain them and show the natural way to say it. If no error, encourage them!
3. Ask a relevant follow-up question to keep the conversation flowing.
4. Provide structured JSON:
{
  "replyText": "Your direct, engaging English response to the student",
  "translation": "Russian or Kyrgyz translation for clarity",
  "corrections": "Encouraging correction of any mistakes, or null if great",
  "vocabularyTip": "A useful idiom, phrase, or grammar tip for this context",
  "suggestedResponses": ["2-3 natural short replies the student can choose from"]
}`
    };

    const systemInstruction = tutorPersonas[language] || tutorPersonas.english;

    // Convert messages history to formatted prompt
    const conversationHistory = (messages || [])
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const prompt = `Here is our conversation history:\n${conversationHistory}\n\nPlease respond directly to the student's latest message. Return strictly valid JSON matching the schema.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
    });

    const parsedData = cleanAndParseJson(response.text || '{}');
    res.json(parsedData);
  } catch (error) {
    console.error('Error in /api/gemini/chat:', error);
    // Intelligent dynamic fallback in case of catastrophic network failure
    const userMsg = req.body.messages?.slice(-1)[0]?.content || '';
    if (req.body.language === 'kyrgyz') {
      res.json({
        replyText: `Саламатсызбы! Сиз «${userMsg}» дедиңиз. Мен сиздин репетиторуңуз Айгүл эже болом. Бул сүйлөм боюнча дагы машыгалы! Сиз кыргызча канча убакыттан бери үйрөнүп жатасыз?`,
        translation: `Здравствуйте! Вы сказали «${userMsg}». Я ваш репетитор Айгүл эже. Давайте попрактикуемся дальше! Как давно вы изучаете кыргызский?`,
        corrections: null,
        vocabularyTip: 'Кыргыз тилинде «Кандайсыз?» — сылык аманчылык суроо.',
        suggestedResponses: ['Жаңыдан баштадым', 'Бир нече ай болду', 'Эркин сүйлөгүм келет'],
      });
    } else {
      res.json({
        replyText: `Hello! You said: "${userMsg}". That's a great thought! How long have you been studying English?`,
        translation: `Привет! Вы сказали: "${userMsg}". Отличная мысль! Как давно вы учите английский?`,
        corrections: null,
        vocabularyTip: '"Keep it up" means to continue doing great work.',
        suggestedResponses: ['I am a beginner', 'For a few months', 'I want to speak fluently'],
      });
    }
  }
});

// 2. Speech & Pronunciation Analysis
app.post('/api/gemini/pronunciation', async (req: Request, res: Response) => {
  try {
    const { targetText, spokenText, language } = req.body;

    const systemInstruction = `You are an expert phonetician and speech coach for ${
      language === 'kyrgyz'
        ? 'the Kyrgyz language (special focus on vowels ө, ү and consonant ң, and vowel length: аа, оо, уу, ээ)'
        : 'the English language (focus on phonemes /θ/, /ð/, /w/ vs /v/, /r/, /l/, and natural rhythm/intonation)'
    }.
Compare the expected target phrase with what the user actually said.
Evaluate accuracy (0-100), phonetic clarity, rhythm, and give specific constructive tips on mouth/tongue placement.
Respond strictly in JSON format:
{
  "score": 85,
  "accuracy": "High / Medium / Needs Practice",
  "transcribed": "${spokenText}",
  "feedback": "Friendly, encouraging feedback in Russian or Kyrgyz",
  "phoneticTips": ["Tip 1: How to position tongue/lips", "Tip 2: Stress or vowel length"],
  "mispronouncedWords": ["word1", "word2"]
}`;

    const prompt = `Target phrase: "${targetText}"\nSpoken transcript by learner: "${spokenText}"\nTarget language: ${language}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    const result = cleanAndParseJson(response.text || '{}');
    res.json(result);
  } catch (error) {
    console.error('Error in /api/gemini/pronunciation:', error);
    res.status(500).json({ error: 'Failed to evaluate pronunciation' });
  }
});

// 3. Diagnostic Placement Test Evaluation
app.post('/api/gemini/diagnostic', async (req: Request, res: Response) => {
  try {
    const { language, answers, userGoal } = req.body;

    const prompt = `Evaluate the placement test answers for a student learning ${language}.
User goal: ${userGoal || 'General mastery'}
Answers submitted: ${JSON.stringify(answers)}

Determine:
1. Placement level (For Kyrgyz: "Башталгыч / A1", "Орто / A2-B1", "Жогорку / B2+". For English: "A1", "A2", "B1", "B2", "C1").
2. Percentage score.
3. Strengths and areas for improvement.
4. Recommended personalized study plan with 4 key focus modules.

Return strictly JSON:
{
  "determinedLevel": "A1 / Башталгыч",
  "overallScore": 80,
  "analysis": "Detailed encouraging review of their skills",
  "strengths": ["Grammar basics", "Vocabulary"],
  "weaknesses": ["Vowel harmony / Tenses", "Listening"],
  "recommendedPlan": [
    { "title": "Module 1", "desc": "Focus description", "weeks": 2 },
    { "title": "Module 2", "desc": "Focus description", "weeks": 3 },
    { "title": "Module 3", "desc": "Focus description", "weeks": 3 },
    { "title": "Module 4", "desc": "Focus description", "weeks": 4 }
  ]
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
    });

    res.json(cleanAndParseJson(response.text || '{}'));
  } catch (error) {
    console.error('Error in /api/gemini/diagnostic:', error);
    res.status(500).json({ error: 'Failed to analyze diagnostic test' });
  }
});

// 4. Grammar / Mistake Deep Explanation
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const { topic, context, studentQuery, language } = req.body;

    const prompt = `You are a patient language tutor.
Language being taught: ${language}
Topic/Rule: ${topic}
Context/Sentence: ${context || 'None'}
Student's question: "${studentQuery || 'Explain this in simpler words with 2 clear examples'}"

Provide a crystal-clear, pedagogically sound explanation with 2 memorable real-world examples and a quick mnemonic or memory trick.
Respond strictly in JSON:
{
  "simpleExplanation": "Clear explanation in friendly Russian/Kyrgyz",
  "ruleSummary": "Short 1-line rule to remember",
  "examples": [
    { "original": "Example in target language", "translation": "Translation", "breakdown": "Why it's formulated this way" },
    { "original": "Example 2", "translation": "Translation", "breakdown": "Explanation" }
  ],
  "memoryTip": "A memorable mnemonic or visual rule"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      responseMimeType: 'application/json',
    });

    res.json(cleanAndParseJson(response.text || '{}'));
  } catch (error) {
    console.error('Error in /api/gemini/explain:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Helper: Convert Linear 16-bit PCM to standard playable WAV Buffer
function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// In-memory cache for audio phrases
const ttsCache = new Map<string, string>();

// 5. High-Fidelity Human-Like Text-to-Speech (Gemini TTS)
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', language = 'kyrgyz' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Missing text parameter' });
      return;
    }

    const cleanText = text.trim().slice(0, 300);
    const cacheKey = `${voice}_${cleanText}`;
    if (ttsCache.has(cacheKey)) {
      res.json({ audioUrl: ttsCache.get(cacheKey), voiceUsed: voice });
      return;
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: language === 'kyrgyz'
                  ? 'Warm, polite, natural human Kyrgyz language tutor with clear pronunciation'
                  : 'Friendly, articulate English coach',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Pcm = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Pcm) {
      throw new Error('No audio data in response');
    }

    const pcmBuf = Buffer.from(base64Pcm, 'base64');
    const wavBuf = pcmToWavBuffer(pcmBuf, 24000);
    const dataUrl = `data:audio/wav;base64,${wavBuf.toString('base64')}`;

    if (ttsCache.size < 100) {
      ttsCache.set(cacheKey, dataUrl);
    }

    res.json({ audioUrl: dataUrl, voiceUsed: voice });
  } catch (error) {
    console.error('Error in /api/gemini/tts:', error);
    res.status(500).json({
      error: 'TTS generation failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production' || process.env.FORCE_PROD === 'true';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!doctype html><html><body><h1>БилимAI жүктөлүүдө...</h1><script>setTimeout(()=>location.reload(), 1500);</script></body></html>');
      }
    });
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${portNum}`);
  });
}

startServer();
