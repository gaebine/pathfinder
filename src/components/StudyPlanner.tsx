import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  StudyPlannerData,
  StudyPlanChecklistTask,
} from '../types/admission';
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  Video,
  Clock,
  CheckCircle2,
  CheckSquare,
  Square,
  Award,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Sliders,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Target,
  ListTodo,
} from 'lucide-react';
import {
  fetchServerStudyPlans,
  saveServerStudyPlan,
  fetchServerChecklist,
  saveServerChecklist,
} from '../services/backendStorage';

interface Props {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onConsultWithPlan: (prompt: string) => void;
}

const COMMON_WEAKNESS_TAGS = [
  '수학 준킬러·킬러 문제해결',
  '수학 미적분 계산 실수 방지',
  '국어 독서(비문학) 과학·경제 지문',
  '국어 문학 시간 단축 및 보기 분석',
  '영어 빈칸추론(31~34번) 및 순서삽입',
  '과탐 타임어택 및 기출 킬러',
  '사탐 고난도 개념 낚시 선지 정복',
];

export const StudyPlanner: React.FC<Props> = ({
  profile,
  onOpenProfile,
  onConsultWithPlan,
}) => {
  const [plannerType, setPlannerType] = useState<'weekly' | 'monthly'>('weekly');
  const [weeklyHours, setWeeklyHours] = useState<number>(35);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([
    '수학 준킬러·킬러 문제해결',
    '국어 독서(비문학) 과학·경제 지문',
  ]);
  const [customWeakness, setCustomWeakness] = useState<string>('');
  const [currentMonthPhase, setCurrentMonthPhase] = useState<string>('학기 중 집중 학습기');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plannerData, setPlannerData] = useState<StudyPlannerData | null>(() => {
    try {
      const saved = localStorage.getItem('pathfinder_study_plan');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [checklist, setChecklist] = useState<StudyPlanChecklistTask[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync checklist when plannerData changes
  useEffect(() => {
    if (plannerData?.checklistTasks) {
      // Check if user has saved completion state
      const savedState = localStorage.getItem('pathfinder_checklist_state');
      if (savedState) {
        try {
          const completedMap: Record<string, boolean> = JSON.parse(savedState);
          setChecklist(
            plannerData.checklistTasks.map((t) => ({
              ...t,
              completed: !!completedMap[t.id],
            }))
          );
          return;
        } catch (e) {}
      }
      setChecklist(
        plannerData.checklistTasks.map((t) => ({
          ...t,
          completed: false,
        }))
      );
    }
  }, [plannerData]);

  // Load saved plan and checklist from backend server on initial load
  useEffect(() => {
    async function loadFromServer() {
      const [plans, savedChecklist] = await Promise.all([
        fetchServerStudyPlans(),
        fetchServerChecklist(),
      ]);
      if (plans && plans.length > 0) {
        setPlannerData(plans[0].plan);
      }
      if (savedChecklist && Object.keys(savedChecklist).length > 0) {
        setChecklist((prev) =>
          prev.map((t) => ({
            ...t,
            completed: !!savedChecklist[t.id],
          }))
        );
      }
    }
    loadFromServer();
  }, []);

  const toggleChecklistTask = async (taskId: string) => {
    const updated = checklist.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setChecklist(updated);

    // Save checklist completed state to localStorage and backend server
    const completedMap: Record<string, boolean> = {};
    updated.forEach((t) => {
      if (t.completed) completedMap[t.id] = true;
    });
    localStorage.setItem('pathfinder_checklist_state', JSON.stringify(completedMap));
    await saveServerChecklist(completedMap);
  };

  const handleToggleWeaknessTag = (tag: string) => {
    if (selectedWeaknesses.includes(tag)) {
      setSelectedWeaknesses(selectedWeaknesses.filter((t) => t !== tag));
    } else {
      setSelectedWeaknesses([...selectedWeaknesses, tag]);
    }
  };

  const handleAddCustomWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWeakness.trim() && !selectedWeaknesses.includes(customWeakness.trim())) {
      setSelectedWeaknesses([...selectedWeaknesses, customWeakness.trim()]);
      setCustomWeakness('');
    }
  };

  const handleGeneratePlanner = async () => {
    setIsLoading(true);
    setError(null);

    const weaknessesString = selectedWeaknesses.join(', ');

    try {
      const response = await fetch('/api/generate-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          weeklyHours,
          targetWeaknesses: weaknessesString,
          plannerType,
          currentMonthPhase,
        }),
      });

      if (!response.ok) {
        throw new Error('플래너 추천 생성 중 오류가 발생했습니다.');
      }

      const data: StudyPlannerData = await response.json();
      setPlannerData(data);
      localStorage.setItem('pathfinder_study_plan', JSON.stringify(data));
      localStorage.removeItem('pathfinder_checklist_state');
      await saveServerStudyPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '플래너 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy planner summary text
  const handleCopyPlan = () => {
    if (!plannerData) return;
    const text = `[PathFinder AI 맞춤형 학습 플래너]
제목: ${plannerData.planTitle}
목표 대상: ${plannerData.targetScope}
전략: ${plannerData.overallStrategy}

[과목별 시간 배분]
${plannerData.timeAllocation
  .map((t) => `- ${t.subject}: ${t.percentage}% (주 ${t.hoursPerWeek}시간) - ${t.focusArea}`)
  .join('\n')}

[추천 인강 및 교재]
${plannerData.recommendedMaterials
  .map(
    (m) =>
      `- [${m.subject}] 인강: ${m.lecture.platform} ${m.lecture.instructor}T (${m.lecture.title}) / 교재: ${m.textbook.title} (${m.textbook.reason})`
  )
  .join('\n')}

[주간 실천 과제]
${checklist.map((c) => `[${c.completed ? 'V' : ' '}] (${c.day}) [${c.subject}] ${c.task}`).join('\n')}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = checklist.filter((t) => t.completed).length;
  const progressPercent =
    checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Intro Header & Setup Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  AI 1타 코칭 알고리즘
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {profile.grade} · 내신 {profile.gpa || '-'}등급 · 모평 {profile.mockMath || '-'}등급
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                AI 기반 맞춤형 학습 플래너 & 추천 교재·인강
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>성적 변경</span>
            </button>
            <button
              onClick={handleGeneratePlanner}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>맞춤 플래너 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{plannerData ? '플래너 다시 생성' : 'AI 맞춤 플래너 생성'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* 1. Mode */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              플래너 기간 단위
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPlannerType('weekly')}
                className={`py-1.5 rounded-lg font-bold transition-all text-center ${
                  plannerType === 'weekly'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1주일 집중 플랜
              </button>
              <button
                type="button"
                onClick={() => setPlannerType('monthly')}
                className={`py-1.5 rounded-lg font-bold transition-all text-center ${
                  plannerType === 'monthly'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4주 완성 마스터
              </button>
            </div>
          </div>

          {/* 2. Weekly Hours Slider */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                주당 목표 순공 시간
              </span>
              <span className="font-bold text-indigo-600">{weeklyHours}시간 (일 평균 {(weeklyHours / 7).toFixed(1)}h)</span>
            </div>
            <input
              type="range"
              min="15"
              max="70"
              step="5"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* 3. Season / Phase */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
              현재 학습 시기
            </label>
            <select
              value={currentMonthPhase}
              onChange={(e) => setCurrentMonthPhase(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="학기 중 집중 학습기">학기 중 내신+수능 병행기</option>
              <option value="시험 직전 집중기 (내신/모평)">시험 직전 총정리 (D-30)</option>
              <option value="방학 집중 완성기">방학 취약점 완성 몰입기</option>
              <option value="수능 파이널 실전 모의고사기">수능 파이널 실모 & 킬러 정복기</option>
            </select>
          </div>
        </div>

        {/* 4. Weakness Tags Selection */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            집중 보완 희망 영역 (클릭하여 선택하거나 직접 추가)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_WEAKNESS_TAGS.map((tag) => {
              const isSelected = selectedWeaknesses.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleWeaknessTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomWeakness} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={customWeakness}
              onChange={(e) => setCustomWeakness(e.target.value)}
              placeholder="직접 취약 영역 입력 (예: 화학 양적계산, 영어 어법)"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={!customWeakness.trim()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 disabled:bg-slate-300"
            >
              추가
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-24 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-48 bg-slate-100 rounded-xl"></div>
        </div>
      )}

      {/* Main Plan Results */}
      {plannerData && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* 1. Header Banner & Overall Strategy */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  {plannerData.targetScope}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {plannerData.planTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPlan}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">복사 완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>플랜 전체 복사</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    onConsultWithPlan(
                      `방금 AI 맞춤형 학습 플래너("${plannerData.planTitle}")를 추천받았습니다. 전략은 "${plannerData.overallStrategy}"입니다. 이 플랜을 토대로 수험 생활 일과 시간 관리나 인강 완강 팁을 더 구체적으로 코칭받고 싶습니다.`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>최멘토 쌤과 1:1 상담</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              💡 {plannerData.overallStrategy}
            </p>
          </div>

          {/* 2. Subject Time Allocation Cards */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              과목별 최적 시간 배분 가이드 (주 {weeklyHours}시간 기준)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {plannerData.timeAllocation.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{item.subject}</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mt-1">
                      주 {item.hoursPerWeek}시간
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/70">
                    🎯 {item.focusArea}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recommended Materials: Online Lectures & Textbooks */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  과목별 1타 인강 강좌 & 필수 교재 매칭
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  내신과 수능에서 검증된 대표 강사진 강좌 및 수준별 실전 교재 추천
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plannerData.recommendedMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                      {mat.subject}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      수준: {mat.lecture.targetLevel}
                    </span>
                  </div>

                  {/* Lecture Box */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold">
                      <Video className="w-3.5 h-3.5" />
                      <span>추천 인강: [{mat.lecture.platform}] {mat.lecture.instructor}T</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      "{mat.lecture.title}"
                    </div>
                  </div>

                  {/* Textbook Box */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>추천 교재: {mat.textbook.title} ({mat.textbook.publisher})</span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-snug">
                      📖 {mat.textbook.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Weekly Milestones & Daily Timeblock Routine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Milestones */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                단계별 핵심 학습 마일스톤
              </h4>
              <div className="space-y-3">
                {plannerData.weeklyMilestones.map((m, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                      <span>{m.week}</span>
                      <span className="text-slate-600 font-medium">{m.theme}</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {m.keyGoals.map((goal, gIdx) => (
                        <li key={gIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Routine Timeblock */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                시간대별 추천 일일 순공 루틴
              </h4>
              <div className="space-y-2.5">
                {plannerData.dailyTimeblockRoutine.map((block, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>⏰ {block.timeRange}</span>
                      <span className="text-indigo-600 font-semibold">{block.activity}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      💡 {block.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Interactive Weekly Checklist (Checkable by student) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-600" />
                  이번 주 실천 체크리스트 (Interactive Tracker)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  오늘 달성한 과제를 직접 체크하세요. 브라우저에 저장되어 매일 확인할 수 있습니다.
                </p>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    달성률: {progressPercent}%
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    ({completedCount}/{checklist.length} 완료)
                  </span>
                </div>
                <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {checklist.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleChecklistTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    task.completed
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                        {task.day}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {task.subject}
                      </span>
                    </div>
                    <span
                      className={`leading-relaxed font-medium ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.task}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mentor Encouragement Tip */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs flex items-start gap-2.5 text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">최멘토 코치의 페이스메이커 조언:</span>
                <span className="leading-relaxed">{plannerData.mentorTip}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
