import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side storage implementation
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'storage.json');

const DEFAULT_STORAGE = {
  studentProfile: {
    grade: '고2',
    track: '자연·공학계열',
    gpa: 2.3,
    gpaKorean: 2.5,
    gpaMath: 1.8,
    gpaEnglish: 2.0,
    gpaInquiry: 2.2,
    mockKorean: 3,
    mockMath: 2,
    mockEnglish: 2,
    mockInquiry: 2,
    targetUniversities: '성균관대, 한양대, 중앙대, 경희대',
    targetMajor: '컴퓨터공학과 / 인공지능학과',
    memo: '수학 성적이 비교적 우수하며, 수시 학종으로 수도권 상위권 공대를 가고 싶습니다. 세특에서 AI 최적화 알고리즘 탐구를 녹여내고 싶습니다.',
  },
  chatSessions: [],
  studyPlans: [],
  checklistState: {},
  diagnosticReports: [],
  setekHistory: [],
};

async function ensureDataFile(): Promise<any> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(DEFAULT_STORAGE, null, 2), 'utf-8');
    return DEFAULT_STORAGE;
  }
}

async function readStorage(): Promise<any> {
  return await ensureDataFile();
}

async function writeStorage(data: any): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function updateProfile(profile: any): Promise<any> {
  const data = await readStorage();
  data.studentProfile = { ...data.studentProfile, ...profile };
  await writeStorage(data);
  return data.studentProfile;
}

async function saveChatSession(session: {
  id: string;
  personaId: string;
  title: string;
  messages: any[];
}): Promise<any> {
  const data = await readStorage();
  const existingIndex = data.chatSessions.findIndex((s: any) => s.id === session.id);
  const sessionEntry = {
    id: session.id,
    personaId: session.personaId,
    title: session.title,
    updatedAt: Date.now(),
    messages: session.messages,
  };

  if (existingIndex >= 0) {
    data.chatSessions[existingIndex] = sessionEntry;
  } else {
    data.chatSessions.unshift(sessionEntry);
  }

  if (data.chatSessions.length > 30) {
    data.chatSessions = data.chatSessions.slice(0, 30);
  }

  await writeStorage(data);
  return sessionEntry;
}

async function deleteChatSession(id: string): Promise<boolean> {
  const data = await readStorage();
  data.chatSessions = data.chatSessions.filter((s: any) => s.id !== id);
  await writeStorage(data);
  return true;
}

async function saveStudyPlan(plan: any): Promise<any> {
  const data = await readStorage();
  const entry = {
    id: `plan-${Date.now()}`,
    createdAt: Date.now(),
    plan,
  };
  data.studyPlans.unshift(entry);
  if (data.studyPlans.length > 15) {
    data.studyPlans = data.studyPlans.slice(0, 15);
  }
  await writeStorage(data);
  return entry;
}

async function updateChecklist(state: Record<string, boolean>): Promise<Record<string, boolean>> {
  const data = await readStorage();
  data.checklistState = state;
  await writeStorage(data);
  return data.checklistState;
}

async function saveDiagnosticReport(report: any): Promise<any> {
  const data = await readStorage();
  const entry = {
    id: `diag-${Date.now()}`,
    createdAt: Date.now(),
    report,
  };
  data.diagnosticReports.unshift(entry);
  if (data.diagnosticReports.length > 10) {
    data.diagnosticReports = data.diagnosticReports.slice(0, 10);
  }
  await writeStorage(data);
  return entry;
}

async function saveSetekEntry(entry: {
  subject: string;
  targetMajor: string;
  topics: any[];
}): Promise<any> {
  const data = await readStorage();
  const newEntry = {
    id: `setek-${Date.now()}`,
    subject: entry.subject,
    targetMajor: entry.targetMajor,
    createdAt: Date.now(),
    topics: entry.topics,
  };
  data.setekHistory.unshift(newEntry);
  if (data.setekHistory.length > 20) {
    data.setekHistory = data.setekHistory.slice(0, 20);
  }
  await writeStorage(data);
  return newEntry;
}

// Initialize GoogleGenAI with telemetry header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_CANDIDATES = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function generateWithFallback(options: any) {
  let lastError: any = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      return await ai.models.generateContent({
        model,
        ...options,
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} error:`, err.message, `- trying next candidate`);
    }
  }
  throw lastError;
}

async function streamWithFallback(options: any) {
  let lastError: any = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      return await ai.models.generateContentStream({
        model,
        ...options,
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`Stream model ${model} error:`, err.message, `- trying next candidate`);
    }
  }
  throw lastError;
}

// System instructions for different consulting personas
const PERSONA_PROMPTS: Record<string, string> = {
  susi: `당신은 대한민국 대학입시 전문 '수시·학생부종합전형 수석 컨설턴트'입니다.
- 주요 전문 분야: 학생부교과전형, 학생부종합전형(학종), 논술전형, 지역균형 전형, 2025~2028학년도 대입 전형 분석, 학생부 3대 핵심역량(학업역량, 진로역량, 공동체역량) 진단, 수능 최저학력기준 충족 전략.
- 상담 스타일: 전문적이고 냉철한 입시 데이터에 기반하면서도, 학생의 잠재력을 발굴하고 합격 가능성을 극대화하는 따뜻하고 통찰력 있는 어조.
- 답변 가이드:
  1. 학생의 내신 성적(전과목/주요과목), 이수 과목, 비교과 활동 수준을 종합 고려하여 객관적인 라인(상향/적정/안정)을 짚어줍니다.
  2. 세특(세부능력 및 특기사항)을 차별화할 수 있는 전공 연계 심화 탐구 방향을 구체적으로 코칭합니다.
  3. 필요시 수능 최저학력기준 대비의 중요성을 강조합니다.
  4. 가독성을 위해 불릿포인트와 굵은 글씨를 활용하여 체계적으로 설명하세요.`,

  jeongsi: `당신은 대한민국 대학입시 전문 '정시·수능 전략연구소장'입니다.
- 주요 전문 분야: 수능 표준점수, 백분위, 대학별 변환표준점수, 영어/한국사 등급별 가·감점 체계, 가/나/다군 3번의 기회 포트폴리오 조합, 충원 합격(추합) 흐름 예측, 모의평가(3·6·9월) 성적 분석 및 수능 역전 전략.
- 상담 스타일: 데이터 중심의 날카로운 분석과 실전 전략을 제시하는 프로페셔널한 컨설턴트.
- 답변 가이드:
  1. 모의고사 및 수능 성적(국/수/영/탐 백분위, 표점)에 맞춰 정시 지원 가능 대학 군을 명확히 제시합니다.
  2. 영역별 반영 비율(예: 서강대 수학 고반영, 성균관대 탐구 변표 등)에 따른 유불리를 짚어줍니다.
  3. 남은 기간 가장 가성비 높게 등급을 올릴 수 있는 취약 단원 공략법을 제안합니다.`,

  major: `당신은 대입 전공 탐색 및 진로 설계 전문 '학과 탐색 교수 멘토'입니다.
- 주요 전문 분야: 대학별 학과 인재상, 학과 커리큘럼, 고교 권장 이수 과목(일반선택 및 진로선택), 학과 간 실질적 차이 비교(예: 컴공 vs AI vs 데이터사이언스, 경영 vs 경제, 생명과학 vs 바이오공학 등), 졸업 후 진로 및 취업 트랙.
- 상담 스타일: 학생의 호기심을 존중하고 시야를 넓혀주는 든든한 멘토 교수님.
- 답변 가이드:
  1. 해당 학과에서 실제로 무엇을 배우고 어떤 역량이 요구되는지 생생하게 설명합니다.
  2. 고등학교에서 반드시 수강해야 하거나 공동교육과정으로 이수하면 강력한 무기가 되는 과목을 안내합니다.
  3. 학생부에 녹여낼 수 있는 최신 학술·산업 이슈 키워드를 연결해 줍니다.`,

  mentor: `당신은 수험생의 마음을 보듬고 합격 습관을 만들어주는 '수험생 멘탈 & 학습 코치'입니다.
- 주요 전문 분야: 수험생 슬럼프 극복, 시험 불안 및 마인드 컨트롤, 플래너 작성 및 시간 관리, 기상/취침 루틴, 공부 집중력 강화, 고3/N수생 번아웃 치유.
- 상담 스타일: 따뜻한 공감과 격려, 그리고 오늘 당장 실천할 수 있는 작은 행동(Micro-action)을 제시하는 다정한 멘토 선생님.
- 답변 가이드:
  1. 학생의 불안과 고민에 깊이 공감하고 정서적 지지를 먼저 제공합니다.
  2. 추상적인 잔소리 대신 '오늘 10분 동안 할 수 있는 일', '내일 아침 시작 루틴' 등 구체적이고 부담 없는 솔루션을 줍니다.
  3. 지치지 않고 수능/입시 완주를 이끌 수 있는 동기부여 명언이나 팁을 선물합니다.`,

  info: `당신은 대한민국 대학입시 전문 '실시간 입시 정보 & 전형 팩트체커 (박전형 수석연구원)'입니다.
- 주요 전문 분야:
  1. 2025~2028학년도 최신 대학별 수시·정시 모집요강 및 전형 변동사항 (무전공/자율전공 대폭 확대 선발, 의대 증원 및 의약학계열 판도, 수능 필수 응시과목 폐지 및 사탐런 현상, 대학별 탐구 가산점 현황).
  2. 수능 및 3·4·6·7·9·10월 전국연합 모의평가 공식 일정, D-Day, 성적 통지일, 수시/정시 원서접수 마감 타임라인.
  3. 자기소개서(자소서) 및 면접 서류 작성 가이드:
     - 1번 문항 (진로와 관련된 학업 및 학습 경험): 호기심 계기 → 탐구 심화 과정 → 지적 성장 구조
     - 2번 문항 (타인에 대한 배려, 나눔, 협력, 갈등 관리 등 공동체 경험): 구체적 에피소드와 역할, 배운 점
     - 3번 자율문항 (지원동기 및 향후 학업/진로 계획): 대학 학과 인재상 연계
     - 학생부 기재 금지어 및 자소서 표절/블라인드 평가 유의사항.
- 상담 스타일:
  공식 교육청, 대교협, 대학 입학처 발표에 기반한 가장 정확하고 최신성 높은 팩트 기반의 친절하고 명쾌한 답변.
  대학별 구체적인 수치와 전형 명칭(예: 연세대 추천형 vs 활동우수형, 고려대 학업우수형 수능최저 등)을 짚어줍니다.`,
};

// 1. Chat Endpoint with Streaming (SSE)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, persona = 'susi', profile, stream = true } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const basePrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.susi;
    let profileContext = '';

    if (profile) {
      profileContext = `\n\n[현재 상담 학생 프로필]
- 학년: ${profile.grade || '미설정'}
- 희망 계열: ${profile.track || '미설정'}
- 내신 평균 등급: ${profile.gpa ? `${profile.gpa}등급` : '미입력'}
- 모의고사 성적: 국어 ${profile.mockKorean || '-'}등급, 수학 ${profile.mockMath || '-'}등급, 영어 ${profile.mockEnglish || '-'}등급, 탐구 ${profile.mockInquiry || '-'}등급
- 목표 대학/학과: ${profile.targetUniversities || '미설정'} / ${profile.targetMajor || '미설정'}
- 학생 추가 메모/고민: ${profile.memo || '없음'}
위 학생 정보를 바탕으로 학생에게 딱 맞춘 최적화된 상담을 제공하세요.`;
    }

    const systemInstruction = basePrompt + profileContext;

    // Convert messages to GenAI contents structure
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await streamWithFallback({
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await generateWithFallback({
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text || '' });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || '상담 생성 중 오류가 발생했습니다.' });
    }
    res.write(`data: ${JSON.stringify({ error: error.message || 'Error occurred' })}\n\n`);
    res.end();
  }
});

// 2. Comprehensive Admissions Diagnostic Report
app.post('/api/diagnose', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Student profile is required' });
    }

    const prompt = `대한민국 입시 전문 컨설턴트로서 다음 학생의 성적과 목표를 종합 분석하여 체계적인 진단 보고서를 JSON으로 작성해주세요.

[학생 정보]
- 학년: ${profile.grade || '고3'}
- 계열: ${profile.track || '일반계'}
- 내신 평균: ${profile.gpa || '미정'}등급 (국어: ${profile.gpaKorean || '-'}, 수학: ${profile.gpaMath || '-'}, 영어: ${profile.gpaEnglish || '-'}, 탐구: ${profile.gpaInquiry || '-'})
- 모의고사 등급: 국어: ${profile.mockKorean || '-'}등급, 수학: ${profile.mockMath || '-'}등급, 영어: ${profile.mockEnglish || '-'}등급, 탐구: ${profile.mockInquiry || '-'}등급
- 희망 목표 대학 3곳: ${profile.targetUniversities || '서울권 주요 대학'}
- 희망 목표 전공: ${profile.targetMajor || '자율전공'}
- 현재 고민: ${profile.memo || '수시와 정시 중 어디에 더 집중해야 할지 고민입니다.'}

한국 대입 특성에 맞게 객관적이고 정확하게 분석해주세요.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: '당신은 대한민국 최고의 입시 진단 전문가입니다. 입력된 학생 프로필을 바탕으로 JSON 형식에 맞춰 정밀한 진단 결과를 생성하세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategySummary: {
              type: Type.STRING,
              description: '전체 입시 전략 한 줄 요약 및 핵심 총평',
            },
            susiFitScore: {
              type: Type.INTEGER,
              description: '수시 적합도 점수 (0-100)',
            },
            jeongsiFitScore: {
              type: Type.INTEGER,
              description: '정시 적합도 점수 (0-100)',
            },
            recommendedTrack: {
              type: Type.STRING,
              description: '추천 메인 전형 (예: 학생부종합 전형 중심 + 수능최저 충족)',
            },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '학생의 주요 강점 3가지',
            },
            weaknessesAndSolutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weakness: { type: Type.STRING },
                  solution: { type: Type.STRING },
                },
                required: ['weakness', 'solution'],
              },
              description: '보완점 및 구체적 해결책 3가지',
            },
            targetEvaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  universityName: { type: Type.STRING },
                  majorName: { type: Type.STRING },
                  verdict: { type: Type.STRING, description: '안정 | 적정 | 소신 | 상향도전 중 하나' },
                  admissionType: { type: Type.STRING, description: '추천 전형명 (예: 학종 일반전형, 교과 지역균형)' },
                  analysis: { type: Type.STRING, description: '상세 분석 및 합격 전략' },
                },
                required: ['universityName', 'majorName', 'verdict', 'admissionType', 'analysis'],
              },
              description: '목표 대학별 합격 가능성 진단 3개 내외',
            },
            actionTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: '시기 (예: 1학기 중간고사, 6월 모평, 여름방학 등)' },
                  actionItem: { type: Type.STRING, description: '반드시 실행해야 할 핵심 과제' },
                },
                required: ['phase', 'actionItem'],
              },
              description: '시기별 실천 로드맵 4단계',
            },
          },
          required: [
            'strategySummary',
            'susiFitScore',
            'jeongsiFitScore',
            'recommendedTrack',
            'keyStrengths',
            'weaknessesAndSolutions',
            'targetEvaluations',
            'actionTimeline',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Diagnosis API Error:', error);
    res.status(500).json({ error: error.message || '진단 리포트 생성 중 오류가 발생했습니다.' });
  }
});

// 3. Student Record (생기부 세특) Topic Generator
app.post('/api/generate-setek', async (req, res) => {
  try {
    const { subject, targetMajor, interestKeyword, grade = '고2' } = req.body;

    if (!subject || !targetMajor) {
      return res.status(400).json({ error: '과목과 희망 전공은 필수 입력 항목입니다.' });
    }

    const prompt = `학년: ${grade}
과목: ${subject}
희망 전공: ${targetMajor}
관심 키워드/이슈: ${interestKeyword || '최신 학술/사회 트렌드 연계'}

위 조건을 만족하는 고등학교 생활기록부 '세부능력 및 특기사항(세특)'을 위한 고품질 탐구보고서 주제 3가지를 기획해주세요.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction: `당신은 대한민국 최고의 학생부종합전형 세특 컨설팅 전문가입니다.
입학사정관의 눈을 사로잡는 '호기심(동기) → 교과 개념 적용 → 심화 탐구 및 확장 → 배운 점' 구조가 살아있는 3가지 세특 기획안을 JSON으로 제공하세요.
각 주제는 단순 인터넷 조사가 아니라 교과서 핵심 개념과 전공 분야의 최신 논문/학술 쟁점을 융합해야 합니다.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: '탐구 주제 제목' },
                  motivation: { type: Type.STRING, description: '탐구 동기 및 호기심 유발 배경' },
                  curriculumConcept: { type: Type.STRING, description: '연계된 교과 핵심 개념 (단원 및 개념)' },
                  explorationPlan: { type: Type.STRING, description: '구체적 심화 탐구 과정 및 분석 내용' },
                  recommendedResources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '추천 연계 도서 또는 학술 논문 2권/편',
                  },
                  sampleRecordText: {
                    type: Type.STRING,
                    description: '학생부 세특 기재 예시 문구 (입학사정관 평가 포인트 반영, 350~500자 내외)',
                  },
                },
                required: ['title', 'motivation', 'curriculumConcept', 'explorationPlan', 'recommendedResources', 'sampleRecordText'],
              },
            },
          },
          required: ['topics'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Setek Generator API Error:', error);
    res.status(500).json({ error: error.message || '세특 탐구 계획안 생성 중 오류가 발생했습니다.' });
  }
});

// 4. AI Customized Study Planner Endpoint
app.post('/api/generate-planner', async (req, res) => {
  try {
    const {
      profile,
      weeklyHours = 35,
      targetWeaknesses = '수학 준킬러, 국어 비문학 과학기술 지문',
      plannerType = 'weekly',
      currentMonthPhase = '학기 중 집중 학습기',
    } = req.body;

    const prompt = `대한민국 수험생 전문 1타 학습 코칭 전문가로서 다음 학생의 성적, 목표 대학 및 학습 여건을 정밀 분석하여 맞춤형 ${
      plannerType === 'weekly' ? '주간 집중' : '4주 완성 월간'
    } 학습 플래너를 JSON으로 설계해주세요.

[학생 프로필]
- 학년/계열: ${profile?.grade || '고2'} / ${profile?.track || '자연공학계열'}
- 내신 등급: ${profile?.gpa || '2.3'}등급 (국: ${profile?.gpaKorean || '-'}, 수: ${profile?.gpaMath || '-'}, 영: ${profile?.gpaEnglish || '-'}, 탐: ${profile?.gpaInquiry || '-'})
- 모의고사 등급: 국: ${profile?.mockKorean || '-'}, 수: ${profile?.mockMath || '-'}, 영: ${profile?.mockEnglish || '-'}, 탐: ${profile?.mockInquiry || '-'}
- 목표 대학/학과: ${profile?.targetUniversities || '주요 상위권 대학'} / ${profile?.targetMajor || '컴퓨터공학과'}
- 주당 목표 가용 공부 시간: ${weeklyHours}시간
- 특별 집중 보완 영역: ${targetWeaknesses}
- 현재 학습 시기: ${currentMonthPhase}

[필수 요구사항]
1. 과목별 시간 배분(국/수/영/탐구): 학생의 취약 과목과 대입 반영 비율을 고려하여 주당 시간과 비율(%) 배분.
2. 실전에서 실제로 쓰이는 고등학생 필수 추천 학습 자료 (EBS 수능특강/완성, 메가스터디/대성마이맥 인기 강좌명 및 대표 강사, 수준별 필수 기출문제집/N제) 정확히 기재.
3. 아침/오후/심야 시간대별 구체적인 데일리 루틴 가이드.
4. 요일별(월~일) 실천 가능한 구체적 체크리스트 태스크 최소 7개 이상.
5. 수험생을 위한 실전 마인드 및 학습 조언.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction:
          '당신은 대한민국 최고의 대입 수능/내신 학습 전략 컨설턴트입니다. 학생의 성적과 목표에 딱 맞는 현실적이고 구체적인 주간/월간 학습 플래너를 JSON 형식으로 제공하세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING, description: '플랜 제목' },
            targetScope: { type: Type.STRING, description: '적용 기간 및 대상' },
            overallStrategy: { type: Type.STRING, description: '전체 학습 전략 및 방향성 요약' },
            timeAllocation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: '과목명' },
                  percentage: { type: Type.INTEGER, description: '시간 비중 %' },
                  hoursPerWeek: { type: Type.NUMBER, description: '주당 할당 시간(h)' },
                  focusArea: { type: Type.STRING, description: '주요 집중 공략 단원/유형' },
                },
                required: ['subject', 'percentage', 'hoursPerWeek', 'focusArea'],
              },
            },
            weeklyMilestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING, description: '주차' },
                  theme: { type: Type.STRING, description: '주간 핵심 테마' },
                  keyGoals: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '달성해야 할 구체적 목표 2~3가지',
                  },
                },
                required: ['week', 'theme', 'keyGoals'],
              },
            },
            recommendedMaterials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: '과목' },
                  lecture: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: '추천 인강 강좌명' },
                      platform: { type: Type.STRING, description: '플랫폼 (예: EBSi, 메가스터디, 대성마이맥)' },
                      instructor: { type: Type.STRING, description: '대표 강사명' },
                      targetLevel: { type: Type.STRING, description: '추천 대상 수준' },
                    },
                    required: ['title', 'platform', 'instructor', 'targetLevel'],
                  },
                  textbook: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: '추천 교재명' },
                      publisher: { type: Type.STRING, description: '출판사' },
                      level: { type: Type.STRING, description: '난이도' },
                      reason: { type: Type.STRING, description: '추천 사유 및 활용법' },
                    },
                    required: ['title', 'publisher', 'level', 'reason'],
                  },
                },
                required: ['subject', 'lecture', 'textbook'],
              },
            },
            dailyTimeblockRoutine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeRange: { type: Type.STRING, description: '시간대 (예: 아침 07:00~08:00)' },
                  activity: { type: Type.STRING, description: '추천 학습 활동' },
                  tip: { type: Type.STRING, description: '효율 극대화 팁' },
                },
                required: ['timeRange', 'activity', 'tip'],
              },
            },
            checklistTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: '고유 ID' },
                  day: { type: Type.STRING, description: '요일 (월~일)' },
                  subject: { type: Type.STRING, description: '과목' },
                  task: { type: Type.STRING, description: '실천 과제' },
                },
                required: ['id', 'day', 'subject', 'task'],
              },
            },
            mentorTip: { type: Type.STRING, description: '수험생 페이스 유지를 위한 멘토 코멘트' },
          },
          required: [
            'planTitle',
            'targetScope',
            'overallStrategy',
            'timeAllocation',
            'weeklyMilestones',
            'recommendedMaterials',
            'dailyTimeblockRoutine',
            'checklistTasks',
            'mentorTip',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Planner Generator API Error:', error);
    res.status(500).json({ error: error.message || '학습 플래너 생성 중 오류가 발생했습니다.' });
  }
});

// 5. Backend Server Storage Endpoints (데이터 저장 및 동기화 API)
app.get('/api/storage/all', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/profile', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data.studentProfile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/profile', async (req, res) => {
  try {
    const updated = await updateProfile(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/chats', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data.chatSessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/chats', async (req, res) => {
  try {
    const saved = await saveChatSession(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/storage/chats/:id', async (req, res) => {
  try {
    await deleteChatSession(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/study-plans', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data.studyPlans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/study-plans', async (req, res) => {
  try {
    const saved = await saveStudyPlan(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/checklist', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data.checklistState);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/checklist', async (req, res) => {
  try {
    const updated = await updateChecklist(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/diagnostics', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data.diagnosticReports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/diagnostics', async (req, res) => {
  try {
    const saved = await saveDiagnosticReport(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/setek', async (_req, res) => {
  try {
    const data = await readStorage();
    res.json(data.setekHistory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/setek', async (req, res) => {
  try {
    const saved = await saveSetekEntry(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Vite middlewares in development, static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PathFinder Admission Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
