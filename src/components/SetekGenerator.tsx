import React, { useState } from 'react';
import { StudentProfile, SetekTopic } from '../types/admission';
import { saveServerSetek } from '../services/backendStorage';
import {
  FileText,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface Props {
  profile: StudentProfile;
  onConsultWithTopic: (topic: string) => void;
}

const COMMON_SUBJECTS = [
  '수학I',
  '수학II',
  '미적분',
  '확률과 통계',
  '물리학I',
  '물리학II',
  '화학I',
  '생명과학I',
  '지구과학I',
  '통합사회',
  '경제',
  '사회·문화',
  '생활과 윤리',
  '정치와 법',
  '국어 / 독서',
  '영어 독해와 작문',
  '인공지능 기초',
  '정보',
];

export const SetekGenerator: React.FC<Props> = ({ profile, onConsultWithTopic }) => {
  const [subject, setSubject] = useState<string>('수학II');
  const [targetMajor, setTargetMajor] = useState<string>(profile.targetMajor || '컴퓨터공학과');
  const [interestKeyword, setInterestKeyword] = useState<string>('머신러닝 최적화 및 경사하강법');
  const [grade, setGrade] = useState<string>(profile.grade || '고2');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [topics, setTopics] = useState<SetekTopic[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !targetMajor) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-setek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          targetMajor,
          interestKeyword,
          grade,
        }),
      });

      if (!response.ok) {
        throw new Error('세특 탐구 계획안 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      if (data.topics && Array.isArray(data.topics)) {
        setTopics(data.topics);
        await saveServerSetek({ subject, targetMajor, topics: data.topics });
      } else {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '생기부 세특 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDraft = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              학종 합격의 열쇠, AI 생기부 세특 탐구 기획기
            </h2>
            <p className="text-xs text-slate-500">
              단순 지식 나열이 아닌 '호기심 → 교과 개념 융합 → 심화 탐구 → 성찰'의 학생부종합전형 평가 기준에 맞춘 세특 보고서를 기획합니다.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
              >
                <option value="고1">고1 (공통과목 중심)</option>
                <option value="고2">고2 (일반선택 중심)</option>
                <option value="고3">고3 (진로선택·심화과목)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">탐구 교과목</label>
              <input
                type="text"
                list="subjects-list"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="과목 선택 또는 직접 입력"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                required
              />
              <datalist id="subjects-list">
                {COMMON_SUBJECTS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Target Major */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">희망 진로/학과</label>
              <input
                type="text"
                value={targetMajor}
                onChange={(e) => setTargetMajor(e.target.value)}
                placeholder="예: 컴퓨터공학, 의예과, 경영학"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                required
              />
            </div>

            {/* Interest Keyword */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                관심 이슈 / 키워드
              </label>
              <input
                type="text"
                value={interestKeyword}
                onChange={(e) => setInterestKeyword(e.target.value)}
                placeholder="예: AI 모델 경량화, 기후 변화 모델"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>교과서 단원 내용과 지원 전공의 최신 학술 쟁점이 융합된 주제가 생성됩니다.</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !subject || !targetMajor}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-semibold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? '세특 기획안 작성 중...' : '3가지 심화 세특 기획하기'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Topics Display */}
      {topics.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>추천 심화 탐구 세특 기획안</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                총 {topics.length}개
              </span>
            </h3>
            <span className="text-xs text-slate-400">
              담당 교과 선생님과 상담 후 탐구보고서를 진행하세요.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {topics.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-purple-200 transition-all space-y-4"
              >
                {/* Title & Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md inline-block mb-1.5">
                      탐구 주제 {idx + 1} · {subject} 연계
                    </span>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      onConsultWithTopic(
                        `제가 학교 세특으로 '${item.title}' 주제를 탐구하려고 합니다. 교과 개념은 '${item.curriculumConcept}'이고, 희망 전공은 '${targetMajor}'입니다. 입학사정관에게 좋은 평가를 받기 위해 구체적인 실험이나 보고서 목차를 어떻게 잡으면 좋을까요?`
                      )
                    }
                    className="self-start sm:self-center shrink-0 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>AI 컨설턴트에게 질문</span>
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 block">💡 탐구 동기 및 배경</span>
                    <p className="text-slate-600 leading-relaxed">{item.motivation}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 block">📐 교과 연계 핵심 개념</span>
                    <p className="text-slate-600 leading-relaxed">{item.curriculumConcept}</p>
                  </div>
                </div>

                {/* Exploration Plan */}
                <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100/60 text-xs space-y-1">
                  <span className="font-bold text-purple-900 block">🔬 구체적 심화 탐구 및 분석 계획</span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.explorationPlan}
                  </p>
                </div>

                {/* Recommended Reading */}
                {item.recommendedResources && item.recommendedResources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      연계 도서·논문:
                    </span>
                    {item.recommendedResources.map((res, rIdx) => (
                      <span
                        key={rIdx}
                        className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px]"
                      >
                        📖 {res}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sample Record Text (생기부 기재 예시) */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-[11px] text-purple-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      학생부 세특 기재 예시 문구 (선생님 제출 및 참고용)
                    </span>
                    <button
                      onClick={() => handleCopyDraft(item.sampleRecordText, idx)}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded transition-colors"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>문구 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-[12.5px] whitespace-pre-line bg-black/20 p-3 rounded-lg border border-white/5">
                    {item.sampleRecordText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
