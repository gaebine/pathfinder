import {
  StudentProfile,
  ChatMessage,
  ConsultantPersonaId,
  StudyPlannerData,
  DiagnosisReport,
  SetekTopic,
} from '../types/admission';

export interface SavedChatSession {
  id: string;
  personaId: ConsultantPersonaId;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface SavedStudyPlanEntry {
  id: string;
  createdAt: number;
  plan: StudyPlannerData;
}

export interface SavedDiagnosticEntry {
  id: string;
  createdAt: number;
  report: DiagnosisReport;
}

export interface SavedSetekEntry {
  id: string;
  subject: string;
  targetMajor: string;
  createdAt: number;
  topics: SetekTopic[];
}

export interface BackendStorageState {
  studentProfile: StudentProfile;
  chatSessions: SavedChatSession[];
  studyPlans: SavedStudyPlanEntry[];
  checklistState: Record<string, boolean>;
  diagnosticReports: SavedDiagnosticEntry[];
  setekHistory: SavedSetekEntry[];
}

// 1. Fetch all backend server storage
export async function fetchServerStorageAll(): Promise<BackendStorageState | null> {
  try {
    const res = await fetch('/api/storage/all');
    if (!res.ok) throw new Error('서버 데이터를 불러오지 못했습니다.');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch server storage:', err);
    return null;
  }
}

// 2. Profile APIs
export async function fetchServerProfile(): Promise<StudentProfile | null> {
  try {
    const res = await fetch('/api/storage/profile');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch server profile:', err);
    return null;
  }
}

export async function saveServerProfile(profile: StudentProfile): Promise<StudentProfile | null> {
  try {
    const res = await fetch('/api/storage/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('서버 프로필 저장 실패');
    return await res.json();
  } catch (err) {
    console.error('Failed to save server profile:', err);
    return null;
  }
}

// 3. Chat Session APIs
export async function fetchServerChats(): Promise<SavedChatSession[]> {
  try {
    const res = await fetch('/api/storage/chats');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch server chats:', err);
    return [];
  }
}

export async function saveServerChatSession(session: {
  id: string;
  personaId: string;
  title: string;
  messages: ChatMessage[];
}): Promise<any> {
  try {
    const res = await fetch('/api/storage/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save chat session:', err);
    return null;
  }
}

export async function deleteServerChatSession(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/storage/chats/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete chat session:', err);
    return false;
  }
}

// 4. Study Plan APIs
export async function fetchServerStudyPlans(): Promise<SavedStudyPlanEntry[]> {
  try {
    const res = await fetch('/api/storage/study-plans');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function saveServerStudyPlan(plan: StudyPlannerData): Promise<any> {
  try {
    const res = await fetch('/api/storage/study-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to save study plan on server:', err);
    return null;
  }
}

// 5. Checklist APIs
export async function fetchServerChecklist(): Promise<Record<string, boolean>> {
  try {
    const res = await fetch('/api/storage/checklist');
    if (!res.ok) return {};
    return await res.json();
  } catch (err) {
    return {};
  }
}

export async function saveServerChecklist(state: Record<string, boolean>): Promise<any> {
  try {
    const res = await fetch('/api/storage/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

// 6. Diagnostic Report APIs
export async function saveServerDiagnostic(report: DiagnosisReport): Promise<any> {
  try {
    const res = await fetch('/api/storage/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

// 7. Setek APIs
export async function saveServerSetek(entry: {
  subject: string;
  targetMajor: string;
  topics: SetekTopic[];
}): Promise<any> {
  try {
    const res = await fetch('/api/storage/setek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}
