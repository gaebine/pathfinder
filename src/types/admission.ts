export type ConsultantPersonaId = 'susi' | 'jeongsi' | 'major' | 'mentor' | 'info';

export interface PersonaInfo {
  id: ConsultantPersonaId;
  name: string;
  title: string;
  badge: string;
  badgeColor: string;
  avatarIcon: string;
  description: string;
  expertise: string[];
  recommendedPrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  personaId?: ConsultantPersonaId;
  isStreaming?: boolean;
}

export interface StudentProfile {
  grade: '고1' | '고2' | '고3' | 'N수';
  track: string;
  gpa: number | '';
  gpaKorean: number | '';
  gpaMath: number | '';
  gpaEnglish: number | '';
  gpaInquiry: number | '';
  mockKorean: number | '';
  mockMath: number | '';
  mockEnglish: number | '';
  mockInquiry: number | '';
  targetUniversities: string;
  targetMajor: string;
  memo: string;
}

export interface DiagnosisReport {
  strategySummary: string;
  susiFitScore: number;
  jeongsiFitScore: number;
  recommendedTrack: string;
  keyStrengths: string[];
  weaknessesAndSolutions: Array<{
    weakness: string;
    solution: string;
  }>;
  targetEvaluations: Array<{
    universityName: string;
    majorName: string;
    verdict: string;
    admissionType: string;
    analysis: string;
  }>;
  actionTimeline: Array<{
    phase: string;
    actionItem: string;
  }>;
}

export interface SetekTopic {
  title: string;
  motivation: string;
  curriculumConcept: string;
  explorationPlan: string;
  recommendedResources: string[];
  sampleRecordText: string;
}

export interface UniversityInfo {
  id: string;
  name: string;
  region: '서울' | '수도권' | '지방거점' | '과학기술원';
  category: string;
  avgGradeCut: string;
  susiTip: string;
  jeongsiTip: string;
  tags: string[];
}

export interface AdmissionMilestone {
  date: string;
  title: string;
  dDayText: string;
  category: '수시' | '정시' | '모의고사' | '원서접수' | '수능';
  description: string;
}

export interface StudyPlanMaterial {
  subject: string;
  lecture: {
    title: string;
    platform: string;
    instructor: string;
    targetLevel: string;
  };
  textbook: {
    title: string;
    publisher: string;
    level: string;
    reason: string;
  };
}

export interface StudyPlanTimeAllocation {
  subject: string;
  percentage: number;
  hoursPerWeek: number;
  focusArea: string;
}

export interface StudyPlanMilestone {
  week: string;
  theme: string;
  keyGoals: string[];
}

export interface StudyPlanDailyBlock {
  timeRange: string;
  activity: string;
  tip: string;
}

export interface StudyPlanChecklistTask {
  id: string;
  day: string;
  subject: string;
  task: string;
  completed?: boolean;
}

export interface StudyPlannerData {
  planTitle: string;
  targetScope: string;
  overallStrategy: string;
  timeAllocation: StudyPlanTimeAllocation[];
  weeklyMilestones: StudyPlanMilestone[];
  recommendedMaterials: StudyPlanMaterial[];
  dailyTimeblockRoutine: StudyPlanDailyBlock[];
  checklistTasks: StudyPlanChecklistTask[];
  mentorTip: string;
}
